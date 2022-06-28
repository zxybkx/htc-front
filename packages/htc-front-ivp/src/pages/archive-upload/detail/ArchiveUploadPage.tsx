import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Button, Table, Form, Output, Upload, Progress, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { TabsType } from 'choerodon-ui/lib/tabs/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { openTab } from 'utils/menuTab';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import { batchUploadProcessQuery, confirmFile } from '@src/services/invoicesService';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import formatterCollections from 'utils/intl/formatterCollections';
import ArchiveUploadMutipleDS from '../stores/ArchiveUploadMutipleDS';

const modelCode = 'hivp.invoicesArchiveUpload';
const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;
const acceptType = ['.pdf', '.jpg', '.png', '.ofd'];

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface ArchiveUploadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'hivp.bill', 'htc.common', 'hivp.batchCheck'],
})
@connect()
export default class ArchiveUploadPage extends Component<ArchiveUploadPageProps> {
  state = {
    companyDesc: '',
    companyId: '',
    companyCode: '',
    employeeNum: '',
    progressValue: 100,
    progressStatus: ProgressStatus.success,
    uploadResult: '',
    btnFlag: '',
    loadingFlag: false,
    backPath: '',
  };

  multipleDS = new DataSet({
    autoQuery: false,
    ...ArchiveUploadMutipleDS(),
  });

  invoiceDS = new DataSet({
    autoQuery: false,
    ...SubPageInvoicesHeadersDS({
      invoicePoolHeaderId: this.props.match.params.sourceHeaderId,
    }),
  });

  singleUpload;

  singleIsCheck;

  mutipleUpload;

  mutipleUploadUuid;

  multipleUploadTimer;

  saveSingleUpload = (node) => {
    this.singleUpload = node;
  };

  saveMutipleUpload = (node) => {
    this.mutipleUpload = node;
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
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId: invoiceInfo.companyId });
      const currentEmp = empRes && empRes.content[0];
      this.setState({
        companyDesc: `${currentEmp.companyCode}-${currentEmp.companyName}`,
        companyId: invoiceInfo.companyId,
        companyCode: currentEmp.companyCode,
        employeeNum: currentEmp && currentEmp.employeeNum,
        backPath: invoiceInfo.backPath,
      });
    }
  }

  // 单票上传
  @Bind()
  handleSingleUpload() {
    this.singleIsCheck = 'Y';
    this.singleUpload.startUpload();
    if (this.singleUpload.fileList.length > 0) {
      this.setState({ uploadResult: '', btnFlag: 'S', loadingFlag: true });
    }
  }

  handleUploadSuccess = (response) => {
    const { btnFlag } = this.state;
    if (btnFlag === 'S') {
      // 单个文件
      try {
        let ntfFlag = true;
        const resp = JSON.parse(response);
        if (resp.failed && resp.code === 'H1025') {
          ntfFlag = false;
          const title = intl
            .get(`${modelCode}.view.uploadConfirm`)
            .d('OCR识别信息与发票信息不一致，是否继续上传？');
          Modal.confirm({
            key: Modal.key,
            title,
          }).then((button) => {
            if (button === 'ok') {
              this.singleIsCheck = 'N';
              this.singleUpload.startUpload();
            }
          });
        }
        if (ntfFlag) {
          const res = getResponse(resp);
          if (res) {
            notification.success({
              description: '',
              message: res.message,
            });
            this.invoiceDS.query();
            this.setState({ uploadResult: res.message });
          }
          this.setState({ btnFlag: '', loadingFlag: false });
        }
      } catch (err) {
        notification.error({
          description: err.message,
          message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
        });
        this.setState({ btnFlag: '', loadingFlag: false });
      }
    } else {
      // 多个文件
      try {
        const multipleData = JSON.parse(response);
        const res = getResponse(multipleData);
        if (res) {
          this.multipleDS = new DataSet({
            data: multipleData,
            ...ArchiveUploadMutipleDS(),
          });
        }
      } catch (err) {
        notification.error({
          description: err.message,
          message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
        });
      }
      this.setState({ btnFlag: '', loadingFlag: false });
    }
  };

  handleUploadError = (response) => {
    this.setState({ uploadResult: response, btnFlag: '', loadingFlag: false });
    notification.error({
      description: '',
      message: response,
    });
  };

  // 批量上传
  @Bind()
  async handleMultipleUpload(startFlag) {
    // const { companyCode, employeeNum, loadingFlag } = this.state;
    let curProgress: number = -1;
    if (startFlag) {
      // 开始上传
      this.singleIsCheck = '';
      this.mutipleUploadUuid = uuidv4();
      this.mutipleUpload.startUpload();
      if (this.mutipleUpload.fileList.length > 0) {
        this.setState({ btnFlag: 'M', loadingFlag: true });
        curProgress = 0;
      }
    } else if (this.mutipleUploadUuid) {
      // 进度查询
      const queryRes = await batchUploadProcessQuery({
        tenantId,
        // companyCode,
        // employeeNo: employeeNum,
        uuid: this.mutipleUploadUuid,
      });
      if (queryRes) {
        if (queryRes.status === '1002') {
          curProgress = Number(queryRes.data);
          if (isNaN(curProgress)) curProgress = 0;
        } else {
          curProgress = 100;
          this.setState({
            progressValue: curProgress,
            progressStatus:
              queryRes.status === '1001' ? ProgressStatus.success : ProgressStatus.exception,
          });
          return;
        }
      }
    }
    // if ((startFlag || loadingFlag) && curProgress > -1 && curProgress < 100) {
    if (curProgress > -1 && curProgress < 100) {
      this.setState({
        progressValue: curProgress,
        progressStatus: ProgressStatus.active,
      });
      if (startFlag) {
        await this.handleMultipleUpload(false);
      } else {
        setTimeout(() => this.handleMultipleUpload(false), 1000);
      }
    }
  }

  // 自动勾选
  @Bind()
  handleAutoChecked() {
    this.multipleDS.forEach((rec) => {
      // console.log(rec.get('identifyState'), rec.get('dataCheckState'));
      // “自动勾选”只勾选“识别状态”为“识别完成”且“数据校验状态”为“校验通过”的档案
      if (
        rec.get('identifyState') === 'RECOGNITION_FINISHED' &&
        rec.get('dataCheckState') === 'PASSED'
      ) {
        this.multipleDS.select(rec);
      }
    });
  }

  // 确认档案
  @Bind()
  async handleConfirmArchive() {
    const { sourceCode } = this.props.match.params;
    const { companyCode, employeeNum } = this.state;
    const selectedList = this.multipleDS.selected.map((rec) => rec.toData());
    if (
      selectedList.some(
        (sl) => !(sl.identifyState === 'RECOGNITION_FINISHED' && sl.dataCheckState === 'PASSED')
      )
    ) {
      notification.error({
        message: '',
        description: intl
          .get(`${modelCode}.view.confirmInvalid`)
          .d('存在不能确认的数据，请重新勾选'),
      });
      return;
    }
    const selectedRowKeys = selectedList.map((record) => record.invoiceUploadFileId);
    const params = {
      tenantId,
      companyCode,
      employeeNo: employeeNum,
      sourceCode,
      uploadFileHistoryIds: selectedRowKeys.join(','),
    };
    if (selectedList) {
      const res = await confirmFile(params);
      this.multipleDS = new DataSet({
        data: res,
        ...ArchiveUploadMutipleDS(),
      });
      this.setState({ loadingFlag: false });
    }
  }

  // 查看档案
  @Bind()
  handleGotoArchiveView() {
    // const { dispatch, location } = this.props;
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const pathname =
      sourceCode === 'BILL_POOL'
        ? `/htc-front-ivp/bills/archive-view/${sourceCode}/${sourceHeaderId}`
        : `/htc-front-ivp/invoices/archive-view/${sourceCode}/${sourceHeaderId}`;
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get(`${modelCode}.view.file`).d('查看档案'),
      closable: true,
      type: 'menu',
    });
    // dispatch(
    //   routerRedux.push({
    //     pathname,
    //     search: querystring.stringify({
    //       invoiceInfo: encodeURIComponent(
    //         JSON.stringify({
    //           backPath: location && `${location.pathname}${location.search}`,
    //         })
    //       ),
    //     }),
    //   })
    // );
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'uploadFileName', width: 240 },
      { name: 'identifyState' },
      { name: 'dataCheckState', width: 120 },
      { name: 'fileType', width: 120 },
      { name: 'existFileName', width: 240 },
      { name: 'invoiceType', width: 160 },
      { name: 'invoiceCode', width: 160 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 120 },
      { name: 'invoiceAmount', width: 120, align: ColumnAlign.right },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          return [
            <Button
              disabled={!record.get('existFileName')}
              key="viewArchive"
              onClick={() => this.handleGotoArchiveView()}
            >
              {intl.get(`${modelCode}.view.file`).d('查看档案')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  get buttons(): Buttons[] {
    const { btnFlag, loadingFlag } = this.state;
    const ObserverButton = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          // funcType={FuncType.flat}
          // color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button
        key="upload"
        onClick={() => this.handleMultipleUpload(true)}
        loading={btnFlag === 'M' && loadingFlag}
      >
        {intl.get(`${modelCode}.button.uploadCheck`).d('上传并智能校验')}
      </Button>,
      <Button key="autoChecked" onClick={() => this.handleAutoChecked()}>
        {intl.get(`${modelCode}.button.autoChecked`).d('自动勾选')}
      </Button>,
      <ObserverButton
        key="confirmArchive"
        onClick={() => this.handleConfirmArchive()}
        dataSet={this.multipleDS}
        title={intl.get(`${modelCode}.button.confirmArchive`).d('确认档案')}
      />,
    ];
  }

  render() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const {
      companyDesc,
      companyId,
      companyCode,
      employeeNum,
      progressValue,
      progressStatus,
      uploadResult,
      btnFlag,
      loadingFlag,
      backPath,
    } = this.state;
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
      // beforeUpload: this.handleBeforeUpload,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    const ViewArchiveBtn = observer((props: any) => {
      const isDisabled = !this.invoiceDS.current?.get('fileUrl');
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.raised}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return (
      <>
        <Header
          backPath={backPath}
          title={intl.get(`${modelCode}.title.uploadFile`).d('档案上传')}
        />
        <Content>
          <Tabs type={TabsType.card} defaultActiveKey="S">
            <TabPane key="S" tab={intl.get(`${modelCode}.view.singleUpload`).d('单票发票档案上传')}>
              <Form dataSet={this.invoiceDS} columns={4}>
                <Output
                  value={companyDesc}
                  label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                />
                <Output
                  value={moment().format(DEFAULT_DATE_FORMAT)}
                  label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
                />
                <div>
                  {/* <Button */}
                  {/*  disabled={!this.invoiceDS.current?.get('fileUrl')} */}
                  {/*  color={ButtonColor.primary} */}
                  {/*  onClick={() => this.handleGotoArchiveView()} */}
                  {/* > */}
                  {/*  {intl.get(`${modelCode}.button.viewArchive`).d('查看档案')} */}
                  {/* </Button> */}
                  <ViewArchiveBtn
                    key="viewArchive"
                    onClick={() => this.handleGotoArchiveView()}
                    dataSet={this.invoiceDS}
                    title={intl.get(`${modelCode}.view.file`).d('查看档案')}
                  />
                </div>
                {sourceCode === 'BILL_POOL' ? (
                  <Output name="billType" newLine />
                ) : (
                  <Output name="invoiceType" newLine />
                )}
                {sourceCode === 'BILL_POOL' ? '' : <Output name="inOutType" />}
                <Output name="invoiceDate" />
                <Output name="buyerName" newLine />
                <Output name="invoiceCode" />
                <Output name="invoiceNo" />
                <Output name="salerName" newLine />
                <Output name="invoiceAmount" />
                <Output name="totalAmount" />
                <Output name="fileName" />
                <Output
                  label={intl.get(`${modelCode}.label.singleFile`).d('单个文件')}
                  renderer={() => (
                    <Upload
                      ref={this.saveSingleUpload}
                      {...uploadProps}
                      accept={acceptType}
                      action={`${API_HOST}${HIVP_API}/v1/${tenantId}/archives-update/update-archives-and-check`}
                    />
                  )}
                />
                <div />
                <div>
                  <Button
                    color={ButtonColor.primary}
                    onClick={() => this.handleSingleUpload()}
                    loading={btnFlag === 'S' && loadingFlag}
                  >
                    {intl.get(`${modelCode}.button.uploadCheck`).d('上传并智能校验')}
                  </Button>
                  <p style={{ color: 'red' }}>{uploadResult}</p>
                </div>
              </Form>
            </TabPane>
            <TabPane
              key="M"
              tab={intl.get(`${modelCode}.view.mutipleUpload`).d('批量发票档案上传')}
            >
              <Form columns={4}>
                <Output
                  label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                  value={companyDesc}
                />
                <Output
                  label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
                  value={moment().format(DEFAULT_DATE_FORMAT)}
                />
                <Output
                  label="文件选择"
                  renderer={() => (
                    <Upload
                      ref={this.saveMutipleUpload}
                      {...uploadProps}
                      accept={['.zip', '.rar', '.7z']}
                      action={`${API_HOST}${HIVP_API}/v1/${tenantId}/archives-update/batch-upload-and-check`}
                    />
                  )}
                />
                <Output
                  label={intl.get(`${modelCode}.view.progressBar`).d('进度条')}
                  renderer={() => <Progress value={progressValue} status={progressStatus} />}
                />
              </Form>
              <Table
                dataSet={this.multipleDS}
                columns={this.columns}
                queryFieldsLimit={4}
                buttons={this.buttons}
                style={{ height: 400 }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
