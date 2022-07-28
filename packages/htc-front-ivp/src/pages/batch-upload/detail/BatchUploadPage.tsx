import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { observer } from 'mobx-react-lite';
import { chunk } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { Button, DataSet, Form, Output, Pagination, Table, Upload } from 'choerodon-ui/pro';
import { Col, Row, Spin, Tag, Icon } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { API_HOST } from 'utils/config';
import { openTab } from 'utils/menuTab';
import { getAccessToken, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import { confirmFile } from '@src/services/invoicesService';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import formatterCollections from 'utils/intl/formatterCollections';
import BatchUploadDS from '../stores/BatchUploadDS';
import styles from './batchUpload.less';

const modelCode = 'hivp.invoicesArchiveUpload';
const tenantId = getCurrentOrganizationId();
const HIVP_API = commonConfig.IVP_API;

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
  companyId: any;
}
interface ArchiveUploadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.batchCheck', 'hivp.bill', 'hivp.invoicesFileArchive'],
})
export default class BatchUploadPage extends Component<ArchiveUploadPageProps> {
  state = {
    companyDesc: '',
    companyCode: '',
    employeeNum: '',
    loadingFlag: false,
    backPath: '',
    uploadFileData: [],
  };

  multipleDS = new DataSet({
    autoQuery: false,
    ...BatchUploadDS(),
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

  // multipleUploadTimer;

  saveSingleUpload = node => {
    this.singleUpload = node;
  };

  saveMultipleUpload = node => {
    this.mutipleUpload = node;
  };

  async componentDidMount() {
    const { sourceCode, companyId } = this.props.match.params;
    if (sourceCode === 'BILL_POOL') {
      this.invoiceDS = new DataSet({
        autoQuery: false,
        ...SubPageBillHeadersDS({
          billPoolHeaderId: this.props.match.params.sourceHeaderId,
        }),
      });
    }

    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId });
      const currentEmp = empRes && empRes.content[0];
      this.setState({
        companyDesc: `${currentEmp.companyCode}-${currentEmp.companyName}`,
        // companyId: invoiceInfo.companyId,
        // companyId,
        companyCode: currentEmp.companyCode,
        employeeNum: currentEmp && currentEmp.employeeNum,
        backPath: invoiceInfo.backPath,
      });
    }
  }

  handleUploadSuccess = response => {
    try {
      const multipleData = JSON.parse(response);
      this.setState({
        uploadFileData: multipleData,
      });
      const res = getResponse(multipleData);
      if (res) {
        this.multipleDS = new DataSet({
          data: multipleData,
          ...BatchUploadDS(),
        });
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
    }
    this.setState({ loadingFlag: false });
  };

  handleUploadError = response => {
    this.setState({
      // uploadResult: response,
      // btnFlag: '',
      loadingFlag: false,
    });
    notification.error({
      description: '',
      message: response,
    });
  };

  // 批量上传
  @Bind()
  async handleMultipleUpload(startFlag) {
    if (startFlag) {
      // 开始上传
      this.mutipleUploadUuid = uuidv4();
      this.mutipleUpload.startUpload();
      if (this.mutipleUpload.fileList.length > 0) {
        this.setState({ loadingFlag: true });
      }
    }
    // const { companyCode, employeeNum, loadingFlag } = this.state;
    // let curProgress: number = -1;
    // if (startFlag) {
    //   // 开始上传
    //   this.singleIsCheck = '';
    //   this.mutipleUploadUuid = uuidv4();
    //   this.mutipleUpload.startUpload();
    //   if (this.mutipleUpload.fileList.length > 0) {
    //     this.setState({ loadingFlag: true });
    //     curProgress = 0;
    //   }
    // } else if (this.mutipleUploadUuid) {
    //   // 进度查询
    //   const queryRes = await batchUploadProcessQuery({
    //     tenantId,
    //     // companyCode,
    //     // employeeNo: employeeNum,
    //     uuid: this.mutipleUploadUuid,
    //   });
    //   if (queryRes) {
    //     if (queryRes.status === '1002') {
    //       curProgress = Number(queryRes.data);
    //       if (isNaN(curProgress)) curProgress = 0;
    //     } else {
    //       curProgress = 100;
    //       this.setState({
    //         // progressValue: curProgress,
    //         // progressStatus:
    //         //   queryRes.status === '1001' ? ProgressStatus.success : ProgressStatus.exception,
    //       });
    //       return;
    //     }
    //   }
    // }
    // // if ((startFlag || loadingFlag) && curProgress > -1 && curProgress < 100) {
    // if (curProgress > -1 && curProgress < 100) {
    //   this.setState({
    //     // progressValue: curProgress,
    //     // progressStatus: ProgressStatus.active,
    //   });
    //   if (startFlag) {
    //     await this.handleMultipleUpload(false);
    //   } else {
    //     setTimeout(() => this.handleMultipleUpload(false), 1000);
    //   }
    // }
  }

  // 自动勾选
  @Bind()
  handleAutoChecked() {
    this.multipleDS.forEach(rec => {
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
    const selectedList = this.multipleDS.selected.map(rec => rec.toData());
    if (
      selectedList.some(
        sl => !(sl.identifyState === 'RECOGNITION_FINISHED' && sl.dataCheckState === 'PASSED')
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
    const selectedRowKeys = selectedList.map(record => record.invoiceUploadFileId);
    const params = {
      tenantId,
      companyCode,
      employeeNo: employeeNum,
      sourceCode,
      uploadFileHistoryIds: selectedRowKeys.join(','),
    };
    if (selectedList) {
      const res = getResponse(await confirmFile(params));
      if (res) {
        this.multipleDS = new DataSet({
          data: res,
          ...BatchUploadDS(),
        });
        notification.success({
          description: '',
          message: intl.get(`${modelCode}.notice.successOperation`).d('操作成功'),
        });
      }
      this.setState({ loadingFlag: false });
    }
  }

  // 查看档案
  @Bind()
  async handleGotoArchiveView(invoicePoolHeaderId) {
    const { sourceCode } = this.props.match.params;
    const pathname = `/htc-front-ivp/invoices/archive-view/${sourceCode}/${invoicePoolHeaderId}`;
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get(`${modelCode}.path.viewArchives`).d('查看档案'),
      closable: true,
      type: 'menu',
    });
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'uploadFileName',
        width: 240,
        renderer: ({ text, record }) => {
          const identifyState = record?.get('identifyState');
          const identifyStateMeaning = record?.get('identifyStateMeaning');
          const invoicePoolHeaderId = record?.get('invoicePoolHeaderId');
          let color = '';
          let textColor = '';
          switch (identifyState) {
            case 'RECOGNITION_FINISHED':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'RECOGNITION_ABNORMAL':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {identifyStateMeaning}
              </Tag>
              &nbsp;
              {invoicePoolHeaderId ? (
                <a onClick={() => this.handleGotoArchiveView(invoicePoolHeaderId)}>{text}</a>
              ) : (
                <span>{text}</span>
              )}
            </>
          );
        },
      },
      // { name: 'identifyState' },
      { name: 'dataCheckState', width: 120 },
      { name: 'fileType', width: 120 },
      { name: 'existFileName', width: 240 },
      { name: 'invoiceType', width: 160 },
      { name: 'invoiceCode', width: 160 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 120 },
      { name: 'invoiceAmount', width: 120, align: ColumnAlign.right },
      // {
      //   name: 'operation',
      //   header: intl.get('hzero.common.action').d('操作'),
      //   width: 120,
      //   command: ({ record }): Commands[] => {
      //     return [
      //       <Button
      //         disabled={!record.get('existFileName')}
      //         key="viewArchive"
      //         onClick={() => this.handleGotoArchiveView()}
      //       >
      //         {intl.get(`${modelCode}.button.viewArchive`).d('查看档案')}
      //       </Button>,
      //     ];
      //   },
      //   lock: ColumnLock.right,
      //   align: ColumnAlign.center,
      // },
    ];
  }

  get buttons(): Buttons[] {
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
        key="autoChecked"
        onClick={() => this.handleAutoChecked()}
        color={ButtonColor.default}
      >
        {intl.get(`${modelCode}.button.automatch`).d('自动匹配')}
      </Button>,
      <ObserverButton
        key="confirmArchive"
        onClick={() => this.handleConfirmArchive()}
        dataSet={this.multipleDS}
        title={intl.get(`${modelCode}.button.confirmArchive`).d('确认档案')}
      />,
    ];
  }

  @Bind()
  handleUploadDataChange(page, pageSize) {
    console.log(this.multipleDS.data);

    const totalData = this.state.uploadFileData;
    const currentPageSize = this.multipleDS.pageSize;
    const _page = currentPageSize === pageSize ? page : 1;
    const chunkData = chunk(totalData, pageSize);
    this.multipleDS.loadData(chunkData[_page - 1]);
  }

  @Bind()
  renderQueryBar(tableProps) {
    const { buttons } = tableProps;
    const { sourceCode, companyId } = this.props.match.params;
    const { companyCode, employeeNum, loadingFlag } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {
        companyId,
        companyCode,
        employeeNo: employeeNum,
        sourceCode,
        uuid: this.mutipleUploadUuid,
        isCheck: this.singleIsCheck,
      },
      multiple: false,
      uploadImmediately: false,
      showUploadBtn: false,
      showPreviewImage: true,
      // partialUpload: false,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    return (
      <>
        <Row>
          <Col span={18}>
            <div className={styles.upload}>
              <Upload
                ref={this.saveMultipleUpload}
                {...uploadProps}
                accept={['.zip', '.rar', '.7z']}
                action={`${API_HOST}${HIVP_API}/v1/${tenantId}/archives-update/batch-upload-and-check`}
              >
                <Button color={ButtonColor.primary}>
                  <Icon type="backup-o" className={styles.btnIcon} />
                  {intl.get('hzero.common.upload.txt').d('上传')}
                </Button>
              </Upload>
              <Button
                key="batchUpload"
                onClick={() => this.handleMultipleUpload(true)}
                loading={loadingFlag}
                funcType={FuncType.link}
                color={ButtonColor.primary}
                style={{ marginLeft: 10 }}
              >
                {intl.get(`${modelCode}.button.check`).d('智能校验')}
              </Button>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            {buttons}
          </Col>
        </Row>
      </>
    );
  }

  render() {
    const { companyDesc, backPath, loadingFlag } = this.state;
    return (
      <>
        <Header
          backPath={backPath}
          title={intl.get(`${modelCode}.title.uploadFile`).d('档案上传')}
        />
        <div className={styles.header}>
          <Form columns={2} style={{ marginTop: 10 }}>
            <Output
              label={intl.get('htc.common.label.companyName').d('所属公司')}
              value={companyDesc}
            />
            <Output
              label={intl.get('hivp.batchCheck.view.currentTime').d('当前日期')}
              value={moment().format(DEFAULT_DATE_FORMAT)}
            />
          </Form>
        </div>
        <Content>
          <Spin spinning={loadingFlag}>
            <Table
              dataSet={this.multipleDS}
              columns={this.columns}
              queryFieldsLimit={4}
              pagination={false}
              buttons={this.buttons}
              queryBar={this.renderQueryBar}
              style={{ height: 400 }}
            />
            <Pagination
              total={this.multipleDS.totalCount}
              onChange={this.handleUploadDataChange}
              showPager
              style={{ marginTop: '0.1rem', textAlign: 'right' }}
            />
          </Spin>
        </Content>
      </>
    );
  }
}
