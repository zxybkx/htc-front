/*
 * @Description:票据池-行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-13 16:07:22
 * @LastEditTime: 2022-07-28 15:56:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.bill';

const taxRateValidator = (value, name, record) => {
  if (value && name && record) {
    const validateNumber = new RegExp(/^(0|0+(\.\d{0,2}))$/);
    if (!validateNumber.test(value)) {
      return '请输入0-1之间的小数（至多两位）';
    }
  }
  return undefined;
};
const setAmount = (name, record) => {
  if (['quantity', 'unitPrice'].includes(name)) {
    const quantity = record.get('quantity');
    const unitPrice = record.get('unitPrice');
    if (quantity && unitPrice) {
      const _quantity = Number(quantity) || 0;
      const _unitPrice = Number(unitPrice) || 0;
      if (_quantity !== 0 && _unitPrice !== 0) {
        const amount = _quantity * _unitPrice;
        record.set('amount', amount.toFixed(2));
      }
    }
  }
};
export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-lines`;
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
    primaryKey: 'billPoolLineId',
    events: {
      update: ({ name, record }) => {
        setAmount(name, record);
        if (['amount', 'taxRate'].includes(name)) {
          const amount = record.get('amount');
          const taxRate = record.get('taxRate');
          if (amount && taxRate) {
            const _amount = Number(amount) || 0;
            const _taxRate = Number(taxRate) || 0;
            if (_amount !== 0) {
              const taxAmount = _amount * _taxRate;
              record.set('taxAmount', taxAmount.toFixed(2));
            }
          }
        }
      },
    },
    fields: [
      {
        name: 'billPoolLineId',
        label: intl.get(`${modelCode}.view.billPoolLineId`).d('记录行ID'),
        type: FieldType.string,
      },
      {
        name: 'billPoolHeaderId',
        label: intl.get(`${modelCode}.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.string,
      },
      {
        name: 'goodsName',
        label: intl.get(`${modelCode}.view.goodsName`).d('货物或应税劳务、服务名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'specificationModel',
        label: intl.get('htc.common.view.specificationModel').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get('htc.common.view.unit').d('单位'),
        type: FieldType.string,
      },
      {
        name: 'quantity',
        label: intl.get('htc.common.view.quantity').d('数量'),
        type: FieldType.number,
        required: true,
        precision: 2,
      },
      {
        name: 'unitPrice',
        label: intl.get('hivp.bill.view.unitPrice').d('不含税单价'),
        type: FieldType.currency,
        required: true,
      },

      {
        name: 'amount',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxRate',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
        validator: (value, name, record) => Promise.resolve(taxRateValidator(value, name, record)),
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('税额'),
        type: FieldType.currency,
      },
    ],
  };
};
