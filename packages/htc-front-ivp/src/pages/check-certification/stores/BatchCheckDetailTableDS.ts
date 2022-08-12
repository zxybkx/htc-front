/**
 * @Description: 批量勾选明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-06-16 16:50
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hivp.checkCertification';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { type } = dsParams;
  let url = '';
  switch (type) {
    case '0':
      url = `${API_PREFIX}/v1/${tenantId}/batch-check/fail-detail`;
      break;
    case '1':
      url = `${API_PREFIX}/v1/${tenantId}/batch-check/batch-uncertified-invoice`;
      break;
    case '2':
      url = `${API_PREFIX}/v1/${tenantId}/batch-check/abnormal-detail`;
      break;
    default:
      break;
  }
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        const { validTaxAmount, companyId, invoiceCode, invoiceNo } = data[0];
        return {
          url: `${API_PREFIX}/v1/${tenantId}/batch-check/modified-effective-tax`,
          data,
          params: {
            ...params,
            validTaxAmount,
            companyId,
            invoiceCode,
            invoiceNo,
          },
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/batch-check/batch-remove-details`,
          data,
          method: 'DELETE',
        };
      },
    },
    pageSize: 10,
    primaryKey: 'batchCheckDetailTable',
    fields: [
      {
        name: 'checkState',
        label: intl.get(`${modelCode}.view.checkState`).d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.view.buyerTaxNo').d('购方税号'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'isMatch',
        label: intl.get('hivp.bill.view.fppp').d('发票匹配'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceState').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'isPoolFlag',
        label: intl.get(`${modelCode}.view.enteredThePool`).d('是否已入池'),
        type: FieldType.string,
        lookupCode: 'HTC.HIVP.ISPOOL_FLAG',
      },
      {
        name: 'checkDate',
        label: intl.get(`${modelCode}.view.checkTime`).d('勾选时间'),
        type: FieldType.string,
      },
      {
        name: 'authenticationState',
        label: intl.get(`${modelCode}.view.currentCertState`).d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
      },
      {
        name: 'authenticationType',
        label: intl.get(`${modelCode}.view.authenticationType`).d('认证类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'failedDetail',
        label: intl.get('hivp.taxRefund.view.message.sync.cause').d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'infoSource',
        label: intl.get(`${modelCode}.view.infoSource`).d('信息来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.FROM_TYPE',
      },
      {
        name: 'taxBureauManageState',
        label: intl.get('hivp.bill.view.taxBureauManageState').d('税局管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
      {
        name: 'purpose',
        label: intl.get(`${modelCode}.view.purpose`).d('用途'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_CHECK_FOR',
      },
      {
        name: 'entryAccountState',
        label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
      {
        name: 'receiptsState',
        label: intl.get(`${modelCode}.view.receiptsState`).d('单据关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
      },
      {
        name: 'abnormalSign',
        label: intl.get(`${modelCode}.view.abnormalSign`).d('异常标记'),
        type: FieldType.string,
        lookupCode: 'HIVP.ABNORMAL_SIGN',
        multiple: ',',
      },
      {
        name: 'annotation',
        label: intl.get(`${modelCode}.view.annotation`).d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
    ],
    queryFields: [
      {
        name: 'batchNo',
        label: intl.get('hiop.redInvoiceInfo.modal.batchNo').d('批次号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.date,
        ignore: FieldIgnore.always,
        readOnly: true,
      },
      {
        name: 'completeTime',
        label: intl.get(`${modelCode}.view.completeTime`).d('完成时间'),
        type: FieldType.date,
        ignore: FieldIgnore.always,
        readOnly: true,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'checkState',
        label: intl.get(`${modelCode}.view.checkState`).d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'failedDetail',
        label: intl.get('hivp.taxRefund.view.message.sync.cause').d('失败原因'),
        type: FieldType.string,
      },
    ],
  };
};
