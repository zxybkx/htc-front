/*
 * @Description:发票入池规则行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-19 17:20:15
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';

const modelCode = 'hivp.invoiceWhitelist';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-white-lists/whitelist-line-search`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'get',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/htc-invoice-white-list-lines/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/htc-invoice-white-list-lines/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
    },
    primaryKey: 'lineId',
    fields: [
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('采购方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => !record.get('buyerTaxNo') && !record.get('blackListKey'),
        },
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('采购方纳税识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => !record.get('buyerName') && !record.get('blackListKey'),
        },
      },
      {
        name: 'blackListKey',
        label: intl.get(`${modelCode}.view.blackListKey`).d('黑名单关键字'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => !record.get('buyerName') && !record.get('buyerTaxNo'),
        },
      },
      {
        name: 'limitRange',
        label: intl.get(`${modelCode}.view.limitRange`).d('范围'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIVP.INVOICE_WHITE_LIST',
      },
      {
        name: 'invoiceWhiteListLineId',
        type: FieldType.string,
        defaultValue: '',
      },
      {
        name: 'enabledFlag',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('是否启用'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.view.companyName').d('公司名称'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          readOnly: true,
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('采购方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerTaxNo',
          label: intl.get(`${modelCode}.view.buyerTaxNo`).d('采购方纳税识别号'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'blackListKey',
          label: intl.get(`${modelCode}.view.blackListKey`).d('黑名单关键字'),
          type: FieldType.string,
        },
        {
          name: 'limitRangeList',
          label: intl.get(`${modelCode}.view.limitRange`).d('范围'),
          type: FieldType.string,
          lookupCode: 'HIVP.INVOICE_WHITE_LIST',
        },
      ],
    }),
  };
};
