/**
 * @Description:租户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:26:22
 * @LastEditTime: 2022-06-20 17:08:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';

const modelCode = 'hmdm.apply-tenantList';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/apply-items/query-apply-company-func`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            uniqueCode: dsParams.uniqueCode,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/save-company-func`,
          data,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/delete-company-func`,
          data,
          method: 'DELETE',
        };
      },
    },
    primaryKey: 'companyFuncId',
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    fields: [
      {
        name: 'funcCode',
        label: intl.get(`${modelCode}.view.funcCode`).d('服务名称'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.CUSTOMER_APPLY_SERVICE',
        required: true,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.string,
      },
      {
        name: 'creationDateObj',
        label: intl.get(`${modelCode}.view.creationDate`).d('开通时间'),
        range: ['openStartDate', 'openEndDate'],
        type: FieldType.date,
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'openStartDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('开通时间起'),
        type: FieldType.date,
        bind: 'creationDateObj.openStartDate',
      },
      {
        name: 'openEndDate',
        label: intl.get(`${modelCode}.view.creationDateTo`).d('开通时间止'),
        type: FieldType.date,
        bind: 'creationDateObj.openEndDate',
      },
      {
        name: 'validityDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('有效期'),
        range: ['validityStartDate', 'validityEndDate'],
        type: FieldType.date,
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'validityStartDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('有效期从'),
        type: FieldType.date,
        bind: 'validityDate.validityStartDate',
      },
      {
        name: 'validityEndDate',
        label: intl.get(`${modelCode}.view.validityEndDate`).d('有效期至'),
        type: FieldType.date,
        bind: 'validityDate.validityEndDate',
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
        computedProps: {
          required: ({ record }) => record.get('serverType') === 'MEASURE_SERVICE',
        },
      },
      {
        name: 'serverType',
        label: intl.get(`${modelCode}.view.serverType`).d('服务方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM_BILLING_SERVICE_CATEGORY',
        required: true,
      },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('附件'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
    ],
  };
};
