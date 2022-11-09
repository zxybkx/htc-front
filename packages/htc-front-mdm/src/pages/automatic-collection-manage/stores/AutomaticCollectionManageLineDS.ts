/**
 * stores - 自动催收管理——行
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-06 14:30
 * @LastEditeTime: 2022-06-20 15:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { dataSet } = config;
        let tenantId;
        let companyCode;
        let remindMode;
        if (dataSet && dataSet.parent) {
          tenantId = dataSet.parent.current!.get('tenantId');
          companyCode = dataSet.parent.current!.get('companyCode');
          remindMode = dataSet.parent.current!.get('remindMode');
        }
        const url = companyCode
          ? `${API_PREFIX}/v1/auto-con-infos/get-all-info-line-company`
          : `${API_PREFIX}/v1/auto-con-infos/get-all-info-line`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
            companyCode,
            remindMode,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'collectionManageLines',
    fields: [
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeCode',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeCode').d('费用类型代码'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeMeaning',
        label: intl.get('hmdm.automaticCollection.view.expensesTypeMeaning').d('费用类型'),
        type: FieldType.string,
      },
      {
        name: 'solutionPackage',
        label: intl.get('hmdm.automaticCollection.view.solutionPackage').d('方案包'),
        type: FieldType.string,
        lookupCode: 'HMDM.PLAN_PACKAGE',
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get('htc.common.view.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'billingCode',
        label: intl.get('htc.common.view.unit').d('单位'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_CODE',
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
        name: 'usedQuantity',
        label: intl.get('hmdm.automaticCollection.view.usedQuantity').d('目前已使用'),
        type: FieldType.number,
      },
      {
        name: 'remainingQuantity',
        label: intl.get('hmdm.automaticCollection.view.remainingQuantity').d('剩余数量'),
        type: FieldType.number,
      },
      {
        name: 'conReason',
        label: intl.get('hmdm.automaticCollection.view.conReason').d('催收原因'),
        type: FieldType.string,
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
        name: 'customerBillingModelCode',
        label: intl.get('hmdm.automaticCollection.view.customerBillingModelCode').d('客户计费模式'),
        type: FieldType.string,
        lookupCode: 'HMDM.CUSTOMER_BILLING_MODEL',
      },
    ],
  };
};
