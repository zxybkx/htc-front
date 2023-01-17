/**
 * @Description: 同步请求列表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-25 15:49:32
 * @LastEditTime: 2022-06-15 14:43:32
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const HIOP_API = commonConfig.IOP_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${organizationId}/red-invoice-requisition-operation/list`;
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
    pageSize: 10,
    selection: false,
    primaryKey: 'redInvoiceApplynOptId',
    events: {},
    fields: [
      {
        name: 'batchNo',
        label: intl.get('hiop.redInvoiceInfo.modal.batchNo').d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceApplynOptId',
        type: FieldType.string,
      },
      {
        name: 'businessNoticeNum',
        label: intl.get('hiop.redInvoiceInfo.modal.businessNoticeNum').d('业务通知流水号'),
        type: FieldType.string,
      },
      {
        name: 'state',
        label: intl.get('hiop.redInvoiceInfo.modal.state').d('状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.STATUS_OF_GET_RED_REQNO',
      },
      {
        name: 'stateDescription',
        label: intl.get('hiop.invoiceWorkbench.modal.exceptionDesc').d('状态描述'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceDateFrom',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDateFrom').d('填开日期起'),
        transformResponse: value => value && moment(value, 'YYYY-MM-DD'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceDateTo',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDateTo').d('填开日期止'),
        transformResponse: value => value && moment(value, 'YYYY-MM-DD'),
        type: FieldType.string,
      },
      {
        name: 'overdueStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.overdueStatus').d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.redInfoSerialNumber').d('信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'purchasersTaxNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.purchasersTaxNumber').d('购方税号'),
        type: FieldType.string,
      },
      {
        name: 'salesTaxNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.salesTaxNumber').d('销方税号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
      },
      {
        name: 'downloadRange',
        label: intl.get('hiop.redInvoiceInfo.modal.downloadRange').d('信息表下载范围'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_DOWNLOAD_SCOPE',
      },
      {
        name: 'requestTime',
        label: intl.get('hiop.redInvoiceInfo.modal.requestTime').d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get('hiop.redInvoiceInfo.modal.completeTime').d('完成时间'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.redInvoiceInfo.modal.employeeName').d('请求员工'),
        type: FieldType.string,
      },
    ],
  };
};

const HeaderDS = (): DataSetProps => {
  return {
    events: {
      update: ({ record, name, value }) => {
        if (name === 'invoiceType' && ['61', '81', '82'].includes(value)) {
          record.set('overdueStatus', '');
        }
      },
    },
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('hiop.redInvoiceInfo.modal.companyName').d('公司'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'employeeDesc',
        label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
      },
      {
        name: 'outChannelCode',
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'fillDate',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
        type: FieldType.dateTime,
        range: ['fromDate', 'untilDate'],
        defaultValue: {
          fromDate: moment(),
          untilDate: moment(),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'fromDate',
        type: FieldType.dateTime,
        bind: 'fillDate.fromDate',
        transformRequest: value => value && moment(value).format('YYYYMMDD'),
      },
      {
        name: 'untilDate',
        type: FieldType.dateTime,
        bind: 'fillDate.untilDate',
        transformRequest: value => value && moment(value).format('YYYYMMDD'),
      },
      {
        name: 'overdueStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.overdueStatus').d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
        defaultValue: 'N',
        computedProps: {
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceType')),
        },
      },
      {
        name: 'informationSheetNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.redInfoSerialNumber').d('信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'purchasersTaxNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.purchasersTaxNumber').d('购方税号'),
        type: FieldType.string,
      },
      {
        name: 'salesTaxNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.salesTaxNumber').d('销方税号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        defaultValue: '0',
        required: true,
      },
      {
        name: 'informationSheetDownloadRange',
        label: intl.get('hiop.redInvoiceInfo.modal.downloadRange').d('信息表下载范围'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_DOWNLOAD_SCOPE',
        defaultValue: 0,
        computedProps: {
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceType')),
        },
        labelWidth: '120',
      },
      {
        name: 'applicantType',
        label: intl.get('hiop.redInvoiceInfo.modal.selectionOfBuyerAndSeller').d('购销方选择'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLICANT_FOR_RED_REQUISITION',
        computedProps: {
          required: ({ record }) =>
            ['61', '81', '82'].includes(record.get('invoiceType')) &&
            record.get('outChannelCode') === 'DOUBLE_CHANNEL',
        },
      },
    ],
  };
};

export { HeaderDS };
