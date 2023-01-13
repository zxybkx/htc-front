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

const API_PREFIX = commonConfig.MDM_API || '';
const tenantId = getCurrentOrganizationId();
export default (): DataSetProps => {
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
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeTypeInfo',
        label: intl.get('hmdm.employeeInfo.view.employeeTypeInfo').d('员工类型'),
        type: FieldType.object,
      },
      {
        name: 'employeeTypeCode',
        label: intl.get('hmdm.employeeInfo.view.employeeTypeCode').d('类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_TYPE',
        required: true,
      },
      {
        name: 'employeeNum',
        label: intl.get('hiop.invoiceRule.modal.employeeNumObj').d('员工号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeNameInfo',
        label: intl.get('hiop.invoiceRule.modal.employeeName').d('姓名'),
        type: FieldType.object,
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceRule.modal.employeeName').d('姓名'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'internationalTelCode',
        label: intl.get('hivp.batchCheck.view.countryCode').d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        required: true,
        defaultValue: '+86',
      },
      {
        name: 'mobile',
        label: intl.get('hzero.common.cellphone').d('手机号'),
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
              return {
                patternMismatch: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
              };
            }
          },
        },
      },
      {
        name: 'connectInfo',
        label: intl.get('hmdm.employeeInfo.view.connectInfo').d('联系信息'),
        type: FieldType.object,
      },
      {
        name: 'email',
        label: intl.get('hmdm.employeeInfo.view.email').d('电子邮箱'),
        type: FieldType.string,
        required: true,
        pattern: EMAIL,
        defaultValidationMessages: {
          patternMismatch: intl.get('hzero.common.validation.email').d('邮箱格式不正确'), // 正则不匹配的报错信息
        },
      },
      {
        name: 'organization',
        label: intl.get('hmdm.employeeInfo.view.organization').d('组织架构'),
        type: FieldType.object,
      },
      {
        name: 'department',
        label: intl.get('hmdm.employeeInfo.view.department').d('员工部门-岗位'),
        type: FieldType.string,
      },
      {
        name: 'status',
        label: intl.get('hmdm.employeeInfo.view.status').d('员工状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_STATUS',
        required: true,
      },
      {
        name: 'rolesObject',
        label: intl.get('hmdm.employeeInfo.view.rolesObject').d('员工角色分配'),
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
        bind: 'rolesObject.name',
        multiple: ',',
      },
      {
        name: 'roleIds',
        type: FieldType.string,
        bind: 'rolesObject.id',
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
        label: intl.get('htc.common.modal.enabledFlag').d('启用状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'validPeriod',
        label: intl.get('hivp.documentType.view.dateInfo').d('有效期'),
        type: FieldType.object,
      },
      {
        name: 'startDate',
        label: intl.get('hmdm.companyList.view.startDate').d('有效期从'),
        type: FieldType.date,
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'endDate',
        label: intl.get('hmdm.companyList.view.endDate').d('有效期至'),
        type: FieldType.date,
        min: 'startDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'vendorId',
        label: intl.get('hmdm.employeeInfo.view.vendorId').d('供应商'),
        type: FieldType.string,
      },
      {
        name: 'caseProductFlag',
        label: intl.get('hmdm.employeeInfo.view.caseProductFlag').d('是否分商品'),
        type: FieldType.string,
        lookupCode: 'HPFM.FLAG',
      },
    ],
    queryFields: [
      {
        name: 'companyNameObject',
        label: intl.get('hivp.documentType.view.companyObj').d('公司全称'),
        type: 'object' as FieldType,
        lovCode: 'HMDM.COMPANY_NAME',
        lovPara: { tenantId, enabledFlag: 1 },
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'companyId',
        type: FieldType.string,
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
        name: 'employeeId',
        type: FieldType.string,
        bind: `companyNameObject.employeeId`,
      },
      {
        name: 'roleIdObject',
        label: intl.get('hmdm.employeeInfo.view.roleId').d('员工角色'),
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
        type: FieldType.string,
        bind: `roleIdObject.id`,
        multiple: ',',
      },
      {
        name: 'employeeNum',
        label: intl.get('hiop.invoiceRule.modal.employeeNumObj').d('员工号'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceRule.modal.employeeName').d('姓名'),
        type: FieldType.string,
      },
      {
        name: 'mobile',
        label: intl.get('hzero.common.cellphone').d('手机号'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('htc.common.modal.enabledFlag').d('启用状态'),
        type: FieldType.number,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'status',
        label: intl.get('hmdm.employeeInfo.view.status').d('员工状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.EMPLOYEE_STATUS',
      },
    ],
  };
};

const ElectricInfo = (): DataSetProps => {
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/employee-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    fields: [
      {
        name: 'employeeName',
        label: intl.get('hmdm.employeeInfo.view.employeeName').d('办税人员姓名'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'loginMethod',
        label: intl.get('hmdm.employeeInfo.view.loginMethod').d('电局登录方式'),
        lookupCode: 'HTC.HMDM_JC_LOGIN_METHOD',
        type: FieldType.string,
        required: true,
      },
      {
        name: 'loginType',
        label: intl.get('hmdm.employeeInfo.view.loginType').d('电局登录类型'),
        lookupCode: 'HTC.HMDM_JC_LOGIN_TYPE',
        type: FieldType.string,
        required: true,
      },
      {
        name: 'loginIdentity',
        label: intl.get('hmdm.employeeInfo.view.loginIdentity').d('电局登录身份'),
        lookupCode: 'HTC.HMDM_JC_LOGIN_AS',
        type: FieldType.string,
        required: true,
      },
      {
        name: 'loginIdentityPassword',
        label: intl.get('hmdm.employeeInfo.view.loginIdentityPassword').d('电局登录身份密码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'idNumber',
        label: intl.get('hmdm.employeeInfo.view.idNumber').d('办税人员身份证号'),
        type: FieldType.string,
        required: true,
        labelWidth: '130',
      },
      {
        name: 'taxpayersPhone',
        label: intl.get('hmdm.employeeInfo.view.mobile').d('办税人员手机号'),
        type: FieldType.string,
        required: true,
        pattern: phoneReg,
      },
      {
        name: 'loginAccount',
        label: intl.get('hmdm.employeeInfo.view.loginAccount').d('电局登录账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'loginPassword',
        label: intl.get('hmdm.employeeInfo.view.loginPassword').d('电局登录密码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'regionCodeObj',
        label: intl.get('hmdm.employeeInfo.view.regionCode').d('地区编码'),
        type: FieldType.object,
        lovCode: 'HTC.HMDM_JC_REGION_CODE',
        required: true,
      },
      {
        name: 'regionCode',
        type: FieldType.string,
        bind: 'regionCodeObj.value',
      },
      {
        name: 'middleNumber',
        label: intl.get('hmdm.employeeInfo.view.middleNumber').d('中间号'),
        type: FieldType.string,
      },
    ],
  };
};
export { ElectricInfo };
