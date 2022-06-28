/**
 * @Description: 租户协议-公司信息页签数据源
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hpln.index-plan';

export default (tenantId, agreementId): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/agreement-company-infoss`;
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
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/agreement-company-infoss/batch-delete`,
          data,
          method: 'DELETE',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/agreement-company-infoss/batch-saveOrUpdate`,
          data,
          params,
          method: 'POST',
        };
      },
      create: ({ data, params }) => {
        const newList = data.map((item) => ({
          ...item,
          agreementId,
        }));
        return {
          url: `${API_PREFIX}/v1/agreement-company-infoss/batch-saveOrUpdate`,
          data: newList,
          params,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitFailed: (resp) => {
        notification.error({
          description: '',
          message: resp && resp.message,
        });
      },
    },
    pageSize: 10,
    primaryKey: 'agreementCompanyId',
    selection: 'multiple' as DataSetSelection,
    fields: [
      {
        name: 'agreementCompanyId',
        type: FieldType.number,
      },
      {
        name: 'tenantId',
        type: FieldType.number,
      },
      {
        name: 'tenantNum',
        type: FieldType.string,
      },
      {
        name: 'registrationCode',
        label: intl.get(`${modelCode}.view.registrationCode`).d('客户注册代码'),
        type: FieldType.string,
      },
      {
        name: 'companyObject',
        label: intl.get(`${modelCode}.view.companyCode`).d('注册公司代码'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        lovPara: { organizationId: tenantId },
        ignore: FieldIgnore.always,
        required: true,
        textField: 'companyCode',
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司全称'),
        type: FieldType.string,
        bind: 'companyObject.companyName',
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: 'companyObject.companyId',
      },
      {
        name: 'administrator',
        label: intl.get(`${modelCode}.view.administrator`).d('管理员'),
        labelWidth: '150',
        type: FieldType.string,
      },
      {
        name: 'administratorMailbox',
        label: intl.get(`${modelCode}.view.administratorMailbox`).d('管理员邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        defaultValidationMessages: {
          patternMismatch: '邮箱格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'administratorPhone',
        label: intl.get(`${modelCode}.view.administratorPhone`).d('管理员电话'),
        type: FieldType.string,
        pattern: phoneReg,
        defaultValidationMessages: {
          patternMismatch: '手机格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'enterpriseAlipayAccount',
        label: intl.get(`${modelCode}.view.enterpriseAlipayAccount`).d('企业支付宝账号'),
        type: FieldType.string,
      },
      {
        name: 'checkChannelCode',
        label: intl.get(`${modelCode}.view.checkChannelCode`).d('查验通道接口'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.CHECK_CHANNEL',
      },
      {
        name: 'inChannelCode',
        label: intl.get(`${modelCode}.view.inChannelCode`).d('进项通道'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.IN_CHANNEL',
      },
      {
        name: 'outChannelCode',
        label: intl.get(`${modelCode}.view.outChannelCode`).d('销项通道'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.OUT_CHANNEL',
      },
      {
        name: 'authorizationStartDate',
        label: intl.get(`${modelCode}.view.authorizationStartDate`).d('授权起始日'),
        type: FieldType.dateTime,
        required: true,
      },
      {
        name: 'authorizationTypeCode',
        label: intl.get(`${modelCode}.view.authorizationTypeCode`).d('授权类型'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.AUTHORIZATION_TYPE',
      },
      {
        name: 'authorizationEndDate',
        label: intl.get(`${modelCode}.view.authorizationEndDate`).d('授权到期日'),
        type: FieldType.dateTime,
        required: true,
      },
      {
        name: 'authorizationCode',
        label: intl.get(`${modelCode}.view.authorizationCode`).d('航信企业授权码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'currentToken',
        label: intl.get(`${modelCode}.view.currentToken`).d('当前TOKEN'),
        type: FieldType.string,
      },
      {
        name: 'tokenGenerationDate',
        label: intl.get(`${modelCode}.view.tokenGenerationDate`).d('TOKEN生成时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'authorizationOutputCode',
        label: intl.get(`${modelCode}.view.authorizationOutputCode`).d('航信企业销项授权码'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
        type: FieldType.boolean,
        required: true,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
      },
      {
        name: 'receicingBalance',
        label: intl.get(`${modelCode}.view.receicingBalance`).d('收款余额'),
        type: FieldType.currency,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'preferOcrChannelCode',
        label: intl.get(`${modelCode}.view.preferOcrChannelCode`).d('首选OCR通道'),
        type: FieldType.string,
        lookupCode: 'HMDM.PREFER_OCR_CHANNEL',
      },
      {
        name: 'retryOcrChannelCode',
        label: intl.get(`${modelCode}.view.retryOcrChannelCode`).d('重试OCR通道'),
        type: FieldType.string,
        lookupCode: 'HMDM.RETRY_OCR_CHANNEL',
      },
      {
        name: 'accountNumber',
        label: intl.get(`${modelCode}.view.accountNumber`).d('账号'),
        type: FieldType.string,
      },
      {
        name: 'ocrPassword',
        label: intl.get(`${modelCode}.view.ocrPassword`).d('密码'),
        type: FieldType.string,
      },
      {
        name: 'outChannelModeCode',
        label: intl.get(`${modelCode}.view.outChannelModeCode`).d('销项服务方式'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('outChannelCode') !== 'NONE',
        },
        lookupCode: 'HMDM.AISINO_OUT_CHANNEL',
        cascadeMap: { parentValue: 'outChannelCode' },
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'outChannelCode') {
          record.set({ outChannelModeCode: '' });
        }
      },
    },
  };
};
