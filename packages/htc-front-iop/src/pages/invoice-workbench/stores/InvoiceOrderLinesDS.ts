/**
 * @Description:开票订单行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-7 17:16:22
 * @LastEditTime: 2022-06-14 09:51
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Modal } from 'choerodon-ui/pro';

/**
 * 获取税率
 * @params {number} value-当前值
 * @returns {string}
 */
const getTaxRate = (value) => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};

/**
 * 返回行金额-折扣金额差数组
 * @params {[]} records-行数组
 * @returns {*[]}
 */
const calculateArr = (records) => {
  const temps: number[] = [];
  records.forEach((item) => {
    const amount = item.getField('amount')?.getValue() || 0; // 金额
    const discountAmount = Number(item.getField('deduction')?.getValue()) || 0; // 扣除额
    if (amount - discountAmount > 0) {
      temps.push(amount - discountAmount);
    }
  });
  return temps;
};

/**
 * 计算金额
 * @params {number} spinNum-金额
 * @params {[]} records-行数组
 */
const calculateSpin = (spinNum, records) => {
  const temps = calculateArr(records);
  const sum = temps.reduce((prev, next) => prev + next, 0);
  let stepSum = 0;
  const resultArr: number[] = [];
  records.forEach((_, index) => {
    const num = Number(((temps[index] / sum) * spinNum).toFixed(2));
    if (index === records.length - 1) {
      resultArr.push(spinNum - stepSum);
    } else {
      stepSum += num;
      resultArr.push(num);
    }
  });
  return resultArr;
};

/**
 * 获取折扣行上方商品行
 * @params {[]} records-数据源的记录
 * @params {number} index-索引
 */
const getIndexRecord = (records, index) => {
  return records[index];
};

/**
 * 金额校验规则
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {modal/string/undefined}
 */
const amountValidator = (value, name, record) => {
  const invoiceLineNature = record.getField('invoiceLineNature')?.getValue() || 0; // 发票行性质
  const amount = Math.abs(record.getField('amount')?.getValue()) || 0; // 金额
  const deductionAmount = record.getField('deduction')?.getValue() || 0; // 扣除额
  if (deductionAmount >= amount) {
    return intl.get('hiop.invoiceReq.validate.deductionAmount').d('扣除额不能大于等于金额');
  }
  if (invoiceLineNature !== '1') return; // 当不为折扣行时返回

  if (value && name && record) {
    const sum = calculateArr(record.dataSet.records).reduce((prev, next) => prev + next, 0);
    if (amount >= sum) {
      return intl
        .get('hiop.invoiceReq.validate.alldeductionAmount')
        .d('总折扣金额不能大于等于总金额-总扣除额');
    }
    // 获取折扣行上方商品行信息
    const indexAmount =
      getIndexRecord(record.dataSet.records, record.index - 1)
        .getField('amount')
        ?.getValue() || 0;
    const indexDeductionAmount =
      getIndexRecord(record.dataSet.records, record.index - 1)
        .getField('deduction')
        ?.getValue() || 0;
    if (amount && amount >= indexAmount - indexDeductionAmount) {
      if (
        record.dataSet.records.some(
          (item) => item.status === 'sync' && item.getField('invoiceLineNature')?.getValue() === '1'
        )
      ) {
        Modal.confirm({
          key: Modal.key(),
          okText: intl.get('hzero.common.button.ok').d('是'),
          title: intl.get('hzero.hzeroTheme.components.prompt').d('提示'),
          center: true,
          children: intl
            .get('hiop.invoiceReq.validate.existSpin')
            .d('已存在折扣行，无法自动拆分折扣行，请先删除已存在的折扣行'),
          okCancel: false,
          onOk: () => {
            record.dataSet.remove(record);
          },
        });
        return;
      }
      Modal.confirm({
        key: Modal.key(),
        okText: intl.get('hzero.common.button.ok').d('是'),
        cancelText: intl.get('hzero.common.button.cancel').d('否'),
        title: intl.get('hzero.hzeroTheme.components.prompt').d('提示'),
        center: true,
        children: intl
          .get('hiop.invoiceReq.validate.spin')
          .d('该行折扣金额大于金额-扣除额，是否按（金额-扣除额）比例自动分摊折扣金额？'),
        onOk: async () => {
          record.dataSet.parent.current!.set({ calculateSpin: true }); // 增加字段判断是否进行了折扣分摊
          record.dataSet.records.forEach((item) => {
            // 删除所有折扣行
            const lineNature = item.getField('invoiceLineNature')?.getValue() || 0; // 发票行性质
            if (lineNature === '1') {
              record.dataSet.remove(item);
            }
          });
          const resultArr = calculateSpin(amount, record.dataSet.records);
          const sunLength = record.dataSet.records.length;
          let initNum = 0;
          for (let index = 0; index < sunLength; index++) {
            const taxIncludedFlag = record.dataSet.records[initNum]
              .getField('taxIncludedFlag')
              ?.getValue();
            const taxRate = Number(record.dataSet.records[initNum].getField('taxRate')?.getValue());
            let taxAmount = 0;
            if (taxIncludedFlag === '1') {
              taxAmount = (resultArr[index] / (1 + taxRate)) * taxRate;
            } else {
              taxAmount = resultArr[index] * taxRate;
            }
            record.dataSet.create(
              {
                invoiceLineNature: 1,
                taxRate: record.dataSet.records[initNum].getField('taxRate')?.getValue(),
                amount: -resultArr[index],
                taxIncludedFlag,
                taxAmount: -taxAmount.toFixed(2),
              },
              initNum + 1
            );
            initNum += 2;
          }
        },
      });
      return intl
        .get('hiop.invoiceReq.validate.discountAmount')
        .d('折扣金额不能大于等于金额-扣除额');
    }
  }
  return undefined;
};

/**
 * 发票行性质校验规则
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {modal/undefined}
 */
const lineNatureValidator = (value, name, record) => {
  const currLineNature = record.getField('invoiceLineNature')?.getValue() || 0; // 发票行性质
  if (currLineNature !== '1') return; // 当不为折扣行时返回
  if (record.index === 0) {
    Modal.confirm({
      key: Modal.key(),
      okText: intl.get('hzero.common.button.ok').d('是'),
      title: intl.get('hzero.hzeroTheme.components.prompt').d('提示'),
      center: true,
      children: intl.get('hiop.invoiceReq.validate.directSpin').d('不能直接添加折扣行'),
      okCancel: false,
      onOk: () => {
        record.dataSet.remove(record);
      },
    });
    return;
  }
  if (value && name && record) {
    const prevLineNature =
      getIndexRecord(record.dataSet.records, record.index - 1)
        .getField('invoiceLineNature')
        ?.getValue() || 0; // 发票行性质
    if (value === prevLineNature) {
      Modal.confirm({
        key: Modal.key(),
        okText: intl.get('hzero.common.button.ok').d('是'),
        title: intl.get('hzero.hzeroTheme.components.prompt').d('提示'),
        center: true,
        children: intl.get('hiop.invoiceReq.validate.againSpin').d('折扣行后面不能再加折扣行'),
        okCancel: false,
        onOk: () => {
          record.dataSet.remove(record);
        },
      });
      return;
    }
  }
  return undefined;
};

/**
 * 扣除额校验规则
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const deductionValidator = (value, name, record) => {
  if (value && name && record) {
    const amount = record.getField('amount')?.getValue() || 0; // 金额
    const deduction = record.getField('deduction')?.getValue() || 0; // 扣除额
    if (deduction >= amount) {
      return intl.get('hiop.invoiceReq.validate.deductionAmount').d('扣除额不能大于等于金额');
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
        // 数量
        if (name === 'quantity' && value) {
          const price = record.get('projectUnitPrice');
          const _price = Number(price) || 0;
          const _quantity = Number(value) || 0;
          if (price && _price !== 0 && _quantity !== 0) {
            const amount = _quantity * _price;
            record.set('amount', amount.toFixed(2));
          } else {
            const amount = record.get('amount');
            const _amount = Number(amount) || 0;
            if (amount && _amount !== 0 && _quantity !== 0) {
              const calPrice = _amount / _quantity;
              if (calPrice.toString().length > 8) {
                record.set({
                  projectUnitPrice: calPrice.toFixed(8),
                });
              } else {
                record.set({ projectUnitPrice: calPrice });
              }
            }
          }
        }
        // 单价
        if (name === 'projectUnitPrice' && value) {
          const quantity = record.get('quantity');
          const _price = Number(value) || 0;
          const _quantity = Number(quantity) || 0;
          if (quantity && _price !== 0 && _quantity !== 0) {
            const amount = _quantity * _price;
            record.set('amount', amount.toFixed(2));
          } else {
            const amount = record.get('amount');
            const _amount = Number(amount) || 0;
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
          record.set('taxAmount', taxAmount.toFixed(2));
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
        type: FieldType.boolean,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'invoiceLineNature',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceLineNature').d('发票行性质'),
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
        type: FieldType.string,
        required: true,
        computedProps: {
          readOnly: ({ record }) =>
            record.get('invoiceLineNature') === '1' && record.status !== 'add',
        },
        validator: (value, name, record) =>
          new Promise((reject) => reject(lineNatureValidator(value, name, record))),
        defaultValue: '0',
      },
      {
        name: 'projectObj',
        type: FieldType.object,
        label: intl.get('hiop.invoiceWorkbench.modal.projectObj').d('商品（自行编码）'),
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
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
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
        type: FieldType.string,
        bind: 'commodityNumberObj.commodityNumber',
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectName').d('项目名称（开票）'),
        type: FieldType.string,
      },
      {
        name: 'abbreviation',
        label: intl.get('hiop.invoiceWorkbench.modal.abbreviation').d('商品和服务分类简称'),
        type: FieldType.string,
        bind: 'commodityNumberObj.abbreviation',
      },
      {
        name: 'projectNameSuffix',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('invoiceLineNature') !== '1',
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        type: FieldType.string,
        min: 0.00000001,
        defaultValidationMessages: {
          rangeUnderflow: intl.get('hiop.invoiceWorkbench.notification.number').d('数量必须大于0'),
        },
        transformResponse(value) {
          const toNonExponential = (num) => {
            const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
            return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
          };
          return value && toNonExponential(value);
        },
      },
      {
        name: 'projectUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.string,
        computedProps: {
          max: ({ record }) => (record.get('invoiceLineNature') === '1' ? -0.001 : 9999999999),
          min: ({ record }) => (record.get('invoiceLineNature') !== '1' ? 0.001 : -9999999999),
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        transformResponse(value) {
          const toNonExponential = (num) => {
            const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
            return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
          };
          return value && toNonExponential(value);
        },
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
        type: FieldType.string,
        bind: 'taxRateObj.value',
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
        computedProps: {
          // readOnly: ({ record }) => record.get('projectUnitPrice') && record.get('quantity'),
          max: ({ record }) => (record.get('invoiceLineNature') === '1' ? 0 : 9999999999),
          min: ({ record }) => (record.get('invoiceLineNature') !== '1' ? 0.01 : -9999999999),
          readOnly: ({ record }) =>
            record.get('invoiceLineNature') === '1' && record.status !== 'add',
        },
        required: true,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.taxIncludedFlag').d('是否含税'),
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
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'deduction',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
        min: 0,
        validator: (value, name, record) =>
          new Promise((reject) => reject(deductionValidator(value, name, record))),
      },
      {
        name: 'model',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        // bind: 'commodityNumberObj.model',
      },
      {
        name: 'projectUnit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('invoiceLineNature') === '1',
        },
        // bind: 'commodityNumberObj.projectUnit',
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.preferentialPolicyFlag').d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
        // bind: 'commodityNumberObj.preferentialPolicyFlag',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.zeroTaxRateFlag').d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
          readOnly: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) !== 0,
        },
      },
      {
        name: 'specialVatManagement',
        label: intl.get('hiop.invoiceWorkbench.modal.specialVatManagement').d('增值税特殊管理'),
        type: FieldType.string,
        // bind: 'commodityNumberObj.specialVatManagement',
      },
    ],
  };
};
