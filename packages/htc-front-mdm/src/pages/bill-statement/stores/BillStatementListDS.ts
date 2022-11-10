/**
 * @Description: 账单报表列表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-08 10:44:22
 * @LastEditTime: 2022-06-20 15:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';

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
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'billNumber',
        label: intl.get('hmdm.billStatement.view.billNumber').d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'billType',
        label: intl.get('hmdm.billStatement.view.billType').d('账单类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_TYPE',
      },
      {
        name: 'customerBillingModelCodeMeaning',
        label: intl.get('hmdm.billStatement.view.customerBillingModelCodeMeaning').d('计费类型'),
        type: FieldType.string,
      },
      {
        name: 'solutionPackageMeaning',
        label: intl.get('hmdm.automaticCollection.view.solutionPackage').d('方案包'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeMeaning',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeMeaning').d('费用类型'),
        type: FieldType.string,
      },
      {
        name: 'annualFee',
        label: intl.get('hmdm.automaticCollection.view.annualFee').d('年费'),
        type: FieldType.currency,
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get('htc.common.view.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'usedQuantity',
        label: intl.get('hmdm.billStatement.view.usedQuantity').d('已使用'),
        type: FieldType.number,
      },
      {
        name: 'remainingQuantity',
        label: intl.get('hmdm.automaticCollection.view.remainingQuantity').d('剩余数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'excessUnitPrice',
        label: intl.get('hmdm.automaticCollection.view.excessUnitPrice').d('超量后单价'),
        type: FieldType.currency,
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
        name: 'billingRule',
        label: intl.get('hmdm.billStatement.view.billingRule').d('计费规则'),
        type: FieldType.string,
      },
      {
        name: 'invoiceMethodCode',
        label: intl.get('hmdm.billStatement.view.invoiceMethodCode').d('开票方式'),
        type: FieldType.string,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get('hmdm.billStatement.view.lastUpdateDate').d('账单生成时间'),
        type: FieldType.date,
      },
      {
        name: 'receiver',
        label: intl.get('hmdm.billStatement.view.receiver').d('账单接收人'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get('hmdm.billStatement.view.email').d('账单接收邮箱'),
        type: FieldType.string,
      },
      {
        name: 'phone',
        label: intl.get('hmdm.billStatement.view.phone').d('联系方式'),
        type: FieldType.string,
      },
      {
        name: 'sendDate',
        label: intl.get('hmdm.automaticCollection.view.sendTime').d('发送时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'expirationStatus',
        label: intl.get('hmdm.billStatement.view.expirationStatus').d('到期状态'),
        type: FieldType.string,
        lookupCode: 'HMDM_EXPIRE_STATUS',
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
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
        label: intl.get('htc.common.view.companyName').d('公司名称'),
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
        type: FieldType.string,
        bind: `companyNameObject.agreementCompanyId`,
      },
      {
        name: 'expensesTypeObject',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeMeaning').d('费用类型'),
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
        label: intl.get('hmdm.billStatement.view.billNumber').d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'expirationStatus',
        label: intl.get('hmdm.billStatement.view.expirationStatus').d('到期状态'),
        type: FieldType.string,
        lookupCode: 'HMDM_EXPIRE_STATUS',
      },
      {
        name: 'customerBillingModelCode',
        label: intl.get('hmdm.billStatement.view.customerBillingModelCodeMeaning').d('计费类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.CUSTOMER_BILLING_MODEL',
      },
    ],
  };
};
