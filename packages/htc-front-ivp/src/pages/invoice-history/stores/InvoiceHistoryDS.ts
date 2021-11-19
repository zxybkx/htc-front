/*
 * @Descripttion:发票池-历史记录
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-01-27 11:40:39
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.invoices.history';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/history-records/history-record-search`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
            sourceCode: dsParams.sourceCode,
            invoicePoolHeaderId: dsParams.sourceHeaderId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'historyRecordId',
    fields: [
      {
        name: 'historyRecordId',
        label: intl.get(`${modelCode}.view.historyRecordId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoicePoolHeaderId',
        type: FieldType.number,
      },
      {
        name: 'incidentType',
        label: intl.get(`${modelCode}.view.incidentType`).d('事件类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_HISTORY_EVENT',
      },
      {
        name: 'incidentFrom',
        label: intl.get(`${modelCode}.view.incidentFrom`).d('事件来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_HISTORY_EVENT_SOURCE',
      },
      {
        name: 'incidentDetail',
        label: intl.get(`${modelCode}.view.incidentDetail`).d('事件详情'),
        type: FieldType.string,
      },
      {
        name: 'incidentDate',
        label: intl.get(`${modelCode}.view.incidentDate`).d('事件时间'),
        type: FieldType.dateTime,
      },
    ],
  };
};
