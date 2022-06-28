/**
 * employeeDefend - 员工信息维护
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.employee-define';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/employee-infos`;
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
          url: `${API_PREFIX}/v1/${tenantId}/employee-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/employee-infos/batch-save`,
          data,
          params,
          createAccountFlag: 0,
          method: 'POST',
        };
      },
      create: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/employee-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'employeeId',
    fields: [
      {
        name: 'employeeId',
        type: FieldType.number,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeTypeInfo',
        label: intl.get(`${modelCode}.view.employeeTypeInfo`).d('员工类型'),
        type: FieldType.object,
      },
      {
        name: 'employeeTypeCode',
        label: intl.get(`${modelCode}.view.employeeTypeCode`).d('类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_TYPE',
        required: true,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeNameInfo',
        label: intl.get(`${modelCode}.view.employeeNameInfo`).d('姓名'),
        type: FieldType.object,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('姓名'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`${modelCode}.view.internationalTelCode`).d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        required: true,
        defaultValue: '+86',
      },
      {
        name: 'mobile',
        label: intl.get(`${modelCode}.view.mobile`).d('手机号'),
        type: FieldType.string,
        required: true,
        computedProps: {
          pattern: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return phoneReg;
            }
          },
          defaultValidationMessages: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return { patternMismatch: '手机格式不正确' };
            }
          },
        },
      },
      {
        name: 'connectInfo',
        label: intl.get(`${modelCode}.view.connectInfo`).d('联系信息'),
        type: FieldType.object,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('电子邮箱'),
        type: FieldType.string,
        required: true,
        pattern: EMAIL,
        defaultValidationMessages: {
          patternMismatch: '邮箱格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'organization',
        label: intl.get(`${modelCode}.view.organization`).d('组织架构'),
        type: FieldType.object,
      },
      {
        name: 'department',
        label: intl.get(`${modelCode}.view.department`).d('员工部门-岗位'),
        type: FieldType.string,
      },
      {
        name: 'status',
        label: intl.get(`${modelCode}.view.status`).d('员工状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_STATUS',
        required: true,
      },
      {
        name: 'rolesObject',
        label: intl.get(`${modelCode}.view.rolesMeaning`).d('员工角色分配'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_ROLES',
        required: true,
        lovPara: { tenantId },
        multiple: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'rolesMeaning',
        type: FieldType.string,
        bind: `rolesObject.name`,
        multiple: ',',
      },
      {
        name: 'roleIds',
        type: FieldType.number,
        bind: `rolesObject.id`,
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'roleIdList',
        type: FieldType.object,
        // bind: `rolesObject.id`,
        transformRequest: (_value, record) => record && record.get('roleIds'),
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'validPeriod',
        label: intl.get(`${modelCode}.view.validPeriod`).d('有效期'),
        type: FieldType.object,
      },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.startDate`).d('有效期从'),
        type: FieldType.date,
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'endDate',
        label: intl.get(`${modelCode}.view.endDate`).d('有效期至'),
        type: FieldType.date,
        min: 'startDate',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'vendorId',
        label: intl.get(`${modelCode}.view.vendorId`).d('供应商'),
        type: FieldType.string,
      },
      {
        name: 'caseProductFlag',
        label: intl.get(`${modelCode}.view.caseProductFlag`).d('是否分商品'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
      },
    ],
    queryFields: [
      {
        name: 'companyNameObject',
        label: intl.get(`${modelCode}.view.companyNameObject`).d('公司全称'),
        type: 'object' as FieldType,
        lovCode: 'HMDM.COMPANY_NAME',
        lovPara: { tenantId, enabledFlag: 1 },
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: `companyNameObject.companyId`,
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: `companyNameObject.companyName`,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: `companyNameObject.companyCode`,
      },
      {
        name: 'roleIdObject',
        label: intl.get(`${modelCode}.view.roleId`).d('员工角色'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_ROLES',
        lovPara: { tenantId },
        multiple: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'roleName',
        type: FieldType.string,
        bind: `roleIdObject.name`,
        ignore: FieldIgnore.always,
      },
      {
        name: 'roleIds',
        type: FieldType.number,
        bind: `roleIdObject.id`,
        multiple: ',',
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('姓名'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
        type: FieldType.number,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'status',
        label: intl.get(`${modelCode}.view.status`).d('员工状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_STATUS',
      },
    ],
  };
};
