/*
 * @Descripttion:发票池-底账头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-28 17:47:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.invoices.originalAccount';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const yearStart = moment().subtract(1, 'years').startOf('month');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/original-account-header-infos`;
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
          url: `${API_PREFIX}/v1/${tenantId}/original-account-header-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    primaryKey: 'originalAccountHeaderId',
    fields: [
      {
        name: 'originalAccountHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'inChannelCode',
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
      },
      {
        name: 'autoRefreshFlag',
        label: intl.get(`${modelCode}.view.autoRefreshFlag`).d('页面自动刷新'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        required: true,
      },
      {
        name: 'invoiceDateFrom',
        label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期起'),
        type: FieldType.date,
        defaultValue: yearStart,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        computedProps: {
          required: ({ record }) => record.get('everydayGetOriginalFlag') !== 1,
          disabled: ({ record }) => record.get('everydayGetOriginalFlag') === 1,
        },
      },
      {
        name: 'invoiceDateTo',
        label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期止'),
        type: FieldType.date,
        defaultValue: moment(),
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        computedProps: {
          required: ({ record }) => record.get('everydayGetOriginalFlag') !== 1,
          disabled: ({ record }) => record.get('everydayGetOriginalFlag') === 1,
        },
      },
      {
        name: 'allParFlag',
        label: intl.get(`${modelCode}.view.allParFlag`).d('全票面'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'everydayGetOriginalFlag',
        label: intl.get(`${modelCode}.view.everydayGetOriginalFlag`).d('每日自动获取底账'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
        labelWidth: '120',
      },
      {
        name: 'autoRunTime',
        label: intl.get(`${modelCode}.view.autoRunTime`).d('自动运行时间'),
        type: FieldType.string,
        // min: moment().hour(5).minute(59).second(59),
        // max: moment().hour(12).minute(0).second(0),
        // step: {
        //   hour: 6,
        //   minute: 60,
        //   second: 60,
        // },
        // transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        computedProps: {
          required: ({ record }) => record.get('everydayGetOriginalFlag') === 1,
          disabled: ({ record }) => record.get('everydayGetOriginalFlag') !== 1,
        },
      },
      {
        name: 'taxDiskPassword',
        label: intl.get(`${modelCode}.view.taxDiskPassword`).d('税盘密码'),
        type: FieldType.string,
        defaultValue: '88888888',
        required: dsParams.inChannelCode === 'AISINO_IN_CHANNEL_PLUG',
        readOnly: dsParams.inChannelCode !== 'AISINO_IN_CHANNEL_PLUG',
      },
    ],
    queryFields: [
      {
        name: 'companyDesc',
        label: intl.get(`${modelCode}.view.companyDesc`).d('所属公司'),
        type: FieldType.string,
        defaultValue: dsParams.companyDesc,
        ignore: FieldIgnore.always,
        required: true,
        readOnly: true,
      },
      {
        name: 'curDate',
        label: intl.get(`${modelCode}.view.curDate`).d('当前日期'),
        type: FieldType.date,
        defaultValue: moment(),
        ignore: FieldIgnore.always,
        required: true,
        readOnly: true,
      },
      {
        name: 'inChannelCode',
        label: intl.get(`${modelCode}.view.inChannelCode`).d('进项通道类型'),
        type: FieldType.string,
        defaultValue: dsParams.inChannelCode,
        lookupCode: 'HMDM.IN_CHANNEL',
        readOnly: true,
        ignore: FieldIgnore.always,
        required: true,
        labelWidth: '120',
      },
    ],
  };
};
