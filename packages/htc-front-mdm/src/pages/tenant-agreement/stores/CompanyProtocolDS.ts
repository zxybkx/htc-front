/**
 * @Description: 租户协议维护
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import commonConfig from '@htccommon/config/commonConfig';

export default (tenantId): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/agreement-company-infos-lines/get-lines`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/agreement-company-infos-lines/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      create: ({ data, params }) => {
        const newList = data.map(item => ({
          ...item,
          tenantId,
        }));
        return {
          url: `${API_PREFIX}/v1/agreement-company-infos-lines/batch-save`,
          data: newList,
          params,
          method: 'POST',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/agreement-company-infos-lines/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/agreement-company-infos-lines/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitFailed: resp => {
        notification.error({
          description: '',
          message: resp && resp.message,
        });
      },
    },
    pageSize: 10,
    primaryKey: 'companyProtocolId',
    selection: 'multiple' as DataSetSelection,
    fields: [
      {
        name: 'indicatorPlanLineId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeObject',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeCode').d('费用类型代码'),
        type: FieldType.object,
        lovCode: 'HMDM.EXPENSES_TYPE_CODE',
        ignore: FieldIgnore.always,
      },
      {
        name: 'expensesTypeCode',
        type: FieldType.string,
        bind: 'expensesTypeObject.value',
      },
      {
        name: 'expensesTypeMeaning',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeMeaning').d('费用类型'),
        type: FieldType.string,
        bind: 'expensesTypeObject.meaning',
      },
      {
        name: 'solutionPackage',
        label: intl.get('hmdm.automaticCollection.view.solutionPackage').d('方案包'),
        type: FieldType.string,
        // required: true,
        lookupCode: 'HMDM.PLAN_PACKAGE',
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get('htc.common.view.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'annualFee',
        label: intl.get('hmdm.automaticCollection.view.annualFee').d('年费'),
        type: FieldType.currency,
      },
      {
        name: 'excessUnitPrice',
        label: intl.get('hmdm.automaticCollection.view.excessUnitPrice').d('超量后单价'),
        type: FieldType.currency,
      },
      {
        name: 'termDescription',
        label: intl.get('hmdm.companyList.view.termDescription').d('条款描述'),
        type: FieldType.string,
      },
      {
        name: 'customerBillingModelCode',
        label: intl.get('hmdm.automaticCollection.view.customerBillingModelCode').d('客户计费模式'),
        type: FieldType.string,
        lookupCode: 'HMDM.CUSTOMER_BILLING_MODEL',
      },
      {
        name: 'billingCode',
        label: intl.get('htc.common.view.unit').d('单位'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_CODE',
      },
      {
        name: 'billingStartDate',
        label: intl.get('hmdm.automaticCollection.view.billingStartDate').d('计费起始日'),
        type: FieldType.dateTime,
      },
      {
        name: 'billingEndDate',
        label: intl.get('hmdm.automaticCollection.view.billingEndDate').d('计费到期日'),
        type: FieldType.dateTime,
      },
      {
        name: 'billingPrice',
        label: intl.get('hmdm.companyList.view.billingPrice').d('计费单价'),
        type: FieldType.currency,
      },
      {
        name: 'billingRule',
        label: intl.get('hmdm.billStatement.view.billingRule').d('计费规则'),
        type: FieldType.string,
      },
      {
        name: 'invoiceMethodCode',
        label: intl.get('hmdm.billStatement.view.invoiceMethodCode').d('开票方式'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_METHOD',
      },
      {
        name: 'enabledFlag',
        label: intl.get('htc.common.modal.enabledFlag').d('启用状态'),
        type: FieldType.boolean,
        required: true,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
      },
    ],
  };
};
