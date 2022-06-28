/**
 * stores - 自动催收规则维护行
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:04
 * @LastEditeTime: 2022-06-20 15:12
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.automatic-collection-rules-lines';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { dataSet } = config;
        let tenantId;
        if (dataSet && dataSet.parent) {
          tenantId = dataSet.parent.current!.get('tenantId');
        }
        const url = `${API_PREFIX}/v1/auto-con-infos/get-configure-line`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: { tenantId },
          method: 'GET',
        };
        return axiosConfig;
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/auto-con-infos/save-configure-line`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'collectionRulesLines',
    fields: [
      {
        name: 'expensesTypeObject',
        label: intl.get(`${modelCode}.view.expensesTypeCode`).d('费用类型代码'),
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
        label: intl.get(`${modelCode}.view.expensesTypeMeaning`).d('费用类型'),
        type: FieldType.string,
        bind: 'expensesTypeObject.meaning',
      },
      {
        name: 'solutionPackage',
        label: intl.get(`${modelCode}.view.solutionPackage`).d('方案包'),
        type: FieldType.string,
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get(`${modelCode}.view.solutionPackageNumber`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'billingCode',
        label: intl.get(`${modelCode}.view.billingCode`).d('单位'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_CODE',
      },
      {
        name: 'annualFee',
        label: intl.get(`${modelCode}.view.annualFee`).d('年费'),
        type: FieldType.currency,
      },
      {
        name: 'excessUnitPrice',
        label: intl.get(`${modelCode}.view.excessUnitPrice`).d('超量后单价'),
        type: FieldType.currency,
      },
      {
        name: 'customerBillingModelCodeMeaning',
        label: intl.get(`${modelCode}.view.customerBillingModelCodeMeaning`).d('客户计费模式'),
        type: FieldType.string,
      },
      {
        name: 'billingStartDate',
        label: intl.get(`${modelCode}.view.billingStartDate`).d('计费有效期从'),
        type: FieldType.dateTime,
      },
      {
        name: 'billingEndDate',
        label: intl.get(`${modelCode}.view.billingEndDate`).d('计费有效期到'),
        type: FieldType.dateTime,
      },
      {
        name: 'daysRemind',
        label: intl.get(`${modelCode}.view.daysRemind`).d('剩余天数提醒'),
        type: FieldType.number,
      },
      {
        name: 'onceRemind',
        label: intl.get(`${modelCode}.view.onceRemind`).d('剩余次数提醒'),
        type: FieldType.number,
      },
      {
        name: 'daysSend',
        label: intl.get(`${modelCode}.view.daysSend`).d('剩余天数发送'),
        type: FieldType.number,
      },
      {
        name: 'onceSend',
        label: intl.get(`${modelCode}.view.onceSend`).d('剩余次数发送'),
        type: FieldType.number,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
        type: FieldType.boolean,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
      },
    ],
  };
};
