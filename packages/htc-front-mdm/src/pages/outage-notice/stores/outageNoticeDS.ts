/*
 * @module -outageNotice :
 * @Author: huishan.yu<huishan.yu@hand-china.com>
 * @Date: 2021-09-17 10:16:53
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-17 10:16:53
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export const modelCode = 'hmdm.outage-notice';
export default (): DataSetProps => {
  const HMDM_API = commonConfig.MDM_API;
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HMDM_API}/v1/notice-message/query`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        const { type } = data[0];
        const url =
          type === 0
            ? `${HMDM_API}/v1/notice-message/save`
            : `${HMDM_API}/v1/notice-message/release`;
        return {
          url,
          data: data[0],
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    primaryKey: 'outageNotice',
    fields: [
      {
        name: 'type',
        type: FieldType.number,
      },
      {
        name: 'noticeTitle',
        label: intl.get(`${modelCode}.view.noticeTitle`).d('公告标题'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.startDate`).d('提示时间从'),
        type: FieldType.date,
        required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
      },
      {
        name: 'endDate',
        label: intl.get(`${modelCode}.view.endDate`).d('提示时间至'),
        type: FieldType.date,
        required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        min: 'startDate',
      },
      {
        name: 'isEnable',
        label: intl.get(`${modelCode}.view.isEnable`).d('是否启用'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'sendEmail',
        label: intl.get(`${modelCode}.view.sendEmail`).d('是否发送邮件'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'sendEmailToAdmin',
        label: intl.get(`${modelCode}.view.sendEmailToAdmin`).d('是否发邮件至租户管理员'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
      },
      {
        name: 'specialEmail',
        label: intl.get(`${modelCode}.view.specialEmail`).d('特别邮件提醒'),
        type: FieldType.string,
      },
      {
        name: 'noticeContext',
        label: intl.get(`${modelCode}.view.noticeContext`).d('公告内容'),
        type: FieldType.string,
        required: true,
      },
    ],
  };
};
