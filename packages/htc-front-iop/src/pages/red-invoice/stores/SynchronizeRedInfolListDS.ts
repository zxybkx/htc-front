/**
 * @Description: 同步请求列表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-25 15:49:32
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hiop.redInvoice';

export default (): DataSetProps => {
  const HIOP_API = `${commonConfig.IOP_API}`;
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
    primaryKey: 'redInvoiceRequisitionOperationId',
    events: {},
    fields: [
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceRequisitionOperationId',
        type: FieldType.number,
      },
      {
        name: 'businessNoticeNum',
        label: intl.get(`${modelCode}.view.businessNoticeNum`).d('业务通知流水号'),
        type: FieldType.string,
      },
      {
        name: 'state',
        label: intl.get(`${modelCode}.view.state`).d('状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.STATUS_OF_GET_RED_REQNO',
      },
      {
        name: 'stateDescription',
        label: intl.get(`${modelCode}.view.stateDescription`).d('状态描述'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceDateFrom',
        label: intl.get(`${modelCode}.view.redInvoiceDateFrom`).d('填开日期起'),
        transformResponse: (value) => value && moment(value, 'YYYY-MM-DD'),
        type: FieldType.string,
      },
      {
        name: 'redInvoiceDateTo',
        label: intl.get(`${modelCode}.view.redInvoiceDateTo`).d('填开日期止'),
        transformResponse: (value) => value && moment(value, 'YYYY-MM-DD'),
        type: FieldType.string,
      },
      {
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'purchasersTaxNumber',
        label: intl.get(`${modelCode}.view.purchasersTaxNumber`).d('购方税号'),
        type: FieldType.string,
      },
      {
        name: 'salesTaxNumber',
        label: intl.get(`${modelCode}.view.salesTaxNumber`).d('销方税号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
      },
      {
        name: 'downloadRange',
        label: intl.get(`${modelCode}.view.downloadRange`).d('信息表下载范围'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_DOWNLOAD_SCOPE',
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get(`${modelCode}.view.completeTime`).d('完成时间'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('请求员工'),
        type: FieldType.string,
      },
    ],
  };
};

const HeaderDS = (): DataSetProps => {
  return {
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.number,
      },
      {
        name: 'employeeDesc',
        label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
        type: FieldType.string,
      },
      {
        name: 'fromDate',
        label: intl.get(`${modelCode}.view.fromDate`).d('填开时间起'),
        type: FieldType.dateTime,
        max: 'untilDate',
        defaultValue: moment(),
        transformRequest: (value) => value && moment(value).format('YYYYMMDD'),
      },
      {
        name: 'untilDate',
        label: intl.get(`${modelCode}.view.untilDate`).d('填开时间止'),
        type: FieldType.dateTime,
        min: 'fromDate',
        defaultValue: moment(),
        transformRequest: (value) => value && moment(value).format('YYYYMMDD'),
      },
      {
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
        defaultValue: 'N',
        required: true,
      },
      {
        name: 'informationSheetNumber',
        label: intl.get(`${modelCode}.view.informationSheetNumber`).d('信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'purchasersTaxNumber',
        label: intl.get(`${modelCode}.view.purchasersTaxNumber`).d('购方税号'),
        type: FieldType.string,
      },
      {
        name: 'salesTaxNumber',
        label: intl.get(`${modelCode}.view.salesTaxNumber`).d('销方税号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        defaultValue: '0',
        required: true,
      },
      {
        name: 'informationSheetDownloadRange',
        label: intl.get(`${modelCode}.view.informationSheetDownloadRange`).d('信息表下载范围'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_DOWNLOAD_SCOPE',
        defaultValue: 0,
        required: true,
        labelWidth: '120',
      },
    ],
  };
};

export { HeaderDS };
