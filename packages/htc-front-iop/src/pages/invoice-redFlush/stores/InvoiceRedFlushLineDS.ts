/**
 * @Description:发票红冲行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-6 12:21:22
 * @LastEditTime: 2021-09-06 12:21:22
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 金额校验
 * @params {string} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const amountValidator = (value, name, record) => {
  if (value && name && record) {
    const taxAmount = record.get('taxAmount');
    const amount = record.get('amount');
    if (Math.abs(amount) < Math.abs(taxAmount)) {
      return Promise.resolve(
        intl.get('hiop.invoiceRedFlush.validate.amount').d('金额必须大于税额')
      );
    }
  }
  return Promise.resolve(true);
};
/**
 * 税额校验
 * @params {string} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const taxAmountValidator = (value, name, record) => {
  if (value && name && record) {
    const taxAmount = record.get('taxAmount');
    const totalTax = record.get('totalTax');
    if (Math.abs(taxAmount) > Math.abs(totalTax)) {
      return Promise.resolve(
        intl.get('hiop.invoiceRedFlush.validate.taxAmount').d('税额必须小于原蓝字发票税额')
      );
    }
  }
  return Promise.resolve(true);
};
/**
 * 获取税率
 * @params {string} value-当前值
 * @returns {string}
 */
const getTaxRate = value => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};
/**
 * 判断零税率标识是否只读
 * @params {object} record-行记录
 * @returns {boolean}
 */
const zeroTaxRateFlagJudge = record => {
  return (
    (record.get('taxRate') && Number(record.get('taxRate')) !== 0) ||
    (Number(record.get('listFlag')) === 1 &&
      record.get('invoicingOrderHeaderId') &&
      !record.get('taxRate'))
  );
};

// 单价、数量传参格式调整
const toNonExponential = num => {
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
};

const calculateTaxRate = record => {
  const invoiceLineNature = record.get('invoiceLineNature');
  const taxIncludedFlag = record.get('taxIncludedFlag');
  const amount = record.get('amount');
  const taxRate = Number(record.get('taxRate')) || 0;
  const deduction = record.get('deduction') || 0;
  let taxAmount = 0;
  // 当【含税标志】为1时
  if (taxIncludedFlag === '1') {
    if (['1', '6'].includes(invoiceLineNature)) {
      // 税额=【（金额/（1+税率）】*税率
      taxAmount = (amount / (1 + taxRate)) * taxRate;
    } else {
      // 税额=【（金额-扣除额）/（1+税率）】*税率
      taxAmount = ((amount - deduction) / (1 + taxRate)) * taxRate;
    }
    // 当【含税标志】为0时
  } else if (taxIncludedFlag === '0') {
    if (['1', '6'].includes(invoiceLineNature)) {
      // 税额=金额 *税率
      taxAmount = amount * taxRate;
    } else {
      // 税额=（金额-扣除额）*税率
      taxAmount = (amount - deduction) * taxRate;
    }
  }
  record.set('taxAmount', taxAmount.toFixed(2));
};

// 计算税额
const handleTaxRate = (name, value, record, projectUnitPrice) => {
  if (['taxIncludedFlag', 'amount', 'taxRateObj', 'deduction'].includes(name)) {
    if (record.get('listFlag') !== 1 && record.get('taxRate')) {
      if (projectUnitPrice && name !== 'taxIncludedFlag') {
        record.set('quantity', (value / projectUnitPrice).toFixed(8));
      }
      // 税额
      calculateTaxRate(record);
    }
  }
};

// 商品自行编码回调
const handleProjectObjChange = (name, value, record) => {
  if (name === 'projectObj' && value) {
    const { zeroTaxRateFlag, projectUnit, model, ...otherData } = value;
    record.set({
      commodityNumberObj: otherData,
      zeroTaxRateFlag,
      projectUnit,
      model,
    });
  }
};

// 商品编码回调
const handleCommodityObjChange = (name, value, record) => {
  if (name === 'commodityNumberObj') {
    record.set({
      projectName: value.invoiceProjectName,
      taxRateObj: (value && value.taxRate && { value: getTaxRate(value.taxRate) }) || {},
    });
  }
};

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-lines/list-red-flush-lines`;
        const axiosConfig: AxiosRequestConfig = {
          params: {
            orderHeaderId: dsParams.invoicingOrderHeaderId,
          },
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'redFlushLines',
    pageSize: 10,
    paging: false,
    selection: false,
    events: {
      update: ({ record, name, value }) => {
        // quantity(数量)projectUnitPrice(单价)amount(金额)
        const projectUnitPrice = record.get('projectUnitPrice');
        const quantity = record.get('quantity');
        if (name === 'quantity' && value && projectUnitPrice) {
          record.set('amount', (value * projectUnitPrice).toFixed(2));
        }
        if (name === 'projectUnitPrice' && value) {
          record.set('amount', (value * quantity).toFixed(2));
        }
        // 零税率标识(zeroTaxRateFlag)、税率（taxRate）、优惠政策标识（preferentialPolicyFlag）
        if (name === 'taxRateObj' && (!value || Number(value.value) !== 0)) {
          record.set('zeroTaxRateFlag', '');
        }
        handleTaxRate(name, value, record, projectUnitPrice);
        // 商品自行编码
        handleProjectObjChange(name, value, record);
        // 商品编码
        handleCommodityObjChange(name, value, record);
      },
      loadFailed: ({ dataSet }) => {
        dataSet.loadData([]);
      },
    },
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'listFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
        type: FieldType.string,
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
      },
      {
        name: 'customerName',
        type: FieldType.string,
      },
      {
        name: 'extNumber',
        type: FieldType.string,
      },
      {
        name: 'totalTax',
        type: FieldType.string,
      },
      {
        name: 'invoiceLineNature',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceLineNature').d('发票行性质'),
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'projectObj',
        type: FieldType.object,
        label: intl.get('hiop.customerInfo.modal.projectObj').d('自行编码'),
        lovCode: 'HIOP.GOODS_QUERY',
        cascadeMap: {
          companyId: 'companyId',
          companyCode: 'companyCode',
          customerName: 'customerName',
        },
        lovPara: { queryBySelfCode: true },
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
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
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
        bind: 'projectObj.invoiceProjectName',
        required: true,
      },
      {
        name: 'quantityCopy',
        type: FieldType.number,
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        computedProps: {
          max: ({ record }) => (record.get('invoiceLineNature') !== '1' ? 0 : 'quantityCopy'),
          min: ({ record }) => (record.get('invoiceLineNature') === '1' ? 0 : 'quantityCopy'),
        },
        type: FieldType.string,
        transformResponse: value => value && toNonExponential(value),
      },
      {
        name: 'projectUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.string,
        min: 0.001,
        transformResponse: value => value && toNonExponential(value),
      },
      {
        name: 'taxRateObj',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_TAX_RATE',
        cascadeMap: {
          companyId: 'companyId',
          extNumber: 'extNumber',
          invoiceType: 'invoiceVariety',
        },
        computedProps: {
          required: ({ record }) =>
            record.get('listFlag') !== '1' || !record.get('invoicingOrderHeaderId'),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.string,
        bind: 'taxRateObj.value',
      },
      {
        name: 'amountCopy',
        type: FieldType.currency,
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
        step: 0.01,
        validator: (value, name, record) => amountValidator(value, name, record),
        required: true,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.taxIncludedFlag').d('是否含税'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
        trueValue: '1',
        falseValue: '0',
        // readOnly: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
        required: true,
        step: 0.01,
        validator: (value, name, record) => taxAmountValidator(value, name, record),
      },
      {
        name: 'deduction',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'model',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
        bind: 'projectObj.model',
      },
      {
        name: 'projectUnit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
        bind: 'projectObj.projectUnit',
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.preferentialPolicyFlag').d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.zeroTaxRateFlag').d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
          readOnly: ({ record }) => zeroTaxRateFlagJudge(record),
        },
      },
      {
        name: 'specialVatManagement',
        label: intl.get('hiop.invoiceWorkbench.modal.specialVatManagement').d('增值税特殊管理'),
        type: FieldType.string,
      },
      {
        name: 'commodityNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
        type: FieldType.object,
        cascadeMap: {
          companyId: 'companyId',
          companyCode: 'companyCode',
          customerName: 'customerName',
        },
        lovCode: 'HIOP.GOODS_TAX_CODE',
        computedProps: {
          required: ({ record }) =>
            record.get('listFlag') !== '1' || !record.get('invoicingOrderHeaderId'),
        },
        ignore: FieldIgnore.always,
        textField: 'commodityNumber',
      },
      {
        name: 'commodityNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
        type: FieldType.string,
        bind: 'commodityNumberObj.commodityNumber',
      },
    ],
  };
};
