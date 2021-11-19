/**
 * @Description:客户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-22 14:15:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.tobe-invoice';

export default (urlParams): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28090` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { companyId, companyCode, employeeNumber } = urlParams || {};
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { invoiceInfo } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/query-customer`;
        const axiosConfig: AxiosRequestConfig = {
          // ...config,
          url,
          params: {
            companyId,
            companyCode,
            employeeNumber,
          },
          data: invoiceInfo,
          method: 'POST',
        };
        return axiosConfig;
      },
      submit: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/save-customer`,
          data: data[0],
          params: {
            companyId,
            companyCode,
            employeeNumber,
          },
          method: 'POST',
        };
      },
    },
    primaryKey: 'prepareCustomerId',
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'receiptNumber',
        label: intl.get(`${modelCode}.view.receiptNumber`).d('收票方编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'receiptName',
        label: intl.get(`${modelCode}.view.receiptName`).d('收票方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiptTaxNo',
        label: intl.get(`${modelCode}.view.receiptTaxNo`).d('收票方税号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'customerAddressPhone',
        label: intl.get(`${modelCode}.view.customerAddressPhone`).d('地址、电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiptEnterpriseType',
        label: intl.get(`${modelCode}.view.receiptEnterpriseType`).d('收票方企业类型'),
        type: FieldType.string,
        labelWidth: '120',
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
      },
      {
        name: 'bankNumber',
        label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('开票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        required: true,
      },
      {
        name: 'requestTypeObj',
        label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_BUSINESS_TYPE',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'businessType',
        label: intl.get(`${modelCode}.view.businessType`).d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.value',
        required: true,
      },
      {
        name: 'requestTypeMeaning',
        label: intl.get(`${modelCode}.view.requestTypeMeaning`).d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.meaning',
      },
      {
        name: 'billFlag',
        label: intl.get(`${modelCode}.view.billFlag`).d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK ',
        required: true,
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get(`${modelCode}.view.paperTicketReceiverName`).d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get(`${modelCode}.view.paperTicketReceiverAddress`).d('纸票收件地址'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get(`${modelCode}.view.paperTicketReceiverPhone`).d('纸票收件电话'),
        type: FieldType.string,
      },
      {
        name: 'electronicType',
        label: intl.get(`${modelCode}.view.electronicType`).d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get(`${modelCode}.view.electronicReceiverInfo`).d('电票交付邮件或电话'),
        type: FieldType.string,
        labelWidth: '150',
      },
    ],
  };
};
