/**
 * @Description:开票申请行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-02-01 16:21:50
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';

/**
 * 返回行金额-折扣金额差数组
 * @params {[]} records-行数组
 * @returns {*[]}
 */
const calculateArr = records => {
  const temps: number[] = [];
  records.forEach(item => {
    const amount = item.getField('amount')?.getValue() || 0; // 金额
    const deductionAmount = Number(item.getField('deductionAmount')?.getValue()) || 0; // 扣除额
    if (amount - deductionAmount > 0) {
      temps.push(amount - deductionAmount);
    }
  });
  return temps;
};

/**
 * 计算折扣金额
 * @params {number} spinNum-折扣金额
 * @params {[]} records-行数组
 */
const calculateSpin = (spinNum, records) => {
  const temps = calculateArr(records);
  const sum = temps.reduce((prev, next) => prev + next, 0);
  let stepSum = 0;
  records.forEach((item, index) => {
    const num = Number(((temps[index] / sum) * spinNum).toFixed(2));
    if (index === records.length - 1) {
      item.set({ discountAmount: spinNum - stepSum });
    } else {
      stepSum += num;
      item.set({ discountAmount: num });
    }
  });
};

/**
 * 数量和单价校验规则
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const priceQuantityValidator = (_, __, record) => {
  const quantity = record.getField('quantity')?.getValue();
  const price = record.getField('price')?.getValue();
  if ((price && quantity) || (!price && !quantity)) {
    return Promise.resolve(true);
  } else {
    return Promise.resolve(
      intl
        .get('hiop.invoiceReq.validate.priceQuantity')
        .d('商品数量和单价必须同时为空，或都不能为空')
    );
  }
};

/**
 * 金额校验规则
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const amountValidator = (value, name, record) => {
  if (value && name && record) {
    const amount = record.getField('amount')?.getValue() || 0; // 金额
    const deductionAmount = Number(record.getField('deductionAmount')?.getValue()) || 0; // 扣除额
    const discountAmount = record.getField('discountAmount')?.getValue() || 0; // 折扣金额
    const sum = calculateArr(record.dataSet.records).reduce((prev, next) => prev + next, 0);
    if (name === 'discountAmount' && value < 0) {
      return Promise.resolve(
        intl.get('hiop.invoiceReq.validate.discountAmountGreaterThan0').d('折扣金额不能为负数')
      );
    }
    if (deductionAmount >= amount) {
      return Promise.resolve(
        intl.get('hiop.invoiceReq.validate.deductionAmount').d('扣除额不能大于等于金额')
      );
    }
    if (discountAmount >= sum) {
      return Promise.resolve(
        intl
          .get('hiop.invoiceReq.validate.alldeductionAmount')
          .d('总折扣金额不能大于等于总金额-总扣除额')
      );
    }
    if (discountAmount && amount && discountAmount >= amount - deductionAmount) {
      Modal.confirm({
        key: Modal.key(),
        okText: intl.get('hzero.common.button.ok').d('是'),
        cancelText: intl.get('hzero.common.button.cancel').d('否'),
        title: intl.get('hzero.hzeroTheme.components.prompt').d('提示'),
        center: true,
        children: intl
          .get('hiop.invoiceReq.validate.spin')
          .d('该行折扣金额大于金额-扣除额，是否按（金额-扣除额）比例自动分摊折扣金额'),
        onOk: async () => {
          calculateSpin(discountAmount, record.dataSet.records);
        },
      });
      return Promise.resolve(
        intl.get('hiop.invoiceReq.validate.discountAmount').d('折扣金额不能大于等于金额-扣除额')
      );
    }
  }
  return Promise.resolve(true);
};

/**
 * 获取税率
 * @params {number} value-当前值
 * @returns {string}
 */
const getTaxRate = value => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};

const toNonExponential = num => {
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
};

const setPrice = (record, _quantity) => {
  const amount = record.get('amount');
  const _amount = Number(amount) || 0;
  if (amount && _amount !== 0 && _quantity !== 0) {
    const calPrice = _amount / _quantity;
    if (calPrice.toString().length > 8) {
      record.set({
        price: calPrice.toFixed(8),
      });
    } else {
      record.set({ price: calPrice });
    }
  }
};

const handleQuantityChange = (name, value, record) => {
  if (name === 'quantity' && value) {
    const price = record.get('price');
    const _price = Number(price) || 0;
    const _quantity = Number(value) || 0;
    if (price && _price !== 0 && _quantity !== 0) {
      const amount = _quantity * _price;
      record.set('amount', amount.toFixed(2));
    } else {
      setPrice(record, _quantity);
    }
  }
};

const setQuantity = (amount, _amount, _price, record) => {
  if (amount && _amount !== 0 && _price !== 0) {
    const calQuantity = _amount / _price;
    if (calQuantity.toString().length > 8) {
      record.set({
        quantity: calQuantity.toFixed(8),
      });
    } else {
      record.set({ quantity: calQuantity });
    }
  }
};

const handlePriceChange = (name, value, record) => {
  if (name === 'price' && value) {
    const quantity = record.get('quantity');
    const _price = Number(value) || 0;
    const _quantity = Number(quantity) || 0;
    if (quantity && _price !== 0 && _quantity !== 0) {
      const amount = _quantity * _price;
      record.set('amount', amount.toFixed(2));
    } else {
      const amount = record.get('amount');
      const _amount = Number(amount) || 0;
      setQuantity(amount, _amount, _price, record);
    }
  }
};

const setTaxAmount = (name, record) => {
  if (
    ['taxIncludedFlag', 'amount', 'taxRateObj', 'deductionAmount', 'discountAmount'].includes(name)
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
    record.set('taxAmount', taxAmount.toFixed(2));
  }
};

const setPreferentialPolicyFlag = (name, record, value) => {
  if (name === 'zeroTaxRateFlag') {
    if (['0', '1', '2'].includes(value)) {
      record.set('preferentialPolicyFlag', '1');
    } else {
      record.set('preferentialPolicyFlag', '0');
    }
  }
};

const handleCommodityNumberObjChange = (name, value, record) => {
  if (name === 'commodityNumberObj') {
    const zeroTaxRateFlag = value && value.zeroTaxRateFlag;
    record.set({
      projectName: `*${record.get('commodityShortName') || ''}*${record.get('issues') || ''}`,
      taxRateObj: (value && value.taxRate && { value: getTaxRate(value.taxRate) }) || {},
      preferentialPolicyFlag: ['0', '1', '2'].includes(zeroTaxRateFlag) ? '1' : '0',
    });
  }
};

const setProjectName = (name, record) => {
  if (['commodityShortName', 'issues'].includes(name)) {
    record.set(
      'projectName',
      `*${record.get('commodityShortName') || ''}*${record.get('issues') || ''}`
    );
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
    pageSize: 10,
    selection: false,
    primaryKey: 'lineId',
    events: {
      update: ({ record, name, value }) => {
        // 数量
        handleQuantityChange(name, value, record);
        // 单价
        handlePriceChange(name, value, record);
        // 税额
        setTaxAmount(name, record);

        if (name === 'taxRateObj' && (!value || Number(value.value) !== 0)) {
          record.set('zeroTaxRateFlag', '');
        }
        // 优惠政策标识
        setPreferentialPolicyFlag(name, record, value);

        // 商品自行编码
        if (name === 'projectNumberObj' && value) {
          record.set({ commodityNumberObj: value, issues: value.projectName || '' });
        }
        // 商品编码
        handleCommodityNumberObjChange(name, value, record);
        // 票面项目名称
        setProjectName(name, record);
      },
    },
    fields: [
      {
        name: 'lineId',
        type: FieldType.string,
      },
      {
        name: 'headerId',
        type: FieldType.string,
      },
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'lineNum',
        label: intl.get('hiop.invoiceReq.modal.lineNum').d('行号'),
        type: FieldType.string,
      },
      {
        name: 'projectNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.projectObj').d('商品(自行编码)'),
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
        type: FieldType.string,
        bind: 'projectNumberObj.projectNumber',
      },
      {
        name: 'commodityNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
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
        type: FieldType.string,
        required: true,
        bind: 'commodityNumberObj.commodityNumber',
      },
      {
        name: 'commodityShortName',
        label: intl.get('hiop.invoiceReq.modal.commodityShortNameOrder').d('商品简称'),
        type: FieldType.string,
        // required: true,
        bind: 'commodityNumberObj.abbreviation',
      },
      {
        name: 'issues',
        label: intl.get('hiop.invoiceReq.modal.commodityIssues').d('开具名称'),
        type: FieldType.string,
        required: true,
        // bind: 'projectNumberObj.projectName',
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceReq.modal.projectName').d('票面项目名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.string,
        min: 0.00000001,
        defaultValidationMessages: {
          rangeUnderflow: intl.get('hiop.invoiceWorkbench.notification.number').d('数量必须大于0'),
        },
        transformResponse: value => value && toNonExponential(value),
        validator: (value, name, record) => priceQuantityValidator(value, name, record),
      },
      {
        name: 'price',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.string,
        min: 0.001,
        transformResponse: value => value && toNonExponential(value),
        validator: (value, name, record) => priceQuantityValidator(value, name, record),
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
        required: true,
        min: 0.01,
        validator: (value, name, record) => amountValidator(value, name, record),
      },
      {
        name: 'discountAmount',
        label: intl.get('hiop.invoiceReq.modal.discountAmount').d('折扣金额'),
        type: FieldType.currency,
        validator: (value, name, record) => amountValidator(value, name, record),
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.taxIncludedFlag').d('是否含税'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.TAX_MARK',
        defaultValue: '1',
      },
      {
        name: 'extNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumberObj').d('分机号'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRateObj',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_TAX_RATE',
        cascadeMap: { companyId: 'companyId', extNumber: 'extNumber', invoiceType: 'invoiceType' },
        required: true,
        ignore: FieldIgnore.always,
      },

      {
        name: 'taxRate',
        type: FieldType.string,
        // lookupCode: 'HIOP.TAX_RATE',
        required: true,
        bind: 'taxRateObj.value',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.zeroTaxRateFlag').d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        bind: 'commodityNumberObj.zeroTaxRateFlag',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
        },
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'deductionAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
        min: 0,
        validator: (value, name, record) => amountValidator(value, name, record),
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.preferentialPolicyFlag').d('优惠政策标识'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
      },
      {
        name: 'specificationModel',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
        bind: 'commodityNumberObj.model',
      },
      {
        name: 'unit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        bind: 'commodityNumberObj.projectUnit',
        type: FieldType.string,
      },
      {
        name: 'sourceLineNum',
        label: intl.get('hiop.invoiceReq.modal.sourceLineNum').d('申请来源行号'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber3',
        label: intl.get('hiop.invoiceReq.modal.applicationSourceNum3').d('申请来源单号3'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber4',
        label: intl.get('hiop.invoiceReq.modal.applicationSourceNum4').d('申请来源单号4'),
        type: FieldType.string,
      },
      {
        name: 'adjustFlag',
        label: intl.get('hiop.invoiceReq.modal.adjustFlag').d('调整标志'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.ADJUST_MARK',
      },
      {
        name: 'adjustLineId',
        label: intl.get('hiop.invoiceReq.modal.adjustLineId').d('调整来源行ID'),
        type: FieldType.string,
      },
      {
        name: 'specialTaxationMethod',
        label: intl.get('hiop.invoiceWorkbench.view.specialTaxationMethod').d('特定征税方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.SPECIAL_TAXATION_METHOD',
      },
      {
        name: 'taxPreferPolicyTypeCode',
        label: intl.get('hiop.invoiceWorkbench.view.taxPreferPolicyTypeCode').d('税收优惠政策类型'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TAX_PREFER_POLICY_TYPE_CODE',
      },
    ],
  };
};
