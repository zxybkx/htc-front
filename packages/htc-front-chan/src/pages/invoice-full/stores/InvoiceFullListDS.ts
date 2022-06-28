/**
 * @Description: 全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-09-24 10:06:17
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hcan.invoice-full';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-header-infos/list`;
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
      destroy: ({ data }) => {
        const _data = data.map((item) => {
          const _item = {
            ...item,
            invoiceDate: item.invoiceDate && moment(item.invoiceDate).format(DEFAULT_DATE_FORMAT),
          };
          return _item;
        });
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-header-infos/batch-remove`,
          data: _data,
          method: 'DELETE',
        };
      },
    },
    pageSize: 10,
    primaryKey: 'invoiceHeaderId',
    fields: [
      {
        name: 'invoiceHeaderId',
        label: intl.get(`${modelCode}.view.invoiceHeaderId`).d('发票ID'),
        type: FieldType.number,
      },
      {
        name: 'checkCount',
        label: intl.get(`${modelCode}.view.checkCount`).d('查验次数'),
        type: FieldType.number,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'cancellationMark',
        label: intl.get(`${modelCode}.view.cancellationMark`).d('发票状态/作废标记'),
        type: FieldType.string,
        lookupCode: 'HCAN.CANCELLCATION_MARK',
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
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'ofdUrl',
        label: intl.get(`${modelCode}.view.ofdUrl`).d('ofdUrl'),
        type: FieldType.string,
      },
      {
        name: 'createdName',
        label: intl.get(`${modelCode}.view.createdName`).d('创建人'),
        type: FieldType.string,
      },
      {
        name: 'createdBy',
        label: intl.get(`${modelCode}.view.createdBy`).d('创建人'),
        type: FieldType.number,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'lastUpdatedName',
        label: intl.get(`${modelCode}.view.lastUpdatedName`).d('更新人'),
        type: FieldType.string,
      },
      {
        name: 'lastUpdatedBy',
        label: intl.get(`${modelCode}.view.lastUpdatedBy`).d('更新人'),
        type: FieldType.number,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.lastUpdateDate`).d('更新时间'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
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
        name: 'lastUpdateDateFrom',
        label: intl.get(`${modelCode}.view.lastUpdateDateFrom`).d('更新时间从'),
        type: FieldType.dateTime,
        max: 'lastUpdateDateTo',
        defaultValue: moment().startOf('day'),
      },
      {
        name: 'lastUpdateDateTo',
        label: intl.get(`${modelCode}.view.lastUpdateDateTo`).d('更新时间至'),
        type: FieldType.dateTime,
        min: 'lastUpdateDateFrom',
        defaultValue: moment().endOf('day'),
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
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
        pattern: /^[a-zA-Z0-9]{6}$/,
        defaultValidationMessages: {
          patternMismatch: intl.get(`${modelCode}.view.checkNumberValid`).d('只能输入6位字符'),
        },
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
    ],
  };
};
