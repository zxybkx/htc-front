/**
 * @Description:客户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-22 14:15:22
 * @LastEditTime: 2021-11-23 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

/**
 * 必填校验规则
 * @params {object} record-行记录
 * @returns {boolean}
 */
const requiredByRequestType = record => {
  const businessType = record.get('businessType');
  return !['SALES_INVOICE_SUBSCRIBE', 'PURCHASE_INVOICE_SUBSCRIBE'].includes(businessType);
};

/**
 * 必填校验规则
 * @params {object} record-行记录
 * @returns {boolean}
 */
const requiredByRequestTypeAndInvoiceType = record => {
  const invoiceType = record.get('invoiceType');
  return requiredByRequestType(record) && invoiceType === '0';
};

export default (dsProps): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { companyId, companyCode, employeeNumber } = dsProps || {};
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
        name: 'employeeId',
        type: FieldType.number,
      },
      {
        name: 'receiptNumber',
        label: intl.get('hiop.tobeInvoice.modal.receiptNumber').d('收票方编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'receiptName',
        label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => requiredByRequestType(record),
        },
      },
      {
        name: 'receiptTaxNo',
        label: intl.get('hiop.invoiceReq.modal.receiptTaxNo').d('收票方税号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => requiredByRequestType(record),
        },
      },
      {
        name: 'customerAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => requiredByRequestTypeAndInvoiceType(record),
        },
      },
      {
        name: 'receiptEnterpriseType',
        label: intl.get('hiop.invoiceReq.modal.receiptEnterpriseType').d('收票方企业类型'),
        type: FieldType.string,
        labelWidth: '120',
        lookupCode: 'HIOP.BUSINESS_TYPE',
        computedProps: {
          required: ({ record }) => requiredByRequestType(record),
        },
        defaultValue: '01',
      },
      {
        name: 'bankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => requiredByRequestTypeAndInvoiceType(record),
        },
      },
      {
        name: 'invoiceTypeObj',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_INVOICE_TYPE',
        lovPara: { requestType: 'INVOICE_PREPARE' },
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        computedProps: {
          required: ({ record }) => requiredByRequestType(record),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        bind: 'invoiceTypeObj.value',
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        bind: 'invoiceTypeObj.meaning',
      },
      {
        name: 'invoiceTypeTag',
        type: FieldType.string,
        bind: 'invoiceTypeObj.tag',
        ignore: FieldIgnore.always,
      },
      {
        name: 'requestTypeObj',
        label: intl.get('hiop.invoiceWorkbench.modal.requestTypeObj').d('业务类型'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_BUSINESS_TYPE',
        lovPara: { requestType: 'INVOICE_PREPARE' },
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'businessType',
        label: intl.get('hiop.invoiceWorkbench.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.value',
      },
      {
        name: 'businessTypeMeaning',
        label: intl.get('hiop.invoiceWorkbench.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.meaning',
      },
      {
        name: 'billFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK ',
        required: true,
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get('hiop.tobeInvoice.modal.paperTicketReceiverAddress').d('纸票收件地址'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.tobeInvoice.modal.paperTicketReceiverPhone').d('纸票收件电话'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'electronicType',
        label: intl.get('hiop.invoiceWorkbench.modal.electronicReceiverInfo').d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get('hiop.tobeInvoice.modal.electronicReceiverInfo').d('电票交付邮件或电话'),
        type: FieldType.string,
        labelWidth: '150',
        computedProps: {
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return phoneReg;
              }
            }
          },
        },
      },
    ],
  };
};
