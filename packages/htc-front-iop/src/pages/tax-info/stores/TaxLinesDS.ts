/*
 * @Descripttion:税控行信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2020-12-08 11:02:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.tax-info';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/tax-line-infos`;
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
    primaryKey: 'taxLineId',
    cascadeParams(parent) {
      return {
        taxHeaderId: parent.get('taxHeaderId'),
      };
    },
    fields: [
      {
        name: 'taxLineId',
        type: FieldType.number,
      },
      {
        name: 'taxHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'lockDate',
        label: intl.get(`${modelCode}.view.lockDate`).d('锁死日期'),
        type: FieldType.date,
      },
      {
        name: 'singleInvoiceLimit',
        label: intl.get(`${modelCode}.view.singleInvoiceLimit`).d('单张开票限额'),
        type: FieldType.currency,
      },
      {
        name: 'uploadExpirationDate',
        label: intl.get(`${modelCode}.view.uploadExpirationDate`).d('上传截止日期'),
        type: FieldType.string,
      },
      {
        name: 'offLineTimeLimit',
        label: intl.get(`${modelCode}.view.offLineTimeLimit`).d('离线时限'),
        type: FieldType.string,
      },
      {
        name: 'offLineAmountLimit',
        label: intl.get(`${modelCode}.view.offLineAmountLimit`).d('离线限额'),
        type: FieldType.currency,
      },
      {
        name: 'offLineRemainingAmount',
        label: intl.get(`${modelCode}.view.offLineRemainingAmount`).d('离线剩余金额'),
        type: FieldType.currency,
      },
      {
        name: 'offLineExtension',
        label: intl.get(`${modelCode}.view.offLineExtension`).d('离线扩展信息'),
        type: FieldType.string,
      },
      {
        name: 'authorizeTaxRate',
        label: intl.get(`${modelCode}.view.authorizeTaxRate`).d('授权税率'),
        type: FieldType.string,
      },
      {
        name: 'curInvoiceCode',
        label: intl.get(`${modelCode}.view.curInvoiceCode`).d('当前发票代码'),
        type: FieldType.string,
      },
      {
        name: 'curInvoiceNumber',
        label: intl.get(`${modelCode}.view.curInvoiceNumber`).d('当前发票号码'),
        type: FieldType.string,
      },
      {
        name: 'curRemainingCount',
        label: intl.get(`${modelCode}.view.curRemainingCount`).d('当前剩余卷份数'),
        type: FieldType.number,
      },
      {
        name: 'totalRemainingCount',
        label: intl.get(`${modelCode}.view.totalRemainingCount`).d('总剩余份数'),
        type: FieldType.number,
      },
      {
        name: 'queryDate',
        label: intl.get(`${modelCode}.view.queryDate`).d('查询时间'),
        type: FieldType.dateTime,
      },
    ],
  };
};
