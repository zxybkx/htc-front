/**
 * @Description: 开票附加信息状态查询
 * @Author: huishan.yu <huishan.yu@hand-china.com>
 * @Date: 2021-09-06 10:26:45
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-06 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

export const modelCode = 'hcan.invoice-addinfo-queryStatus';
export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-order-refresh-operations`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderHeaderId',
    autoQuery: false,
    fields: [
      {
        name: 'tenantId',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户ID'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'orderFinishDate',
        label: intl.get(`${modelCode}.view.orderFinishDate`).d('订单完成日期'),
        type: FieldType.string,
      },
      {
        name: 'invoicingOrderHeaderId',
        label: intl.get(`${modelCode}.view.invoicingOrderHeaderId`).d('订单ID'),
        type: FieldType.string,
      },
      {
        name: 'orderNumber',
        label: intl.get(`${modelCode}.view.orderNumber`).d('订单号'),
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get(`${modelCode}.view.orderStatus`).d('订单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_STATUS',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'electronicUploadStatus',
        label: intl.get(`${modelCode}.view.electronicUploadStatus`).d('电票url上传状态'),
        type: FieldType.string,
      },
      {
        name: 'electronicUploadNum',
        label: intl.get(`${modelCode}.view.electronicUploadNum`).d('电票url上传重试次数'),
        type: FieldType.string,
      },
      {
        name: 'paperUploadStatus',
        label: intl.get(`${modelCode}.view.paperUploadStatus`).d('纸票url上传状态'),
        type: FieldType.string,
      },
      {
        name: 'paperUploadNum',
        label: intl.get(`${modelCode}.view.paperUploadNum`).d('纸票url上传重试次数'),
        type: FieldType.string,
      },
      {
        name: 'paperDownloadStatus',
        label: intl.get(`${modelCode}.view.paperDownloadStatus`).d('下载纸票预览状态'),
        type: FieldType.string,
      },
      {
        name: 'paperDownloadNum',
        label: intl.get(`${modelCode}.view.paperDownloadNum`).d('下载纸票预览重试次数'),
        type: FieldType.string,
      },
      {
        name: 'printUploadStatus',
        label: intl.get(`${modelCode}.view.printUploadStatus`).d('打印文件url上传状态'),
        type: FieldType.string,
      },
      {
        name: 'printUploadNum',
        label: intl.get(`${modelCode}.view.printUploadNum`).d('打印文件url上传重试次数'),
        type: FieldType.string,
      },
      {
        name: 'printDownloadStatus',
        label: intl.get(`${modelCode}.view.printDownloadStatus`).d('下载打印文件状态'),
        type: FieldType.string,
      },
      {
        name: 'printDownloadNum',
        label: intl.get(`${modelCode}.view.printDownloadNum`).d('下载打印文件重试次数'),
        type: FieldType.string,
      },
      {
        name: 'pushInvoicePoolStatus',
        label: intl.get(`${modelCode}.view.pushInvoicePoolStatus`).d('推送发票池状态'),
        type: FieldType.string,
      },
      {
        name: 'pushInvoicePoolNum',
        label: intl.get(`${modelCode}.view.pushInvoicePoolNum`).d('推送发票池重试次数'),
        type: FieldType.string,
      },
      {
        name: 'updateInvoicePoolStatus',
        label: intl.get(`${modelCode}.view.updateInvoicePoolStatus`).d('更新发票池状态'),
        type: FieldType.string,
      },
      {
        name: 'updateInvoicePoolNum',
        label: intl.get(`${modelCode}.view.updateInvoicePoolNum`).d('更新发票池重试次数'),
        type: FieldType.string,
      },
      {
        name: 'notifyStatus',
        label: intl.get(`${modelCode}.view.notifyStatus`).d('短信/邮件通知状态'),
        type: FieldType.string,
      },
      {
        name: 'notifyNum',
        label: intl.get(`${modelCode}.view.notifyNum`).d('通知短信/邮件重试次数'),
        type: FieldType.string,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.notifyStatus`).d('最后更新日期'),
        type: FieldType.string,
      },
      {
        name: 'invoiceQueryStatus',
        label: intl.get(`${modelCode}.view.notifyStatus`).d('全电发票查询状态'),
        type: FieldType.string,
      },
      {
        name: 'invoiceQueryNum',
        label: intl.get(`${modelCode}.view.invoiceQueryNum`).d('发票查询重试次数'),
        type: FieldType.string,
      },
      {
        name: 'fullElectUploadStatus',
        label: intl.get(`${modelCode}.view.fullElectUploadStatus`).d('全电发票文件上传状态'),
        type: FieldType.string,
      },
      {
        name: 'fullElectUploadNum',
        label: intl.get(`${modelCode}.view.fullElectUploadNum`).d('全电发票文件上传重试次数'),
        type: FieldType.string,
      },
      {
        name: 'fullElectDeliverStatus',
        label: intl.get(`${modelCode}.view.fullElectDeliverStatus`).d('全电发票交付状态'),
        type: FieldType.string,
      },
      {
        name: 'fullElectDeliverNum',
        label: intl.get(`${modelCode}.view.fullElectDeliverNum`).d('全电发票交付重试次数'),
        type: FieldType.string,
      },
      {
        name: 'fullElectPrintStatus',
        label: intl.get(`${modelCode}.view.fullElectPrintStatus`).d('全电打印状态'),
        type: FieldType.string,
      },
      {
        name: 'fullElectPrintNum',
        label: intl.get(`${modelCode}.view.fullElectPrintNum`).d('全电打印重试次数'),
        type: FieldType.string,
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'companyObject',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        ignore: FieldIgnore.always,
        required: true,
        cascadeMap: { organizationId: 'tenantId' },
        // computedProps: {
        //   lovPara: ({ record }) => {
        //     if (!isUndefined(record.get('tenantId'))) {
        //       return { organizationId: record.get('tenantId') };
        //     }
        //   },
        //   disabled: ({ record }) => {
        //     return isUndefined(record.get('tenantId'));
        //   },
        // },
      },
      {
        name: 'companyId',
        type: FieldType.string,
        bind: 'companyObject.companyId',
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'finishDateFrom',
        label: intl.get(`${modelCode}.view.finishDateFrom`).d('订单完成时间从'),
        type: FieldType.dateTime,
        max: 'finishDateTo',
      },
      {
        name: 'finishDateTo',
        label: intl.get(`${modelCode}.view.finishDateTo`).d('订单完成时间至'),
        type: FieldType.dateTime,
        min: 'finishDateFrom',
        defaultValue: moment().endOf('day'),
      },
      {
        name: 'lastUpdateDateFrom',
        label: intl.get(`${modelCode}.view.lastUpdateDateFrom`).d('最后更新时间从'),
        type: FieldType.dateTime,
        max: 'finishDateTo',
      },
      {
        name: 'lastUpdateDateTo',
        label: intl.get(`${modelCode}.view.lastUpdateDateTo`).d('最后更新时间至'),
        type: FieldType.dateTime,
        min: 'lastUpdateDateFrom',
        defaultValue: moment().endOf('day'),
      },
      {
        name: 'orderNumber',
        label: intl.get(`${modelCode}.view.orderNumber`).d('订单号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.batchNo`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'refreshFlag',
        label: intl.get(`${modelCode}.view.status`).d('状态查询'),
        type: FieldType.string,
      },
    ],
  };
};
