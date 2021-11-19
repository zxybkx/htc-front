/**
 * @Description:账单报表列表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-08 10:44:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, DataSetSelection, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hmdm.bill-statement';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/billing-informations/get-billing`;
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
    selection: DataSetSelection.multiple,
    primaryKey: 'agreementCompanyLineId',
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'billNumber',
        label: intl.get(`${modelCode}.view.billNumber`).d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('账单类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_TYPE',
      },
      {
        name: 'customerBillingModelCodeMeaning',
        label: intl.get(`${modelCode}.view.customerBillingModelCodeMeaning`).d('计费类型'),
        type: FieldType.string,
      },
      {
        name: 'solutionPackageMeaning',
        label: intl.get(`${modelCode}.view.solutionPackageMeaning`).d('方案包'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeMeaning',
        label: intl.get(`${modelCode}.view.expensesTypeMeaning`).d('费用类型'),
        type: FieldType.string,
      },
      {
        name: 'annualFee',
        label: intl.get(`${modelCode}.view.annualFee`).d('年费'),
        type: FieldType.currency,
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get(`${modelCode}.view.solutionPackageNumber`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'usedQuantity',
        label: intl.get(`${modelCode}.view.usedQuantity`).d('已使用'),
        type: FieldType.number,
      },
      {
        name: 'remainingQuantity',
        label: intl.get(`${modelCode}.view.remainingQuantity`).d('剩余数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'excessUnitPrice',
        label: intl.get(`${modelCode}.view.excessUnitPrice`).d('超量后单价'),
        type: FieldType.currency,
      },
      {
        name: 'billingCode',
        label: intl.get(`${modelCode}.view.billingCode`).d('单位'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_CODE',
      },
      {
        name: 'billingStartDate',
        label: intl.get(`${modelCode}.view.billingStartDate`).d('计费起始日'),
        type: FieldType.dateTime,
      },
      {
        name: 'billingEndDate',
        label: intl.get(`${modelCode}.view.billingEndDate`).d('计费到期日'),
        type: FieldType.dateTime,
      },
      {
        name: 'billingRule',
        label: intl.get(`${modelCode}.view.billingRule`).d('计费规则'),
        type: FieldType.string,
      },
      {
        name: 'invoiceMethodCode',
        label: intl.get(`${modelCode}.view.invoiceMethodCode`).d('开票方式'),
        type: FieldType.string,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.lastUpdateDate`).d('账单生成时间'),
        type: FieldType.date,
      },
      {
        name: 'receiver',
        label: intl.get(`${modelCode}.view.receiver`).d('账单接收人'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('账单接收邮箱'),
        type: FieldType.string,
      },
      {
        name: 'phone',
        label: intl.get(`${modelCode}.view.phone`).d('联系方式'),
        type: FieldType.string,
      },
      {
        name: 'sendDate',
        label: intl.get(`${modelCode}.view.sendDate`).d('发送时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'expirationStatus',
        label: intl.get(`${modelCode}.view.expirationStatus`).d('到期状态'),
        type: FieldType.string,
        lookupCode: 'HMDM_EXPIRE_STATUS',
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get(`${modelCode}.view.tenantObject`).d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'companyNameObject',
        label: intl.get(`${modelCode}.view.companyNameObject`).d('公司名称'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        cascadeMap: { organizationId: 'tenantId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: `companyNameObject.companyCode`,
      },
      {
        name: 'agreementCompanyId',
        type: FieldType.number,
        bind: `companyNameObject.agreementCompanyId`,
      },
      {
        name: 'expensesTypeObject',
        label: intl.get(`${modelCode}.view.expensesTypeCode`).d('费用类型'),
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
        name: 'billNumber',
        label: intl.get(`${modelCode}.view.billNumber`).d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'expirationStatus',
        label: intl.get(`${modelCode}.view.expirationStatus`).d('到期状态'),
        type: FieldType.string,
        lookupCode: 'HMDM_EXPIRE_STATUS',
      },
      {
        name: 'customerBillingModelCode',
        label: intl.get(`${modelCode}.view.customerBillingModelCode`).d('计费类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.CUSTOMER_BILLING_MODEL',
      },
    ],
  };
};
