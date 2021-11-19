/*
 * @Descripttion:单据类型维护头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2020-11-25 16:43:26
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.document-type';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/document-type-headers`;
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
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/document-type-headers/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 5,
    selection: false,
    primaryKey: 'docTypeHeaderId',
    fields: [
      {
        name: 'docTypeHeaderId',
        type: FieldType.number,
      },
      {
        name: 'orderSeq',
        label: intl.get(`${modelCode}.view.orderSeq`).d('排序号'),
        type: FieldType.string,
      },
      {
        name: 'systemCode',
        label: intl.get(`${modelCode}.view.systemCode`).d('系统代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'systemName',
        label: intl.get(`${modelCode}.view.systemName`).d('系统名称'),
        type: FieldType.string,
        required: true,
      },
      // {
      //   name: 'employeeId',
      //   type: FieldType.number,
      // },
      // {
      //   name: 'employeeDescription',
      //   label: intl.get(`${modelCode}.view.employeeDescription`).d('添加员工'),
      //   type: FieldType.string,
      // },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.startDate`).d('添加时间'),
        type: FieldType.dateTime,
        defaultValue: moment(),
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('是否启用'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'endDate',
        label: intl.get(`${modelCode}.view.endDate`).d('禁用时间'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'roleCode',
        label: intl.get(`${modelCode}.view.roleCode`).d('租户代码'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        defaultValue: getCurrentTenant().tenantNum,
        readOnly: true,
      },
      {
        name: 'roleName',
        label: intl.get(`${modelCode}.view.roleName`).d('租户名称'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        defaultValue: getCurrentTenant().tenantName,
        readOnly: true,
      },
    ],
  };
};
