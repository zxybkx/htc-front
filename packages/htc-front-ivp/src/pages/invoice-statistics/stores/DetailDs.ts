/*
 * @Description: 进销发票统计报表详情
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:14:01
 * @LastEditTime: 2022-11-14 16:37:12
 * @Copyright: Copyright (c) 2020, Hand
 */

import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const modelCode = 'hivp.invoiceStatistics';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/in-out-invoice/detail`;
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
    selection: false,
    fields: [
      {
        name: 'invoiceType',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('发票种类'),
        lookupCode: 'HIVP.INVIOCE_AND_BILL_TYPE',
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('发票代码'),
      },
      {
        name: 'invoiceNo',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueInvoiceAmount`).d('发票号码'),
      },
      {
        name: 'buyerName',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueTaxAmount`).d('购方名称'),
      },
      {
        name: 'sellerName',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.unInvoiceIncomeAmount`).d('销方名称'),
      },
      {
        name: 'invoiceState',
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
        label: intl.get(`${modelCode}.view.unInvoiceIncomeTaxAmount`).d('发票状态'),
      },
      {
        name: 'invoiceDate',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeAmount`).d('开票日期'),
      },
      {
        name: 'invoiceAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeTaxAmount`).d('不含税金额'),
      },
      {
        name: 'taxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionAmount`).d('税额'),
      },
      {
        name: 'totalAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionTaxAmount`).d('价税合计'),
      },
      {
        name: 'inOutType',
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
        label: intl.get(`${modelCode}.view.fillingDeductionTaxAmount`).d('进销项类型'),
      },
    ],
    queryDataSet: new DataSet({
      autoCreate: true,
      fields: [],
    }),
  };
};
