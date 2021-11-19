/*
 * @Description:开票申请行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-02-01 16:21:50
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.invoice-req';

const amountValidator = (value, name, record) => {
  if (value && name && record) {
    const amount = record.getField('amount')?.getValue() || 0; // 金额
    const deductionAmount = record.getField('deductionAmount')?.getValue() || 0; // 扣除额
    const discountAmount = record.getField('discountAmount')?.getValue() || 0; // 折扣金额
    if (deductionAmount >= amount) {
      return '扣除额不能大于等于金额';
    }
    if (discountAmount >= amount - deductionAmount) {
      return '折扣金额不能大于等于金额-扣除额';
    }
  }
  return undefined;
};

const getTaxRate = (value) => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-lines`;
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
        return {
          url: `${API_PREFIX}/v1/${tenantId}/requisition-lines/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/requisition-lines/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 5,
    selection: false,
    primaryKey: 'lineId',
    events: {
      update: ({ record, name, value }) => {
        // 金额
        if (['quantity', 'price'].includes(name)) {
          const quantity = record.get('quantity');
          const price = record.get('price');
          if (quantity && price) {
            record.set('amount', quantity * price);
          }
        }

        // 税额
        if (
          ['taxIncludedFlag', 'amount', 'taxRateObj', 'deductionAmount', 'discountAmount'].includes(
            name
          )
        ) {
          const taxIncludedFlag = record.get('taxIncludedFlag');
          const amount = record.get('amount');
          const taxRate = Number(record.get('taxRate')) || 0;
          const deductionAmount = record.get('deductionAmount') || 0;
          const discountAmount = record.get('discountAmount') || 0;
          let taxAmount = 0;
          if (taxIncludedFlag === '1') {
            // 当【含税标志】为1时，税额=(金额-扣除额)/(1+税率) *税率-折扣金额*税率/(1+税率)
            taxAmount =
              ((amount - deductionAmount) / (1 + taxRate)) * taxRate -
              (discountAmount * taxRate) / (1 + taxRate);
          } else if (taxIncludedFlag === '0') {
            // 当【含税标志】为0时，税额=（金额-扣除额）*税率-折扣金额*税率
            taxAmount = (amount - deductionAmount) * taxRate - discountAmount * taxRate;
          }
          record.set('taxAmount', taxAmount);
        }

        if (name === 'taxRateObj') {
          if (!value || Number(value.value) !== 0) {
            record.set('zeroTaxRateFlag', '');
          }
        }

        // 优惠政策标识
        if (name === 'zeroTaxRateFlag') {
          if (['0', '1', '2'].includes(value)) {
            record.set('preferentialPolicyFlag', '1');
          } else {
            record.set('preferentialPolicyFlag', '0');
          }
        }

        // 商品自行编码
        if (name === 'projectNumberObj' && value) {
          record.set({ commodityNumberObj: value, issues: value.projectName || '' });
        }

        // 商品编码
        if (name === 'commodityNumberObj') {
          const zeroTaxRateFlag = value && value.zeroTaxRateFlag;
          record.set({
            projectName: `*${record.get('commodityShortName') || ''}*${record.get('issues') || ''}`,
            taxRateObj: (value && value.taxRate && { value: getTaxRate(value.taxRate) }) || {},
            preferentialPolicyFlag: ['0', '1', '2'].includes(zeroTaxRateFlag) ? '1' : '0',
          });
        }

        // 票面项目名称
        if (['commodityShortName', 'issues'].includes(name)) {
          record.set(
            'projectName',
            `*${record.get('commodityShortName') || ''}*${record.get('issues') || ''}`
          );
        }
      },
    },
    fields: [
      {
        name: 'lineId',
        type: FieldType.number,
      },
      {
        name: 'headerId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'lineNum',
        label: intl.get(`${modelCode}.view.lineNum`).d('行号'),
        type: FieldType.string,
      },
      {
        name: 'projectNumberObj',
        label: intl.get(`${modelCode}.view.projectNumber`).d('商品(自行编码)'),
        type: FieldType.object,
        lovCode: 'HIOP.GOODS_QUERY',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        ignore: FieldIgnore.always,
        textField: 'projectNumber',
        computedProps: {
          lovPara: ({ record }) => {
            const receiptName = record.dataSet.parent.current.get('receiptName');
            return {
              customerName: receiptName,
              queryBySelfCode: true,
            };
          },
        },
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('商品(自行编码)'),
        type: FieldType.string,
        bind: 'projectNumberObj.projectNumber',
      },
      {
        name: 'commodityNumberObj',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.object,
        lovCode: 'HIOP.GOODS_TAX_CODE',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        ignore: FieldIgnore.always,
        textField: 'commodityNumber',
        required: true,
        computedProps: {
          lovPara: ({ record }) => {
            const receiptName = record.dataSet.parent.current.get('receiptName');
            return {
              customerName: receiptName,
            };
          },
        },
      },
      {
        name: 'commodityNumber',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.string,
        required: true,
        bind: 'commodityNumberObj.commodityNumber',
      },
      {
        name: 'commodityShortName',
        label: intl.get(`${modelCode}.view.commodityShortName`).d('商品简称'),
        type: FieldType.string,
        // required: true,
        bind: 'commodityNumberObj.abbreviation',
      },
      {
        name: 'issues',
        label: intl.get(`${modelCode}.view.issues`).d('开具名称'),
        type: FieldType.string,
        required: true,
        // bind: 'projectNumberObj.projectName',
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('票面项目名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'price',
        label: intl.get(`${modelCode}.view.price`).d('单价'),
        type: FieldType.currency,
        min: 0,
        step: 0.00000001,
      },
      {
        name: 'amount',
        label: intl.get(`${modelCode}.view.amount`).d('金额'),
        type: FieldType.currency,
        required: true,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'discountAmount',
        label: intl.get(`${modelCode}.view.discountAmount`).d('折扣金额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get(`${modelCode}.view.taxIncludedFlag`).d('含税标志'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.TAX_MARK',
        defaultValue: '1',
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRateObj',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_TAX_RATE',
        cascadeMap: { companyId: 'companyId', extNumber: 'extNumber', invoiceType: 'invoiceType' },
        required: true,
        ignore: FieldIgnore.always,
      },

      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        // lookupCode: 'HIOP.TAX_RATE',
        required: true,
        bind: 'taxRateObj.value',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        bind: 'commodityNumberObj.zeroTaxRateFlag',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
        },
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'deductionAmount',
        label: intl.get(`${modelCode}.view.deductionAmount`).d('扣除额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
      },
      {
        name: 'specificationModel',
        label: intl.get(`${modelCode}.view.specificationModel`).d('规格型号'),
        type: FieldType.string,
        bind: 'commodityNumberObj.model',
      },
      {
        name: 'unit',
        label: intl.get(`${modelCode}.view.unit`).d('单位'),
        type: FieldType.string,
      },
      {
        name: 'sourceLineNum',
        label: intl.get(`${modelCode}.view.sourceLineNum`).d('申请来源行号'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber3',
        label: intl.get(`${modelCode}.view.sourceNumber3`).d('申请来源单号3'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber4',
        label: intl.get(`${modelCode}.view.sourceNumber4`).d('申请来源单号4'),
        type: FieldType.string,
      },
      {
        name: 'adjustFlag',
        label: intl.get(`${modelCode}.view.adjustFlag`).d('调整标志'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.ADJUST_MARK',
      },
      {
        name: 'adjustLineId',
        label: intl.get(`${modelCode}.view.adjustLineId`).d('调整来源行ID'),
        type: FieldType.string,
      },
    ],
  };
};
