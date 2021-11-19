/**
 * DS - 租户协议-账单信息数据源
 * @Author: xinyan.zhou <zhou.xinyan@hand-china.com>
 * @Date: 2021-06-04
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { TransportProps } from 'choerodon-ui/pro/lib/data-set/Transport';
import { EMAIL, PHONE } from 'utils/regExp';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hpln.index-plan';

export default (tenantId): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/billing-informations`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
            enabledFlag: 1,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/billing-informations/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      create: ({ data, params }) => {
        const newList = data.map((item) => ({
          ...item,
          tenantId,
          // agreementId,
        }));
        return {
          url: `${API_PREFIX}/v1/billing-informations/batch-save`,
          data: newList,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/billing-informations/batch-remove`,
          data,
          method: 'DELETE',
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
    } as TransportProps,
    pageSize: 10,
    primaryKey: 'billInfoId',
    fields: [
      {
        name: 'indicatorPlanLineId',
        type: FieldType.number,
      },
      {
        name: 'billNumber',
        label: intl.get(`${modelCode}.view.billNumber`).d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'companyNameObject',
        label: intl.get(`${modelCode}.view.companyNameObject`).d('公司编码'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        lovPara: { organizationId: tenantId },
        ignore: FieldIgnore.always,
        textField: 'companyCode',
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司编码'),
        type: FieldType.string,
        bind: 'companyNameObject.companyCode',
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
        bind: 'companyNameObject.companyName',
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('账单类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_TYPE',
        required: true,
      },
      {
        name: 'billPhyletic',
        label: intl.get(`${modelCode}.view.billPhyletic`).d('账单种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_SPECIES',
        required: true,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('生成时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'receiver',
        label: intl.get(`${modelCode}.view.receiver`).d('接收人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'phone',
        label: intl.get(`${modelCode}.view.phone`).d('联系电话'),
        type: FieldType.string,
        pattern: PHONE,
      },
      {
        name: 'sendDate',
        label: intl.get(`${modelCode}.view.sendDate`).d('发送时间'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'billRecordStart',
        label: intl.get(`${modelCode}.view.billRecordStart`).d('账单记录起始时间'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        required: true,
        max: 'billRecordEnd',
      },
      {
        name: 'billRecordEnd',
        label: intl.get(`${modelCode}.view.billRecordEnd`).d('账单记录结束时间'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        required: true,
        min: 'billRecordStart',
      },
    ],
  };
};
