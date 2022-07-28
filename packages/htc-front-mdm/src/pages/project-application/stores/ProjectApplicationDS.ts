/**
 * @Description:项目申请管理
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-14 9:49:22
 * @LastEditTime: 2022-06-20 17:07:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentUser } from 'utils/utils';

const modelCode = 'hmdm.project-application';
const loginInfo = getCurrentUser();
const API_PREFIX = commonConfig.MDM_API || '';

export default (): DataSetProps => {
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/apply-items/query-items-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/save-items-tenant`,
          data,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/delete-items-infos`,
          data,
          method: 'DELETE',
        };
      },
    },
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    primaryKey: 'tenantId',
    fields: [
      {
        name: 'subAccountStatus',
        label: intl.get(`${modelCode}.view.subAccountStatus`).d('状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_ACCOUNT_STATUS',
        defaultValue: '1',
        readOnly: true,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.string,
      },
      {
        name: 'contractCustomerName',
        label: intl.get(`${modelCode}.view.contractCustomerName`).d('客户全称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'customerAdmin',
        label: intl.get(`${modelCode}.view.customerAdmin`).d('客户管理员'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'customerPhone',
        label: intl.get(`${modelCode}.view.customerPhone`).d('客户手机号'),
        type: FieldType.string,
        pattern: phoneReg,
        required: true,
      },
      {
        name: 'customerEmail',
        label: intl.get(`${modelCode}.view.customerEmail`).d('客户邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('立项项目编号'),
        type: FieldType.string,
        labelWidth: '130',
        required: true,
      },
      {
        name: 'contractNumber',
        label: intl.get(`${modelCode}.view.contractNumber`).d('合同号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'collection',
        label: intl.get(`${modelCode}.view.collection`).d('是否回款'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'deliveryName',
        label: intl.get(`${modelCode}.view.deliveryName`).d('汉得交付人'),
        type: FieldType.string,
      },
      {
        name: 'customerSystem',
        label: intl.get(`${modelCode}.view.customerSystem`).d('客户对接产品'),
        type: FieldType.string,
      },
      {
        name: 'linksCode',
        label: intl.get(`${modelCode}.view.linksCode`).d('链接'),
        type: FieldType.string,
      },
      {
        name: 'systemTenantCode',
        label: intl.get(`${modelCode}.view.systemTenantCode`).d('租户编码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'tenantId',
        label: intl.get(`${modelCode}.view.tenantId`).d('租户ID'),
        type: FieldType.string,
      },
      {
        name: 'subAccount',
        label: intl.get(`${modelCode}.view.subAccount`).d('子账户'),
        type: FieldType.string,
      },
      {
        name: 'subAccountPwd',
        label: intl.get(`${modelCode}.view.subAccountPwd`).d('密码'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'contractCustomerName',
          label: intl.get(`${modelCode}.view.contractCustomerName`).d('客户名称'),
          type: FieldType.string,
        },
        {
          name: 'companyTaxNumber',
          label: intl.get(`${modelCode}.view.companyTaxNumber`).d('税号'),
          type: FieldType.string,
        },
        {
          name: 'phoneOrEmail',
          label: intl.get(`${modelCode}.view.phoneOrEmail`).d('客户手机邮箱'),
          type: FieldType.string,
          computedProps: {
            pattern: ({ record }) => {
              if (record.get('phoneOrEmail')) {
                if (record.get('phoneOrEmail').indexOf('@') > -1) {
                  return EMAIL;
                } else {
                  return phoneReg;
                }
              }
            },
          },
        },
        {
          name: 'creationDateObj',
          label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
          range: ['creationDate', 'creationEndDate'],
          defaultValue: {
            creationDate: moment().startOf('month'),
            creationEndDate: moment().endOf('day'),
          },
          type: FieldType.date,
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'creationDate',
          label: intl.get(`${modelCode}.view.creationDate`).d('创建时间从'),
          type: FieldType.date,
          bind: 'creationDateObj.creationDate',
        },
        {
          name: 'creationEndDate',
          label: intl.get(`${modelCode}.view.creationDateTo`).d('创建时间至'),
          type: FieldType.date,
          bind: 'creationDateObj.creationEndDate',
        },
        {
          name: 'openTenantDateObj',
          label: intl.get(`${modelCode}.view.importDate`).d('开通日期'),
          range: ['openTenantStartDate', 'openTenantEndDate'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'openTenantStartDate',
          label: intl.get(`${modelCode}.view.importDateFrom`).d('开通日期从'),
          type: FieldType.date,
          bind: 'openTenantDateObj.openTenantStartDate',
        },
        {
          name: 'openTenantEndDate',
          label: intl.get(`${modelCode}.view.importDateTo`).d('开通日期至'),
          type: FieldType.date,
          bind: 'openTenantDateObj.openTenantEndDate',
        },
        {
          name: 'subAccountStatus',
          label: intl.get(`${modelCode}.view.subAccountStatus`).d('审核状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.APPLY_ACCOUNT_STATUS',
        },
        {
          name: 'sourceType',
          label: intl.get(`${modelCode}.view.sourceType`).d('数据来源'),
          type: FieldType.string,
          lookupCode: 'HTC.HMDM.APPLY_SOURCE_TYPE',
        },
        {
          name: 'openFunc',
          label: intl.get(`${modelCode}.view.openFunc`).d('开通服务'),
          type: FieldType.string,
          lookupCode: 'HTC.HMDM.CUSTOMER_APPLY_SERVICE',
        },
        {
          name: 'tenantObj',
          label: intl.get(`${modelCode}.view.tenantObj`).d('生成租户'),
          type: FieldType.object,
          lovCode: 'HPFM.TENANT',
          ignore: FieldIgnore.always,
        },
        {
          name: 'tenantId',
          type: FieldType.number,
          bind: `tenantName.tenantId`,
        },
      ],
    }),
  };
};

const LinkDS = (): DataSetProps => {
  const { loginName } = loginInfo;
  return {
    transport: {
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/create-link`,
          data: {
            ...data[0],
            createdByName: loginName,
          },
          params,
          method: 'POST',
        };
      },
    },
    events: {
      update: ({ record, name, value }) => {
        if (name === 'linksType') {
          record.set({ linksAccountStart: moment().format(DEFAULT_DATE_FORMAT) });
          if (value === '1') {
            record.set({
              linksAccountEnd: moment()
                .add(7, 'days')
                .format(DEFAULT_DATE_FORMAT),
            });
          }
          if (value === '2') {
            record.set({
              linksAccountEnd: moment()
                .add(60, 'days')
                .format(DEFAULT_DATE_FORMAT),
            });
          }
          if (value === '3') {
            record.set({
              linksAccountEnd: moment()
                .add(1, 'years')
                .format(DEFAULT_DATE_FORMAT),
            });
          }
        }
      },
    },
    fields: [
      {
        name: 'linksType',
        label: intl.get(`${modelCode}.view.linksType`).d('用途'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_TYPE ',
        defaultValue: '2',
        required: true,
      },
      {
        name: 'linksAccountObj',
        label: intl.get(`${modelCode}.view.linksAccountObj`).d('账号有效期'),
        range: ['linksAccountStart', 'linksAccountEnd'],
        type: FieldType.date,
        defaultValue: {
          linksAccountStart: moment().format(DEFAULT_DATE_FORMAT),
          linksAccountEnd: moment()
            .add(60, 'days')
            .format(DEFAULT_DATE_FORMAT),
        },
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'linksAccountStart',
        label: intl.get(`${modelCode}.view.linksAccountStart`).d('账号开通起'),
        type: FieldType.date,
        bind: 'linksAccountObj.linksAccountStart',
      },
      {
        name: 'linksAccountEnd',
        label: intl.get(`${modelCode}.view.linksAccountEnd`).d('账号开通至'),
        type: FieldType.date,
        bind: 'linksAccountObj.linksAccountEnd',
      },
      {
        name: 'phone',
        label: intl.get(`${modelCode}.view.phone`).d('手机号'),
        type: FieldType.string,
        pattern: phoneReg,
        computedProps: {
          required: ({ record }) => !record.get('email'),
        },
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        computedProps: {
          required: ({ record }) => !record.get('phone'),
        },
      },
      {
        name: 'tenantObject',
        label: intl.get(`${modelCode}.view.tenantObject`).d('已建租户'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
      },
      {
        name: 'systemTenantId',
        type: FieldType.string,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'systemTenantCode',
        type: FieldType.string,
        bind: `tenantObject.tenantNum`,
      },
      {
        name: 'systemTenantName',
        type: FieldType.string,
        bind: `tenantObject.tenantName`,
      },
      {
        name: 'companyNameObject',
        label: intl.get(`${modelCode}.view.companyNameObject`).d('已建公司'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        cascadeMap: { organizationId: 'systemTenantId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: `companyNameObject.companyCode`,
      },
      {
        name: 'systemCompanyId',
        type: FieldType.number,
        bind: `companyNameObject.companyId`,
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: `companyNameObject.companyName`,
      },
      {
        name: 'linksCode',
        label: intl.get(`${modelCode}.view.linksCode`).d('生成链接'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'validityDay',
        label: intl.get(`${modelCode}.view.validityDay`).d('有效期'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_VALID',
        required: true,
      },
    ],
  };
};

export { LinkDS };
