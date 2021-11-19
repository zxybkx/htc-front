/*
 * @Descripttion:发票池-档案归档
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-01-27 11:40:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.invoices.fileArchive';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/archives-management/transfer-data`;
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
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'invoicePoolHeaderId',
    fields: [
      {
        name: 'invoicePoolHeaderId',
        label: intl.get(`${modelCode}.view.invoicePoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'inOutType',
        label: intl.get(`${modelCode}.view.inOutType`).d('进销项'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'entryAccountState',
        label: intl.get(`${modelCode}.view.entryAccountState`).d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
      {
        name: 'entryAccountDate',
        label: intl.get(`${modelCode}.view.entryAccountDate`).d('入账日期'),
        type: FieldType.date,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
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
        name: 'annotation',
        label: intl.get(`${modelCode}.view.annotation`).d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
      {
        name: 'recordType',
        label: intl.get(`${modelCode}.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'downloadPath',
        label: intl.get(`${modelCode}.view.downloadPath`).d('电票URL'),
        type: FieldType.string,
      },
      {
        name: 'fileUrl',
        type: FieldType.string,
      },
    ],
  };
};
