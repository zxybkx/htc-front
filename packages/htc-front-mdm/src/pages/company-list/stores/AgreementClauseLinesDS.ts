/*
 * @Descripttion:公司协议信息-租户协议条款
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-07 10:19:48
 * @LastEditTime: 2020-08-07 16:05:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hmdm.agreement-clause';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/0/company-list-infos/get-company-lines`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            companyId: dsParams.companyId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'clausesId',
    selection: false,
    fields: [
      {
        name: 'clausesId',
        type: FieldType.number,
      },
      {
        name: 'expensesTypeCode',
        label: intl.get(`${modelCode}.view.expensesTypeCode`).d('费用类型代码'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeMeaning',
        label: intl.get(`${modelCode}.view.expensesTypeMeaning`).d('费用类型'),
        type: FieldType.string,
      },
      {
        name: 'termDescription',
        label: intl.get(`${modelCode}.view.termDescription`).d('条款描述'),
        type: FieldType.string,
      },
      {
        name: 'customerBillingModelCode',
        label: intl.get(`${modelCode}.view.customerBillingModelCode`).d('客户计费模式'),
        type: FieldType.string,
        lookupCode: 'HMDM.CUSTOMER_BILLING_MODEL',
      },
      {
        name: 'billingCode',
        label: intl.get(`${modelCode}.view.billingCode`).d('计费单位'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_CODE',
      },
      {
        name: 'solutionPackageNumber',
        label: intl.get(`${modelCode}.view.solutionPackageNumber`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'usedQuantity',
        label: intl.get(`${modelCode}.view.usedQuantity`).d('已使用数量'),
        type: FieldType.number,
      },
      {
        name: 'remainingQuantity',
        label: intl.get(`${modelCode}.view.remainingQuantity`).d('剩余使用数量'),
        type: FieldType.number,
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
        name: 'billingPrice',
        label: intl.get(`${modelCode}.view.billingPrice`).d('计费单价'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceMethodCode',
        label: intl.get(`${modelCode}.view.invoiceMethodCode`).d('开票方式'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_METHOD',
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.lastUpdateDate`).d('更新时间'),
        type: FieldType.dateTime,
      },
    ],
  };
};
