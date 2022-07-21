import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { DataSet, Button, Upload, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import commonConfig from '@htccommon/config/commonConfig';
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
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { deleteInvoiceInfo } from '@src/services/myInvoicesService';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import InvoicesHeadersDS from '../stores/InvoicesHeadersDS';

const modelCode = 'hivp.myInvoice';
const tenantId = getCurrentOrganizationId();
const bucketName = 'hivp';
const HIVP_API = commonConfig.IVP_API || '';
const acceptType = ['.pdf', '.jpg', '.png', '.ofd'];

interface MyInvoicePageProps {
  dispatch: Dispatch<any>;
  invoiceDS: DataSet;
}

@formatterCollections({
  code: [
    modelCode,
    'hcan.invoiceCheck',
    'hivp.batchCheck',
    'hivp.invoicesArchiveUpload',
    'hivp.bill',
    'htc.common',
  ],
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

  // 跳转至手工发票查验界面
  @Bind()
  handleGotoInvoiceCheck() {
    const pathname = `/${process.env.MY_ROUTE}/invoice-check/query`;
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get('hcan.invoiceCheck.view.title').d('手工发票查验'),
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
      title: intl.get('hivp.batchCheck.title.check').d('批量识别查验'),
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
    if (sourceCode === 'INVOICE_POOL') {
      if (entryPoolSource === 'EXTERNAL_IMPORT') {
        invoiceHeaderId = poolHeaderId;
      } else {
        invoiceHeaderId = record.get('invoiceHeaderId');
      }
      if (invoiceHeaderId === 'undefined' || !invoiceHeaderId) {
        notification.info({
          description: '',
          message: intl.get(`${modelCode}.view.checkDetailMessage`).d('此发票未查验，无全票面信息'),
        });
        return;
      }
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
    localStorage.setItem('myInvoicerecord', JSON.stringify(record.data)); // 添加跳转record缓存
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
          } else {
            this.setState({ loadingFlag: false });
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
        message: intl.get('hivp.invoicesArchiveUpload.view.uploadInvalid').d('上传返回数据无效'),
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
    this.handleSmartUpload(poolHeaderId);
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
    const { loadingFlag } = this.state;
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
      id: 'upload',
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleUploadError,
    };
    return [
      {
        name: 'invoiceTypeMeaning',
        width: 200,
        aggregation: true,
        children: [
          {
            renderer: ({ record }) => {
              const receiptsState = record && record.get('receiptsState');
              const entryAccountState = record && record.get('entryAccountState');
              return (
                <Tag
                  color={receiptsState === '0' && entryAccountState === '0' ? '#dadada' : '#87d068'}
                >
                  {receiptsState === '0' && entryAccountState === '0'
                    ? intl.get(`${modelCode}.button.notSubmittedFlag`).d('未报销')
                    : intl.get(`${modelCode}.button.isSubmittedFlag`).d('已报销')}
                </Tag>
              );
            },
          },
          {
            name: 'invoiceTypeMeaning',
            title: '',
            renderer: ({ record }) => {
              const invoiceTypeMeaning = record && record.get('invoiceTypeMeaning');
              return <a onClick={() => this.handleGotoDetailPage(record)}>{invoiceTypeMeaning}</a>;
            },
          },
        ],
      },
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
              <Button loading={loadingFlag} style={{ border: 'none', background: 'transparent' }}>
                {/* eslint-disable */}
                <label htmlFor="upload">
                  <a>{intl.get('hivp.bill.button.archiveUpload').d('上传档案')}</a>
                </label>
                {/* eslint-enable */}
                <div style={{ display: 'none' }}>
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
                </div>
              </Button>
            );
          } else {
            return <a onClick={() => this.handleGotoArchiveView(record)}> {value}</a>;
          }
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        command: ({ record }): Commands[] => {
          return [
            <span className="action-link" key="action">
              <a onClick={() => this.handleGotoDocRelated(record)}>
                {intl.get(`${modelCode}.button.relateDoc`).d('查看单据')}
              </a>
              <a onClick={() => this.handleDeleteInvoiceInfo(record)}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </span>,
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
        <Header title={intl.get(`${modelCode}.view.title`).d('我的发票')}>
          <Button
            color={ButtonColor.primary}
            onClick={() => this.handleGotoBatchDentificationCheck()}
          >
            {intl.get('hivp.batchCheck.title.check').d('批量识别查验')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.handleGotoInvoiceCheck()}>
            {intl.get('hcan.invoiceCheck.view.title').d('手工发票查验')}
          </Button>
        </Header>
        <Content>
          <AggregationTable
            dataSet={this.props.invoiceDS}
            columns={this.columns}
            style={{ height: 500 }}
          />
        </Content>
      </>
    );
  }
}
