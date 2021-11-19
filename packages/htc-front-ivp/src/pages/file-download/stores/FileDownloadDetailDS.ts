/*
 * @Descripttion:发票池-档案下载
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-10 13:41:15
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hivp.invoices.fileDownload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/archives-management/archives-download-search-line`;
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
    primaryKey: 'invoiceFileLineId',
    fields: [
      {
        name: 'invoiceFileLineId',
        label: intl.get(`${modelCode}.view.invoiceFileLineId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceFileHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'bucketName',
        label: intl.get(`${modelCode}.view.bucketName`).d('桶名'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'entryAccountDate',
        label: intl.get(`${modelCode}.view.entryAccountDate`).d('入账日期'),
        type: FieldType.date,
      },
      {
        name: 'recordDate',
        label: intl.get(`${modelCode}.view.recordDate`).d('归档日期'),
        type: FieldType.date,
      },
      {
        name: 'recordPeriod',
        label: intl.get(`${modelCode}.view.recordPeriod`).d('归档期间'),
        type: FieldType.month,
      },
      {
        name: 'recordType',
        label: intl.get(`${modelCode}.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'recordSize',
        label: intl.get(`${modelCode}.view.recordSize`).d('档案大小(MB)'),
        type: FieldType.number,
      },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('版式文件URL'),
        type: FieldType.string,
      },
    ],
  };
};
