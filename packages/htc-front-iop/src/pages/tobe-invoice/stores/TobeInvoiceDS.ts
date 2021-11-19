/*
 * @Description:待开票数据勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-03 16:24:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.tobe-invoice';

const amountValidator = (value, name, record) => {
  if (value && name && record) {
    const documentLineType = record.get('documentLineType'); // 行类型
    const uprojectAmount = record.getField('uprojectAmount')?.getValue() || 0; // 开票金额
    const amount = record.getField('amount')?.getValue() || 0; // 金额
    const udeduction = record.getField('udeduction')?.getValue() || 0; // 开票扣除额
    const udiscountAmount = record.getField('udiscountAmount')?.getValue() || 0; // 开票折扣金额
    const discountAmount = record.getField('discountAmount')?.getValue() || 0; // 折扣金额
    const uquantity = record.getField('uquantity')?.getValue() || 0; // 开票数量
    const quantity = record.getField('quantity')?.getValue() || 0; // 数量
    const calcu = uprojectAmount - udiscountAmount - udeduction;
    if (Math.abs(uprojectAmount) > Math.abs(amount)) {
      return '开票金额不能大于金额';
    }
    if (Math.abs(uquantity) > Math.abs(quantity)) {
      return '开票数量不能大于数量';
    }
    if (Math.abs(udiscountAmount) > Math.abs(discountAmount)) {
      return '开票折扣金额不能大于折扣额';
    }
    if (documentLineType === '1' && calcu <= 0) {
      return '开票金额-开票折扣金额-开票扣除额必须大于0';
    }
    if (documentLineType === '2' && calcu >= 0) {
      return '开票金额-开票折扣金额-开票扣除额必须小于0';
    }
  }
  return undefined;
};

const judgeReadOnly = (record, name) => {
  const documentLineType = record.get('documentLineType'); // 行类型
  const uprojectAmount = Number(record.get('uprojectAmount')) || 0; // 开票金额
  const utaxAmount = Number(record.get('utaxAmount')) || 0; // 开票税额
  // 行类型=折扣行
  if (documentLineType === '4') {
    // 开票数量、开票单价、开票金额、开票扣除额
    if (['uquantity', 'uprojectUnitPrice', 'uprojectAmount', 'udeduction'].includes(name)) {
      return true;
    }
  }
  // 行类型=赠品行
  if (documentLineType === '3' && uprojectAmount === 0 && utaxAmount === 0) {
    // 开票单价、开票金额、开票折扣金额、开票扣除额、开票税额
    if (
      [
        'uprojectUnitPrice',
        'uprojectAmount',
        'udiscountAmount',
        'udeduction',
        'utaxAmount',
      ].includes(name)
    ) {
      return true;
    }
  }
  return false;
};

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-31183` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/query-list`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/prepare-invoice-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    primaryKey: 'prepareInvoiceId',
    events: {
      update: ({ record, name, value }) => {
        const documentLineType = record.get('documentLineType'); // 行类型
        const uprojectUnitPrice = Number(record.get('uprojectUnitPrice')) || 0; // 开票单价
        const uquantity = Number(record.get('uquantity')) || 0; // 开票数量
        const taxAmount = Number(record.get('taxAmount')) || 0; // 税额
        const udiscountAmount = Number(record.get('udiscountAmount')) || 0; // 开票折扣金额
        const discountAmount = Number(record.get('discountAmount')) || 0; // 折扣额
        const amount = Number(record.get('amount')) || 0; // 金额
        const deduction = Number(record.get('deduction')) || 0; // 扣除额
        if (name === 'uquantity' && value) {
          if (uprojectUnitPrice) {
            record.set('uprojectAmount', value * uprojectUnitPrice);
          }
        }
        if (name === 'uprojectUnitPrice' && value) {
          record.set('uprojectAmount', value * uquantity);
        }
        if (name === 'uprojectAmount' && value) {
          if (uprojectUnitPrice && uprojectUnitPrice !== 0) {
            record.set('uquantity', Number((value / uprojectUnitPrice).toFixed(8)));
          }
          const countExcludeTaxAmount = amount - discountAmount; // 折后不含税金额
          const ucountExcludeTaxAmount = value - udiscountAmount; // 开票折后不含税金额
          // 销售行、退货行
          if (
            ['1', '2'].includes(documentLineType) ||
            (documentLineType === '3' && amount > 0 && taxAmount > 0)
          ) {
            // 开票扣除额=折后不含税金额1/折后不含税金额*扣除额
            // 开票税额=折后不含税金额1/折后不含税金额*税额
            if (countExcludeTaxAmount !== 0) {
              const _udeduction = (ucountExcludeTaxAmount / countExcludeTaxAmount) * deduction;
              const _utaxAmount = (ucountExcludeTaxAmount / countExcludeTaxAmount) * taxAmount;
              if (_udeduction !== 0) {
                record.set('udeduction', _udeduction);
              }
              record.set('utaxAmount', _utaxAmount);
            }
          }
        }
        // 折扣行
        if (name === 'udiscountAmount' && value) {
          // 开票税额=开票折扣额金额/折扣金额*税额
          if (discountAmount !== 0) {
            const _utaxAmount = (udiscountAmount / discountAmount) * taxAmount;
            record.set('utaxAmount', _utaxAmount);
          }
        }
        // 行类型
        if (name === 'documentLineType') {
          if (value === '4') {
            record.set('udiscountAmount', amount);
            record.set('discountAmount', amount);
            record.set('uprojectAmount', null);
            record.set('amount', null);
          }
        }
      },
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    fields: [
      {
        name: 'state',
        label: intl.get(`${modelCode}.view.invoiceSourceType`).d('状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_STATUS',
      },
      {
        name: 'documentHeadNumber',
        label: intl.get(`${modelCode}.view.documentHeadNumber`).d('单据号'),
        type: FieldType.string,
      },
      {
        name: 'documentLineNumber',
        label: intl.get(`${modelCode}.view.documentLineNumber`).d('单据行号'),
        type: FieldType.string,
      },
      {
        name: 'documentDate',
        label: intl.get(`${modelCode}.view.documentDate`).d('单据日期'),
        type: FieldType.string,
      },
      {
        name: 'businessDate',
        label: intl.get(`${modelCode}.view.businessDate`).d('业务日期'),
        type: FieldType.string,
      },
      {
        name: 'documentLineType',
        label: intl.get(`${modelCode}.view.documentLineType`).d('行类型'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_TYPE',
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('物料编码（自行编码）'),
        type: FieldType.string,
      },
      {
        name: 'materialDescription',
        label: intl.get(`${modelCode}.view.materialDescription`).d('物料描述'),
        type: FieldType.string,
      },
      {
        name: 'uprojectUnit',
        label: intl.get(`${modelCode}.view.uprojectUnit`).d('开票单位'),
        type: FieldType.string,
      },
      {
        name: 'uquantity',
        label: intl.get(`${modelCode}.view.uquantity`).d('开票数量'),
        type: FieldType.number,
        max: 'quantity',
        computedProps: {
          required: ({ record }) => record.get('uprojectUnitPrice'),
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
        precision: 8,
      },
      {
        name: 'uprojectAmount',
        label: intl.get(`${modelCode}.view.uprojectAmount`).d('开票金额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
          required: ({ record }) => record.get('documentLineType') !== '4',
        },
      },
      {
        name: 'udiscountAmount',
        label: intl.get(`${modelCode}.view.udiscountAmount`).d('开票折扣金额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
          required: ({ record }) => record.get('documentLineType') === '4',
        },
      },
      {
        name: 'udeduction',
        label: intl.get(`${modelCode}.view.udeduction`).d('开票扣除额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(amountValidator(value, name, record))),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
      },
      {
        name: 'uprojectUnitPrice',
        label: intl.get(`${modelCode}.view.uprojectUnitPrice`).d('开票单价'),
        type: FieldType.currency,
        min: 0,
        max: 'projectUnitPrice',
        computedProps: {
          required: ({ record }) => record.get('uquantity'),
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
        precision: 8,
      },
      {
        name: 'utaxAmount',
        label: intl.get(`${modelCode}.view.utaxAmount`).d('开票税额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'model',
        label: intl.get(`${modelCode}.view.model`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get(`${modelCode}.view.taxIncludedFlag`).d('含税标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
        precision: 8,
      },
      {
        name: 'projectUnitPrice',
        label: intl.get(`${modelCode}.view.projectUnitPrice`).d('单价'),
        type: FieldType.currency,
        precision: 8,
      },
      {
        name: 'amount',
        label: intl.get(`${modelCode}.view.amount`).d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'projectUnit',
        label: intl.get(`${modelCode}.view.projectUnit`).d('单位'),
        type: FieldType.string,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'discountAmount',
        label: intl.get(`${modelCode}.view.discountAmount`).d('折扣额'),
        type: FieldType.currency,
      },
      {
        name: 'deduction',
        label: intl.get(`${modelCode}.view.deduction`).d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'receiptNumber',
        label: intl.get(`${modelCode}.view.receiptNumber`).d('收票方编码'),
        type: FieldType.string,
      },
      {
        name: 'receiptName',
        label: intl.get(`${modelCode}.view.receiptName`).d('收票方名称'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'salesMan',
        label: intl.get(`${modelCode}.view.salesMan`).d('业务员'),
        type: FieldType.string,
      },
      {
        name: 'erpSalesOrderNumber',
        label: intl.get(`${modelCode}.view.erpSalesOrderNumber`).d('销售订单号'),
        type: FieldType.string,
      },
      {
        name: 'erpSalesOrderLineNumber',
        label: intl.get(`${modelCode}.view.erpSalesOrderLineNumber`).d('销售订单行号'),
        type: FieldType.string,
      },
      {
        name: 'erpDeliveryNumber',
        label: intl.get(`${modelCode}.view.erpDeliveryNumber`).d('交货单号'),
        type: FieldType.string,
      },
      {
        name: 'erpDeliveryLineNumber',
        label: intl.get(`${modelCode}.view.erpDeliveryLineNumber`).d('交货单行号'),
        type: FieldType.string,
      },
      {
        name: 'erpInvoiceNumber',
        label: intl.get(`${modelCode}.view.erpInvoiceNumber`).d('系统发票号'),
        type: FieldType.string,
      },
      {
        name: 'erpInvoiceLineNumber',
        label: intl.get(`${modelCode}.view.erpInvoiceLineNumber`).d('系统发票行号'),
        type: FieldType.string,
      },
      {
        name: 'importDate',
        label: intl.get(`${modelCode}.view.importDate`).d('导入日期'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeName',
          type: FieldType.string,
          bind: 'companyObj.employeeName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNumber',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'addressPhone',
          label: intl.get(`${modelCode}.view.addressPhone`).d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          readOnly: true,
        },
        {
          name: 'importDateFrom',
          label: intl.get(`${modelCode}.view.importDateFrom`).d('导入时间从'),
          type: FieldType.date,
          defaultValue: moment().startOf('month'),
          required: true,
        },
        {
          name: 'importDateTo',
          label: intl.get(`${modelCode}.view.importDateTo`).d('导入时间至'),
          type: FieldType.date,
          defaultValue: moment().endOf('day'),
          required: true,
        },
        {
          name: 'documentDateFrom',
          label: intl.get(`${modelCode}.view.documentDateFrom`).d('单据日期从'),
          type: FieldType.date,
          defaultValue: moment().startOf('day'),
          required: true,
        },
        {
          name: 'documentDateTo',
          label: intl.get(`${modelCode}.view.documentDateTo`).d('单据日期至'),
          type: FieldType.date,
          defaultValue: moment().endOf('day'),
          required: true,
        },
        {
          name: 'documentHeadNumber',
          label: intl.get(`${modelCode}.view.documentHeadNumber`).d('单据号'),
          type: FieldType.string,
        },
        {
          name: 'receiptName',
          label: intl.get(`${modelCode}.view.receiptName`).d('收票方名称'),
          type: FieldType.string,
        },
        {
          name: 'projectNumber',
          label: intl.get(`${modelCode}.view.projectNumber`).d('物料编码'),
          type: FieldType.string,
        },
        {
          name: 'materialDescription',
          label: intl.get(`${modelCode}.view.materialDescription`).d('物料描述'),
          type: FieldType.string,
        },
        {
          name: 'erpSalesOrderNumber',
          label: intl.get(`${modelCode}.view.erpSalesOrderNumber`).d('销售订单号'),
          type: FieldType.string,
        },
        {
          name: 'erpDeliveryNumber',
          label: intl.get(`${modelCode}.view.erpDeliveryNumber`).d('发货单号'),
          type: FieldType.string,
        },
        {
          name: 'erpInvoiceNumber',
          label: intl.get(`${modelCode}.view.erpInvoiceNumber`).d('系统发票号'),
          type: FieldType.string,
        },
        {
          name: 'state',
          label: intl.get(`${modelCode}.view.state`).d('状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_STATUS',
          multiple: ',',
          defaultValue: ['1', '3', '7'],
        },
        {
          name: 'documentLineType',
          label: intl.get(`${modelCode}.view.documentLineType`).d('行类型'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_TYPE',
          multiple: ',',
          defaultValue: ['1', '2', '3', '4'],
        },
      ],
    }),
  };
};
