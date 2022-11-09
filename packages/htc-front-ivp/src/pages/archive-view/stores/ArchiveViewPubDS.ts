/*
 * @Description:发票池-单据关联
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-27 10:22:49
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.invoicesArchiveUpload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/invoice-pool-header-infos-public`;
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
    },
    fields: [
      {
        name: 'invoicePoolHeaderId',
        label: intl.get('hivp.bill.view.billPoolHeaderId').d('记录ID'),
        type: FieldType.string,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.string,
      },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        // required: true,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'recordType',
        label: intl.get('htc.common.view.recordType').d('档案类型'),
        type: FieldType.string,
      },
      {
        name: 'recordTypeMeaning',
        label: intl.get('htc.common.view.recordType').d('档案类型'),
        type: FieldType.string,
      },
      {
        name: 'detailId',
        type: FieldType.string,
      },
      {
        name: 'systemName',
        label: intl.get(`${modelCode}.view.systemName`).d('对接系统'),
        type: FieldType.string,
      },
      {
        name: 'systemCode',
        label: intl.get(`${modelCode}.view.systemCode`).d('对接系统代码'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get(`${modelCode}.view.documentTypeMeaning`).d('单据类型'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeCode',
        label: intl.get(`${modelCode}.view.documentTypeCode`).d('单据类型代码'),
        type: FieldType.string,
      },
      {
        name: 'documentNumber',
        label: intl.get(`${modelCode}.view.documentNumber`).d('单据编号'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceId',
        label: intl.get(`${modelCode}.view.documentSourceId`).d('对接系统单据ID'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceKey',
        label: intl.get(`${modelCode}.view.documentSourceKey`).d('单据关键字'),
        type: FieldType.string,
      },
      {
        name: 'documentRemark',
        label: intl.get(`${modelCode}.view.documentRemark`).d('单据描述'),
        type: FieldType.string,
      },
      {
        name: 'relationInvoiceQuantity',
        label: intl.get(`${modelCode}.view.relationInvoiceQuantity`).d('关联发票数量'),
        type: FieldType.number,
      },
    ],
    queryFields: [
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'documentNumber',
        label: intl.get(`${modelCode}.view.documentNumber`).d('单据编号'),
        type: FieldType.string,
      },
    ],
  };
};
