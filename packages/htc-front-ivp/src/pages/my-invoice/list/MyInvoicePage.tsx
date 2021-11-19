import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import {
  DataSet,
  Table,
  Button,
  Form,
  Lov,
  Output,
  Radio,
  TextField,
  DatePicker,
  CheckBox,
  Currency,
  Upload,
  Modal,
  Select,
} from 'choerodon-ui/pro';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import commonConfig from '@common/config/commonConfig';
import notification from 'utils/notification';
import { HZERO_FILE, API_HOST } from 'utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getResponse,
  getAccessToken,
} from 'utils/utils';
import { openTab } from 'utils/menuTab';
import withProps from 'utils/withProps';
import { downloadFile, DownloadFileParams } from 'hzero-front/lib/services/api';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { deleteInvoiceInfo } from '@src/services/myInvoicesService';
import InvoicesHeadersDS from '../stores/InvoicesHeadersDS';

const modelCode = 'hivp.myInvoice';
const tenantId = getCurrentOrganizationId();
const bucketName = 'hivp';
const HIVP_API = commonConfig.IVP_API;
const acceptType = ['.pdf', '.jpg', '.png', '.ofd'];
const { Option } = Select;
const invoiceSourceCode = 'INVOICE_POOL';
const billSourceCode = 'BILL_POOL';

interface MyInvoicePageProps {
  dispatch: Dispatch<any>;
  invoiceDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
})
@withProps(
  () => {
    const invoiceDS = new DataSet({
      autoQuery: false,
      ...InvoicesHeadersDS(),
    });
    return { invoiceDS };
  },
  { cacheState: true }
)
export default class MyInvoicePage extends Component<MyInvoicePageProps> {
  state = { uploadFileRec: {}, curPoolHeaderId: '', loadingFlag: false };

  upload = {};

  singleIsCheck = 'Y';

  componentDidMount() {
    const { queryDataSet } = this.props.invoiceDS;
    if (queryDataSet && !(queryDataSet.current && queryDataSet.current.get('companyId'))) {
      getCurrentEmployeeInfo({ tenantId }).then((res) => {
        if (res && res.content && res.content.length > 0) {
          queryDataSet.getField('companyObj')!.set('defaultValue', res.content[0]);
          queryDataSet.reset();
          queryDataSet.create();
        }
      });
    }
  }

  handleSourceCodeChange = (value, oldVale) => {
    if (value !== oldVale) {
      const { queryDataSet } = this.props.invoiceDS;
      const invoiceTypeLookup = value === 'INVOICE_POOL' ? 'HIVC.INVOICE_TYPE' : 'HIVP.BILL_TYPE';
      if (queryDataSet && value) {
        queryDataSet.getField('invoiceType')!.set('lookupCode', invoiceTypeLookup);
      }
    }
  };

  // 自定义查询
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={4} dataSet={queryDataSet} excludeUseColonTagList={['Output', 'div']}>
            <Lov name="companyObj" colSpan={2} clearButton={false} />
            <TextField name="employeeName" />
            <div>
              <Button onClick={() => this.handleGotoInvoiceCheck()}>
                {intl.get(`${modelCode}.button.invoiceCheck`).d('发票查验')}
              </Button>
              <Button onClick={() => this.handleGotoBatchDentificationCheck()}>
                {intl.get(`${modelCode}.button.batchDentificationCheck`).d('批量识别查验')}
              </Button>
            </div>
            <CheckBox name="notSubmittedFlag" />
            <CheckBox name="isSubmittedFlag" />
            <DatePicker name="invoiceDateFrom" />
            <DatePicker name="invoiceDateTo" />
            <TextField name="buyerName" colSpan={2} />
            <TextField name="salerName" colSpan={2} />
            <Select
              name="sourceCode"
              onChange={(value, oldValue) => this.handleSourceCodeChange(value, oldValue)}
            >
              <Option value={invoiceSourceCode}>
                {intl.get(`${modelCode}.invoicePool`).d('发票池')}
              </Option>
              <Option value={billSourceCode}>
                {intl.get(`${modelCode}.billPool`).d('票据池')}
              </Option>
            </Select>
            <Select name="invoiceType" />
            <TextField name="invoiceCode" />
            <TextField name="invoiceNo" />
            <Output
              name="inOutType"
              colSpan={1}
              renderer={() => (
                <Radio name="inOutType" value="IN">
                  我收到的发票
                </Radio>
              )}
            />
            <Output
              name="inOutType"
              colSpan={1}
              renderer={() => (
                <Radio name="inOutType" value="OUT">
                  我开具的发票
                </Radio>
              )}
            />
            <Currency name="invoiceAmount" />
            <div>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.reset_button').d('重置')}
              </Button>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
              </Button>
            </div>
          </Form>
        </>
      );
    }
    return <></>;
  }

  // 跳转至手工发票查验界面
  @Bind()
  handleGotoInvoiceCheck() {
    const pathname = `/${process.env.MY_ROUTE}/invoice-check/query`;
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get(`${modelCode}.invoiceCheck`).d('手工发票查验'),
      closable: true,
      type: 'menu',
    });
  }

  // 跳转至批量识别查验界面
  @Bind()
  handleGotoBatchDentificationCheck() {
    const pathname = '/htc-front-ivp/batch-check/list';
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get(`${modelCode}.batchCheck`).d('批量识别查验'),
      closable: true,
      type: 'menu',
    });
  }

  // 查看发票明细
  @Bind()
  handleGotoDetailPage(record) {
    const { dispatch } = this.props;
    const { sourceCode, poolHeaderId, invoiceType, entryPoolSource, companyCode } = record.toData();
    let invoiceHeaderId;
    if (entryPoolSource === 'EXTERNAL_IMPORT') {
      invoiceHeaderId = poolHeaderId;
    } else {
      invoiceHeaderId = record.get('invoiceHeaderId');
    }
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-ivp/my-invoice/detail/${sourceCode}/${poolHeaderId}`,
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              invoiceType,
              invoiceHeaderId,
              entryPoolSource,
              companyCode,
            })
          ),
        }),
      })
    );
  }

  // 查看档案
  handleGotoArchiveView = (record) => {
    const { dispatch } = this.props;
    const { sourceCode, poolHeaderId, companyId } = record.toData();
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-ivp/my-invoice/archive-view/${sourceCode}/${poolHeaderId}`,
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              companyId,
              backPath: '/htc-front-ivp/my-invoice/list',
            })
          ),
        }),
      })
    );
  };

  /**
   * 单据关联
   * @returns
   */
  @Bind()
  handleGotoDocRelated(record) {
    const { dispatch } = this.props;
    const { sourceCode, poolHeaderId, companyId } = record.toData();
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-ivp/my-invoice/doc-related/${sourceCode}/${poolHeaderId}`,
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              companyId,
              backPath: '/htc-front-ivp/my-invoice/list',
              subViewPath: `/htc-front-ivp/my-invoice/archive-view/${sourceCode}/${poolHeaderId}`,
            })
          ),
        }),
      })
    );
  }

  // 删除部分信息
  @Bind()
  async handleDeleteInvoiceInfo(record) {
    Modal.confirm({
      title: intl.get(`${modelCode}.view.deleteTitle`).d('是否确认删除'),
      onOk: async () => {
        const params = {
          tenantId,
          invoicePoolHeaderId: record.get('poolHeaderId'),
          employeeNum: record.get('employeeNum'),
          companyId: record.get('companyId'),
          sourceCode: record.get('sourceCode'),
        };
        const res = getResponse(await deleteInvoiceInfo(params));
        if (res) {
          notification.success({
            description: '',
            message: res.message,
          });
          this.props.invoiceDS.query();
        }
      },
    });
  }

  // 下载
  @Bind()
  handledDownload(record) {
    const fileUrl = record && record.get('fileUrl');
    const queryParams = [
      { name: 'url', value: encodeURIComponent(fileUrl) },
      { name: 'bucketName', value: bucketName },
    ];
    const api = `${HZERO_FILE}/v1/${isTenantRoleLevel() ? `${tenantId}/` : ''}files/download`;
    // @ts-ignore
    downloadFile({
      requestUrl: api,
      queryParams,
    } as DownloadFileParams).then((result) => {
      // 获取返回信息，不做处理
      getResponse(result, null);
    });
  }

  saveUpload = (poolHeaderId, node) => {
    if (poolHeaderId) {
      this.upload[poolHeaderId] = node;
    }
  };

  handleUploadSuccess = (response) => {
    const { curPoolHeaderId } = this.state;
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
        }).then(async (button) => {
          if (button === 'ok') {
            this.singleIsCheck = 'N';
            this.upload[curPoolHeaderId].startUpload();
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
        }
        this.setState({ loadingFlag: false });
        this.props.invoiceDS.query();
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
      this.setState({ loadingFlag: false });
      this.props.invoiceDS.query();
    }
  };

  handleUploadError = () => {
    notification.error({
      description: '',
      message: intl.get(`${modelCode}.view.uploadFailed`).d('上传失败，请重试'),
    });
    this.setState({ loadingFlag: false });
  };

  handleFileChange = (poolHeaderId, fileList) => {
    const { uploadFileRec } = this.state;
    uploadFileRec[poolHeaderId] = fileList;
    this.setState({ uploadFileRec });
  };

  // 智能上传
  @Bind()
  handleSmartUpload(poolHeaderId) {
    this.upload[poolHeaderId].startUpload();
    if (this.upload[poolHeaderId].fileList.length > 0) {
      this.setState({ loadingFlag: true, curPoolHeaderId: poolHeaderId });
    }
  }

  get columns(): ColumnProps[] {
    const { uploadFileRec, curPoolHeaderId, loadingFlag } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      action: `${API_HOST}${HIVP_API}/v1/${tenantId}/my-invoice/my-invoice-smart-upload`,
      multiple: false,
      uploadImmediately: false,
      partialUpload: false,
      showUploadBtn: false,
      showPreviewImage: true,
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    return [
      { name: 'invoiceTypeMeaning', width: 200 },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'validTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'checkCode', width: 180 },
      { name: 'invoiceState' },
      { name: 'salerName', width: 260 },
      { name: 'buyerName', width: 260 },
      {
        name: 'fileName',
        width: 300,
        renderer: ({ value, record }) => {
          const poolHeaderId = record && record.get('poolHeaderId');
          // if (!value && record && record.get('invoiceTypeTag') !== 'E') {
          if (!value && record) {
            return (
              <Upload
                ref={(node) => this.saveUpload(poolHeaderId, node)}
                {...uploadProps}
                onFileChange={(fileList) => this.handleFileChange(poolHeaderId, fileList)}
                data={() => ({
                  companyId: record.get('companyId'),
                  companyCode: record.get('companyCode'),
                  employeeNo: record.get('employeeNum'),
                  sourceCode: record.get('sourceCode'),
                  invoicePoolHeaderId: poolHeaderId,
                  isCheck: this.singleIsCheck,
                })}
                accept={acceptType}
              />
            );
          } else {
            return <a onClick={() => this.handledDownload(record)}> {value}</a>;
          }
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 400,
        command: ({ record }): Commands[] => {
          const poolHeaderId = record && record.get('poolHeaderId');
          return [
            <Button key="viewDetail" onClick={() => this.handleGotoDetailPage(record)}>
              {intl.get(`${modelCode}.button.viewDetail`).d('查看详情')}
            </Button>,
            <Button
              key="viewArchive"
              disabled={!record.get('fileUrl')}
              onClick={() => this.handleGotoArchiveView(record)}
            >
              {intl.get(`${modelCode}.button.viewArchive`).d('查看档案')}
            </Button>,
            <Button key="relateDoc" onClick={() => this.handleGotoDocRelated(record)}>
              {intl.get(`${modelCode}.button.relateDoc`).d('单据信息')}
            </Button>,
            <Button key="delete" onClick={() => this.handleDeleteInvoiceInfo(record)}>
              {intl.get(`${modelCode}.button.delete`).d('删除')}
            </Button>,
            <Button
              key="smartUpload"
              onClick={() => this.handleSmartUpload(poolHeaderId)}
              loading={loadingFlag && curPoolHeaderId === record.get('poolHeaderId')}
              disabled={
                loadingFlag ||
                !(uploadFileRec[poolHeaderId] && uploadFileRec[poolHeaderId].length > 0)
              }
            >
              {intl.get(`${modelCode}.button.smartUpload`).d('智能上传')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('我的发票')} />
        <Content>
          <Table
            dataSet={this.props.invoiceDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 300 }}
          />
        </Content>
      </>
    );
  }
}
