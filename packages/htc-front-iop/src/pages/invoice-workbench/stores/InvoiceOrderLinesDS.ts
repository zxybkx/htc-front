/*
 * @Description:开票订单行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-7 17:16:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
// import { message } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.bill-order';

const getTaxRate = (value) => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};

const deductionValidator = (value, name, record) => {
  if (value && name && record) {
    const amount = record.getField('amount')?.getValue() || 0; // 金额
    const deduction = record.getField('deduction')?.getValue() || 0; // 扣除额
    if (deduction >= amount) {
      return '扣除额不能大于等于金额';
    }
  }
  return undefined;
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-lines`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          params: {
            ...config.params,
          },
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderLineId',
    selection: false,
    // pageSize: 10,
    paging: false,
    events: {
      update: ({ dataSet, record, name, value }) => {
        // 零税率标识(zeroTaxRateFlag)、税率（taxRate）、优惠政策标识（preferentialPolicyFlag）
        if (name === 'taxRateObj') {
          if (!value || Number(value.value) !== 0) {
            record.set('zeroTaxRateFlag', '');
          }
        }
        if (name === 'zeroTaxRateFlag') {
          if (['0', '1', '2'].includes(value)) {
            record.set('preferentialPolicyFlag', '1');
          } else {
            record.set('preferentialPolicyFlag', '0');
          }
        }
        if (name === 'invoiceLineNature' && value === '1') {
          const index = dataSet.indexOf(record);
          const previous = index - 1 > -1 && dataSet.get(index - 1).toData();
          record.set({
            projectObj: null,
            commodityNumberObj: null,
            projectName: null,
            taxIncludedFlag: previous.taxIncludedFlag ? previous.taxIncludedFlag : '1',
            amount: null,
            taxAmount: null,
            deduction: null,
            preferentialPolicyFlag: null,
            zeroTaxRateFlag: null,
            specialVatManagement: null,
            projectUnitPrice: null,
            taxRate: previous.taxRate ? previous.taxRate : '',
          });
        }
        if (name === 'projectUnitPrice' && value) {
          const quantity = record.get('quantity');
          if (quantity) {
            record.set('amount', value * quantity);
          }
        }
        if (name === 'quantity' && value) {
          const projectUnitPrice = record.get('projectUnitPrice');
          if (projectUnitPrice) {
            record.set('amount', value * projectUnitPrice);
          }
        }
        // 税额
        if (
          ['invoiceLineNature', 'taxIncludedFlag', 'amount', 'taxRateObj', 'deduction'].includes(
            name
          )
        ) {
          const taxIncludedFlag = record.get('taxIncludedFlag');
          const amount = record.get('amount');
          const taxRate = Number(record.get('taxRate')) || 0;
          const deduction = record.get('deduction') || 0;
          const invoiceLineNature = record.get('invoiceLineNature');
          let taxAmount = 0;
          if (taxIncludedFlag === '1') {
            // 当【含税标志】为1时
            if (invoiceLineNature === '1') {
              // 税额=【（金额/（1+税率）】*税率
              taxAmount = (amount / (1 + taxRate)) * taxRate;
            } else {
              // 税额=【（金额-扣除额）/（1+税率）】*税率
              taxAmount = ((amount - deduction) / (1 + taxRate)) * taxRate;
            }
          } else if (taxIncludedFlag === '0') {
            // 当【含税标志】为0时
            if (invoiceLineNature === '1') {
              // 税额=金额 *税率
              taxAmount = amount * taxRate;
            } else {
              // 税额=（金额-扣除额）*税率
              taxAmount = (amount - deduction) * taxRate;
            }
          }
          record.set('taxAmount', taxAmount);
          // if (amount > 0 && invoiceLineNature === '1') {
          //   message.config({
          //     top: 300,
          //   });
          //   message.error('折扣金额只能为负数！', undefined, undefined, 'top');
          //   record.set('amount', -amount);
          // }
        }
        // 商品自行编码
        if (name === 'projectObj' && value) {
          const { zeroTaxRateFlag, projectUnit, model, ...otherData } = value;
          record.set('zeroTaxRateFlag', zeroTaxRateFlag);
          record.set('projectUnit', projectUnit);
          record.set('model', model);
          record.set({
            commodityNumberObj: otherData,
            projectNameSuffix: value.projectName || '',
          });
        }
        // 商品编码
        if (name === 'commodityNumberObj') {
          record.set({
            projectName: `*${record.get('abbreviation') || ''}*${
              record.get('projectNameSuffix') || ''
            }`,
            taxRateObj: (value && value.taxRate && { value: getTaxRate(value.taxRate) }) || {},
            projectNameSuffix: value && value.projectName,
          });
        }
        if (['abbreviation', 'projectNameSuffix'].includes(name)) {
          record.set(
            'projectName',
            `*${record.get('abbreviation') || ''}*${record.get('projectNameSuffix') || ''}`
          );
        }
      },
    },
    fields: [
      {
        name: 'readonly',
        label: intl.get(`${modelCode}.view.readonly`).d('页面是否可操作'),
        type: FieldType.boolean,
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
        name: 'invoiceLineNature',
        label: intl.get(`${modelCode}.view.invoiceLineNature`).d('发票行性质'),
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
        type: FieldType.string,
        required: true,
      },
      {
        name: 'projectObj',
        type: FieldType.object,
        label: intl.get(`${modelCode}.view.projectObj`).d('商品（自行编码）'),
        lovCode: 'HIOP.GOODS_QUERY',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
          lovPara: ({ record }) => {
            const purchaseInvoiceFlag = record.dataSet.parent.current.get('purchaseInvoiceFlag');
            const buyerName = record.dataSet.parent.current.get('buyerName');
            const sellerName = record.dataSet.parent.current.get('sellerName');
            if (purchaseInvoiceFlag) {
              return {
                customerName: purchaseInvoiceFlag === '0' ? sellerName : buyerName,
                queryBySelfCode: true,
              };
            }
          },
        },
        ignore: FieldIgnore.always,
        textField: 'projectNumber',
      },
      {
        name: 'projectNumber',
        type: FieldType.string,
        bind: 'projectObj.projectNumber',
      },
      {
        name: 'commodityNumberObj',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.object,
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        lovCode: 'HIOP.GOODS_TAX_CODE',
        // required: true,
        computedProps: {
          required: ({ record }) => record.get('invoiceLineNature') !== '1',
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
          lovPara: ({ record }) => {
            const purchaseInvoiceFlag = record.dataSet.parent.current.get('purchaseInvoiceFlag');
            const buyerName = record.dataSet.parent.current.get('buyerName');
            const sellerName = record.dataSet.parent.current.get('sellerName');
            if (purchaseInvoiceFlag) {
              return {
                customerName: purchaseInvoiceFlag === '0' ? sellerName : buyerName,
              };
            }
          },
        },
        ignore: FieldIgnore.always,
        textField: 'commodityNumber',
      },
      {
        name: 'commodityNumber',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.string,
        bind: 'commodityNumberObj.commodityNumber',
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称（开票）'),
        type: FieldType.string,
      },
      {
        name: 'abbreviation',
        label: intl.get(`${modelCode}.view.abbreviation`).d('商品和服务分类简称）'),
        type: FieldType.string,
        bind: 'commodityNumberObj.abbreviation',
      },
      {
        name: 'projectNameSuffix',
        label: intl.get(`${modelCode}.view.projectNameSuffix`).d('项目名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('invoiceLineNature') !== '1',
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
        min: 1,
        step: 0.00000001,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
      },
      {
        name: 'projectUnitPrice',
        label: intl.get(`${modelCode}.view.projectUnitPrice`).d('单价'),
        type: FieldType.currency,
        precision: 8,
        computedProps: {
          max: ({ record }) => (record.get('invoiceLineNature') === '1' ? -0.01 : 9999999999),
          min: ({ record }) => (record.get('invoiceLineNature') !== '1' ? 0.01 : -9999999999),
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
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
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
          lovPara: ({ record }) => {
            const extNumber = record.dataSet.parent.current.get('extNumber');
            const invoiceType = record.dataSet.parent.current.get('invoiceVariety');
            if (extNumber && invoiceType) {
              return { extNumber, invoiceType };
            }
          },
        },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        bind: 'taxRateObj.value',
      },
      {
        name: 'amount',
        label: intl.get(`${modelCode}.view.amount`).d('金额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => record.get('projectUnitPrice') && record.get('quantity'),
          max: ({ record }) => (record.get('invoiceLineNature') === '1' ? 0 : 9999999999),
          min: ({ record }) => (record.get('invoiceLineNature') !== '1' ? 0 : -9999999999),
        },
        required: true,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get(`${modelCode}.view.taxIncludedFlag`).d('是否含税'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
        trueValue: '1',
        falseValue: '0',
        defaultValue: '1',
        required: true,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'deduction',
        label: intl.get(`${modelCode}.view.deduction`).d('扣除额'),
        type: FieldType.currency,
        min: 0,
        validator: (value, name, record) =>
          new Promise((reject) => reject(deductionValidator(value, name, record))),
      },
      {
        name: 'model',
        label: intl.get(`${modelCode}.view.model`).d('规格型号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        // bind: 'commodityNumberObj.model',
      },
      {
        name: 'projectUnit',
        label: intl.get(`${modelCode}.view.projectUnit`).d('单位'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        // bind: 'commodityNumberObj.projectUnit',
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
        // bind: 'commodityNumberObj.preferentialPolicyFlag',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
          readOnly: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) !== 0,
        },
      },
      {
        name: 'specialVatManagement',
        label: intl.get(`${modelCode}.view.specialVatManagement`).d('增值税特殊管理'),
        type: FieldType.string,
        // bind: 'commodityNumberObj.specialVatManagement',
      },
    ],
  };
};
