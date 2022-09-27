/**
 * @Description:进项发票规则维护
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-operation-new/auto-stat-sign-config`;
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
          url: `${API_PREFIX}/v1/${tenantId}/invoice-operation-new/auto-stat-sign-config`,
          data: data && data[0],
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    selection: false,
    primaryKey: 'rulesHeaderId',
    events: {
      update: ({ record, name }) => {
        if (name === 'systemCodeObj') {
          record.set({
            documentTypeCodeObj: '',
          });
        }
      },
    },
    fields: [
      {
        name: 'autoDayGetAccounts',
        label: intl.get('hivp.checkRule').d('每日自动获取勾选底账'),
        type: FieldType.boolean,
        labelWidth: '140',
      },
      {
        name: 'autoDayGetTime',
        label: intl.get('hivp.checkRule').d('每日自动获取时间'),
        type: FieldType.string,
        multiple: ',',
        lookupCode: 'HIVP.AUTO_GET_TIME',
        computedProps: {
          required: ({ record }) => record.get('autoDayGetAccounts'),
        },
      },
      {
        name: 'autoStatisticsSign',
        label: intl.get('hivp.checkRule').d('每月自动统计'),
        type: FieldType.boolean,
        labelWidth: '140',
        transformRequest: value => {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value !== 0;
        },
      },
      {
        name: 'mailbox',
        label: intl.get('hivp.checkRule').d('统计认证结果接收通知邮箱'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            record.get('autoSignatureSign') || record.get('autoStatisticsSign'),
        },
      },
      {
        name: 'autoStatisticsDate',
        label: intl.get('hivp.checkRule').d('自动统计日期'),
        lookupCode: 'HIVP.AUTO_STATISTICS_TIME',
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('autoStatisticsSign'),
        },
      },
      {
        name: 'autoSignatureSign',
        label: intl.get('hivp.checkRule').d('每月自动确签'),
        type: FieldType.boolean,
        labelWidth: '140',
        transformRequest: value => {
          return value ? 1 : 0;
        },
        transformResponse(value) {
          return value !== 0;
        },
      },
      {
        name: 'confirmPassword',
        label: intl.get('hivp.checkRule').d('确认密码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('autoSignatureSign'),
        },
      },
      {
        name: 'autoSignatureTime',
        label: intl.get('hivp.checkRule').d('自动确签日期'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('autoSignatureSign'),
        },
        validator: (value, _, record: any) => {
          console.log(value, record?.get('autoStatisticsDate'));
          if (value > record?.get('autoStatisticsDate')) {
            return intl.get('hivp.invoices').d('自动确签日期必须小于等于自动统计日期');
          }
        },
        lookupCode: 'HIVP.AUTO_STATISTICS_TIME',
      },

      {
        name: 'systemCodeObj',
        label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
        type: FieldType.object,
        lovCode: 'HTC.SOURCE_SYSTEM',
        lovPara: { enabledFlag: 1 },
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'sourceSystem',
        type: FieldType.string,
        multiple: ',',
        bind: 'systemCodeObj.systemCode',
      },
      {
        name: 'sysTypeHeaderId',
        type: FieldType.string,
        bind: 'systemCodeObj.docTypeHeaderId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCodeObj',
        label: intl.get('hivp.checkRule.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.object,
        lovCode: 'HTC.DOCUMENT_TYPE_LOV',
        disabled: true,
        // cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
        computedProps: {
          lovPara: ({ record }) => {
            return { enabledFlag: 1, docTypeHeaderId: record.get('sysTypeHeaderId').join(',') };
          },
          disabled: ({ record }) => {
            if (!record.get('sysTypeHeaderId').length) {
              return true;
            } else {
              return false;
            }
          },
        },
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'docType',
        type: FieldType.string,
        multiple: ',',
        bind: 'documentTypeCodeObj.documentTypeCode',
      },
      {
        name: 'docTypeHeaderId',
        type: FieldType.string,
        bind: 'documentTypeCodeObj.docTypeHeaderId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get('hivp.checkRule').d('发票类型'),
        type: FieldType.string,
        // defaultValue: ['01'],
        multiple: ',',
        lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
      },
      {
        name: 'accountStatus',
        label: intl.get('hivp.checkRule').d('入账状态'),
        type: FieldType.string,
        multiple: ',',
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'mobile',
          type: FieldType.string,
          bind: 'companyObj.mobile',
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentPeriod',
          label: intl.get('hivp.checkRule').d('当前所属期'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'currentOperationalDeadline',
          label: intl.get('hivp.checkRule').d('操作截至日期'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'checkableTimeRange',
          label: intl.get('hivp.checkRule').d('可勾选时间范围'),
          type: FieldType.string,
          readOnly: true,
        },
      ],
    }),
  };
};
