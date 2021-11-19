/*
 * @Descripttion:发票池-档案下载
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-03-01 17:55:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.invoices.fileDownload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/archives-management/archives-download-search`;
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
    },
    pageSize: 5,
    selection: false,
    primaryKey: 'invoiceFileHeaderId',
    fields: [
      {
        name: 'invoiceFileHeaderId',
        label: intl.get(`${modelCode}.view.invoiceFileHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'recordPeriod',
        label: intl.get(`${modelCode}.view.recordPeriod`).d('归档期间'),
        type: FieldType.month,
      },
      {
        name: 'recordDate',
        label: intl.get(`${modelCode}.view.recordDate`).d('归档日期'),
        type: FieldType.date,
      },
      {
        name: 'bucketName',
        label: intl.get(`${modelCode}.view.bucketName`).d('桶名'),
        type: FieldType.string,
      },
      {
        name: 'recordTotalSize',
        label: intl.get(`${modelCode}.view.recordTotalSize`).d('档案大小(MB)'),
        type: FieldType.number,
      },
      {
        name: 'inOutType',
        label: intl.get(`${modelCode}.view.inOutType`).d('进销项'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'type',
        label: intl.get(`${modelCode}.view.type`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.ELECTRONICS_TYPE',
      },
      {
        name: 'recordFileNum',
        label: intl.get(`${modelCode}.view.recordFileNum`).d('档案文件数量'),
        type: FieldType.number,
      },
    ],
    queryFields: [
      {
        name: 'recordDateFrom',
        label: intl.get(`${modelCode}.view.recordDateFrom`).d('归档期间从'),
        type: FieldType.month,
        required: true,
        defaultValue: moment(),
        transformRequest: (value) => value && moment(value).format('YYYY-MM'),
      },
      {
        name: 'recordDateTo',
        label: intl.get(`${modelCode}.view.recordDateTo`).d('归档期间至'),
        type: FieldType.month,
        required: true,
        defaultValue: moment(),
        transformRequest: (value) => value && moment(value).format('YYYY-MM'),
      },
      {
        name: 'showInInvoiceFile',
        label: intl.get(`${modelCode}.view.showInInvoiceFile`).d('显示进项发票档案'),
        type: FieldType.boolean,
        trueValue: '1',
        falseValue: '0',
        defaultValue: '1',
        required: true,
        labelWidth: '150',
      },
      {
        name: 'showOutInvoiceFile',
        label: intl.get(`${modelCode}.view.showOutInvoiceFile`).d('显示销项发票档案'),
        type: FieldType.boolean,
        trueValue: '1',
        falseValue: '0',
        defaultValue: '0',
        required: true,
        labelWidth: '150',
      },
    ],
  };
};
