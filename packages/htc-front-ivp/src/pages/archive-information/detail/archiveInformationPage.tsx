import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Button, Form, Output, Upload, Modal, Icon, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import queryString from 'query-string';
// import { openTab } from 'utils/menuTab';
import {
  getCurrentEmployeeInfo,
  getTenantAgreementCompany,
} from '@htccommon/services/commonService';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import InvoiceChildSwitchPage from '@src/utils/invoiceChildSwitch/invoiceChildSwitchPage';
import formatterCollections from 'utils/intl/formatterCollections';
import style from '../archiveInformation.model.less';

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface ArchiveUploadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
const modelCode = 'hivp.invoicesArchiveUpload';
const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;
const acceptType = ['.pdf', '.jpg', '.png', '.ofd'];
@formatterCollections({
  code: [modelCode, 'hivp.invoicesArchiveUpload', 'htc.common', 'hivp.batchCheck'],
})
export default class ArchiveInformationPage extends Component<ArchiveUploadPageProps> {
  state = {
    companyDesc: '',
    companyId: '',
    companyCode: '',
    employeeNum: '',
    btnFlag: '',
    loadingFlag: false,
    backPath: '',
    uploadTempFile: {} as File,
    currentEmp: {},
    inChannelCode: '',
  };

  invoiceDS = new DataSet({
    autoQuery: false,
    ...SubPageInvoicesHeadersDS({
      invoicePoolHeaderId: this.props.match.params.sourceHeaderId,
    }),
  });

  singleUpload;

  singleIsCheck;

  mutipleUploadUuid;

  saveSingleUpload = node => {
    this.singleUpload = node;
  };

  async componentDidMount() {
    if (this.props.match.params.sourceCode === 'BILL_POOL') {
      this.invoiceDS = new DataSet({
        autoQuery: false,
        ...SubPageBillHeadersDS({
          billPoolHeaderId: this.props.match.params.sourceHeaderId,
        }),
      });
    }
    await this.invoiceDS.query();

    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const params = { tenantId, companyId: invoiceInfo.companyId };
      getTenantAgreementCompany(params).then(resCom => {
        if (resCom) {
          this.setState({ inChannelCode: resCom.inChannelCode });
        }
      });
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId: invoiceInfo.companyId });
      const currentEmp = empRes && empRes.content[0];
      this.setState({
        companyDesc: `${currentEmp.companyCode}-${currentEmp.companyName}`,
        companyId: invoiceInfo.companyId,
        companyCode: currentEmp.companyCode,
        employeeNum: currentEmp && currentEmp.employeeNum,
        backPath: invoiceInfo.backPath,
        currentEmp,
      });
    }
  }

  // 单票上传
  @Bind()
  handleSingleUpload() {
    this.singleIsCheck = 'Y';
    this.singleUpload.startUpload();
    if (this.singleUpload.fileList.length > 0) {
      this.setState({ btnFlag: 'S', loadingFlag: true });
    }
  }

  handleUploadSuccess = response => {
    const { btnFlag } = this.state;
    if (btnFlag === 'S') {
      // 单个文件
      try {
        const resp = JSON.parse(response);
        if (resp.failed && resp.code === 'H1025') {
          const title = intl
            .get(`${modelCode}.view.uploadConfirm`)
            .d('OCR识别信息与发票信息不一致，是否继续上传？');
          Modal.confirm({
            key: Modal.key,
            title,
          }).then(button => {
            if (button === 'ok') {
              this.singleIsCheck = 'N';
              this.singleUpload.startUpload();
            } else {
              this.setState({ btnFlag: '', loadingFlag: false });
            }
          });
        } else {
          const res = getResponse(resp);
          if (res) {
            notification.success({
              description: '',
              message: res.message,
            });
          }
          this.invoiceDS.query().then(() => {
            this.setState({ btnFlag: '', loadingFlag: false, uploadTempFile: {} });
          });
        }
      } catch (err) {
        notification.error({
          description: err.message,
          message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
        });
        this.setState({ btnFlag: '', loadingFlag: false, uploadTempFile: {} });
      }
    }
  };

  handleUploadError = response => {
    this.setState({ btnFlag: '', loadingFlag: false, uploadTempFile: {} });
    notification.error({
      description: '',
      message: response,
    });
  };

  // 查看档案
  @Bind()
  handleGotoArchiveView() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { history } = this.props;
    const pathname =
      sourceCode === 'BILL_POOL'
        ? `/htc-front-ivp/bills/archive-view/${sourceCode}/${sourceHeaderId}`
        : `/htc-front-ivp/invoices/archive-view/${sourceCode}/${sourceHeaderId}`;
    console.log('pathname', pathname);
    history.push(pathname);
    // openTab({
    //   key: pathname,
    //   path: pathname,
    //   title: intl.get(`${modelCode}.path.viewArchives`).d('查看档案'),
    //   closable: true,
    //   type: 'menu',
    // });
  }

  // 上传档案文件变化
  @Bind()
  handleFileChange(fileList) {
    this.setState({
      uploadTempFile: fileList[0],
    });
  }

  /**
   * 档案归档
   * @returns
   */
  @Bind()
  handleGotoFileArchive() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    if (!sourceHeaderId) return;
    const { pathname, search } = this.props.location;
    if (sourceCode === 'BILL_POOL') {
      const comParams = {
        pathname: `/htc-front-ivp/bills/bill-archive/${sourceCode}`,
        otherSearch: {
          sourceHeaderIds: sourceHeaderId,
          backPath: pathname + search,
        },
      };
      this.goToByQueryParams(comParams);
    } else {
      const comParams = {
        pathname: `/htc-front-ivp/invoices/file-archive/${sourceCode}`,
        otherSearch: {
          sourceHeaderIds: sourceHeaderId,
          backPath: pathname + search,
        },
      };
      this.goToByQueryParams(comParams);
    }
  }

  // 跳转通用参数
  @Bind()
  goToByQueryParams(comParams) {
    const { dispatch } = this.props;
    const { inChannelCode } = this.state;

    const curQueryInfo: any = this.state.currentEmp;
    const employeeDesc = `${curQueryInfo.companyCode}-${curQueryInfo.employeeNum}-${curQueryInfo.employeeName}-${curQueryInfo.mobile}`;
    dispatch(
      routerRedux.push({
        pathname: comParams.pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              companyDesc: `${curQueryInfo.companyCode}-${curQueryInfo.companyName}`,
              companyCode: curQueryInfo.companyCode,
              companyName: curQueryInfo.companyName,
              companyId: curQueryInfo.companyId,
              employeeDesc,
              email: curQueryInfo.email,
              employeeId: curQueryInfo.employeeId,
              employeeNumber: curQueryInfo.employeeNum,
              inChannelCode,
              ...comParams.otherSearch,
            })
          ),
        }),
      })
    );
  }

  render() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const {
      companyDesc,
      companyId,
      companyCode,
      employeeNum,
      btnFlag,
      loadingFlag,
      backPath,
    } = this.state;
    const state = window.dvaApp._store.getState();
    const { global } = state;
    const { activeTabKey } = global;
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: () => ({
        companyId,
        companyCode,
        employeeNo: employeeNum,
        sourceCode,
        invoicePoolHeaderId: sourceHeaderId,
        uuid: this.mutipleUploadUuid,
        isCheck: this.singleIsCheck,
      }),
      multiple: false,
      uploadImmediately: false,
      showUploadBtn: false,
      showPreviewImage: true,
      partialUpload: false,
      id: `upload${this.props.match.params.sourceHeaderId}${subTabKey}`,
      onFileChange: this.handleFileChange,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const customPanelStyle = {
      background: '#fff',
      overflow: 'hidden',
      borderBottom: '8px solid #F6F6F6',
    };
    return (
      <>
        <Header backPath={backPath} title={intl.get(`${modelCode}.view.title`).d('档案信息')} />
        <Content style={{ background: '#F6F6F6' }}>
          <Spin dataSet={this.invoiceDS}>
            <Collapse bordered={false} defaultActiveKey={['HEADER', 'record']}>
              <Panel
                header={intl.get(`${modelCode}.title.invoiceHeader`).d('票据基础信息')}
                key="HEADER"
                style={customPanelStyle}
              >
                <Form dataSet={this.invoiceDS} columns={3}>
                  <Output
                    value={companyDesc}
                    label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                  />
                  <Output
                    value={moment().format(DEFAULT_DATE_FORMAT)}
                    label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
                  />

                  {sourceCode === 'BILL_POOL' ? (
                    <Output name="billType" />
                  ) : (
                    <Output name="invoiceType" />
                  )}
                  {sourceCode === 'BILL_POOL' ? '' : <Output name="inOutType" />}
                  <Output name="invoiceDate" />
                  <Output name="buyerName" />
                  <Output name="invoiceCode" />
                  <Output name="invoiceNo" />
                  <Output name="salerName" />
                  <Output name="invoiceAmount" />
                  <Output name="totalAmount" />
                  <Output name="fileName" />
                </Form>
              </Panel>
              <Panel
                header={intl.get(`${modelCode}.view.title`).d('档案信息')}
                key="record"
                style={customPanelStyle}
              >
                <div style={{ display: 'flex' }}>
                  {/* eslint-disable */}
                  <label
                    htmlFor={`upload${this.props.match.params.sourceHeaderId}${subTabKey}`}
                    className={style.uploadContainer}
                  >
                    <Icon type="backup-o" className={style.icon} />
                    <p>
                      {intl.get(`${modelCode}.button.uploadDescribe`).d('点击选择单个档案文件')}
                    </p>
                  </label>
                  {/* eslint-enable */}
                  {this.state.uploadTempFile.name && (
                    <div
                      className={style.uploadContainer}
                      style={{ borderStyle: 'solid', marginLeft: '24px' }}
                    >
                      <Icon type="insert_drive_file" className={style.icon} />
                      <p style={{ color: '#000000' }}>
                        {intl
                          .get(`${modelCode}.button.fileName`)
                          .d(this.state.uploadTempFile?.name)}
                      </p>
                      <Button
                        type={ButtonType.button}
                        className={style.btn}
                        color={ButtonColor.default}
                        onClick={() => this.handleSingleUpload()}
                        loading={btnFlag === 'S' && loadingFlag}
                      >
                        {intl.get(`${modelCode}.button.check`).d('智能校验')}
                      </Button>
                    </div>
                  )}
                  {this.invoiceDS.current?.get('fileUrl') && (
                    <div
                      className={style.uploadContainer}
                      style={{ borderStyle: 'solid', marginLeft: '24px' }}
                    >
                      <Icon
                        type="insert_drive_file"
                        className={style.icon}
                        onClick={() => this.handleGotoArchiveView()}
                      />
                      <p onClick={() => this.handleGotoArchiveView()} style={{ color: '#000000' }}>
                        {intl
                          .get(`${modelCode}.button.fileName`)
                          .d(this.invoiceDS.current?.get('fileName'))}
                      </p>
                      <p onClick={() => this.handleGotoFileArchive()}>
                        {intl.get(`${modelCode}.button.filed`).d('归档')}
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ display: 'none' }}>
                  <Upload
                    ref={this.saveSingleUpload}
                    {...uploadProps}
                    accept={acceptType}
                    action={`${API_HOST}${HIVP_API}/v1/${tenantId}/archives-update/update-archives-and-check`}
                  />
                </div>
              </Panel>
            </Collapse>
            <InvoiceChildSwitchPage type={1} />
          </Spin>
        </Content>
      </>
    );
  }
}
