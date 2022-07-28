/**
 * @Description:待开票数据勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-03 16:24:22
 * @LastEditTime: 2022-06-15 10:37:22
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 金额校验
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string|undefined}
 */
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
      return intl.get('hiop.tobeInvoice.validate.uprojectAmount').d('开票金额不能大于金额');
    }
    if (Math.abs(uquantity) > Math.abs(quantity)) {
      return intl.get('hiop.tobeInvoice.validate.uquantity').d('开票数量不能大于数量');
    }
    if (Math.abs(udiscountAmount) > Math.abs(discountAmount)) {
      return intl.get('hiop.tobeInvoice.validate.udiscountAmount').d('开票折扣金额不能大于折扣额');
    }
    if (documentLineType === '1' && calcu <= 0) {
      return intl
        .get('hiop.tobeInvoice.validate.calcuOver')
        .d('开票金额-开票折扣金额-开票扣除额必须大于0');
    }
    if (documentLineType === '2' && calcu >= 0) {
      return intl
        .get('hiop.tobeInvoice.validate.calcuLess')
        .d('开票金额-开票折扣金额-开票扣除额必须小于0');
    }
  }
  return undefined;
};

/**
 * 只读判断
 * @params {object} record-行记录
 * @params {string} name-标签名
 * @returns {boolean}
 */
const judgeReadOnly = (record, name) => {
  const documentLineType = record.get('documentLineType'); // 行类型
  const uprojectAmount = Number(record.get('uprojectAmount')) || 0; // 开票金额
  const utaxAmount = Number(record.get('utaxAmount')) || 0; // 开票税额
  if (documentLineType === '4') {
    // 行类型=折扣行
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

const handleUprojectAmountChange = (
  value,
  documentLineType,
  amount,
  taxAmount,
  record,
  udiscountAmount,
  discountAmount
) => {
  const deduction = Number(record.get('deduction')) || 0; // 扣除额
  const countExcludeTaxAmount = amount - discountAmount; // 折后不含税金额
  const ucountExcludeTaxAmount = value - udiscountAmount; // 开票折后不含税金额
  if (
    ['1', '2'].includes(documentLineType) ||
    (documentLineType === '3' && amount > 0 && taxAmount > 0)
  ) {
    if (countExcludeTaxAmount !== 0) {
      const _udeduction = (ucountExcludeTaxAmount / countExcludeTaxAmount) * deduction;
      const _utaxAmount = (ucountExcludeTaxAmount / countExcludeTaxAmount) * taxAmount;
      if (_udeduction !== 0) {
        record.set('udeduction', _udeduction);
      }
      record.set('utaxAmount', _utaxAmount);
    }
  }
};

const setUtaxAmount = (name, value, record, udiscountAmount, discountAmount, taxAmount) => {
  if (name === 'udiscountAmount' && value) {
    // 开票税额=开票折扣额金额/折扣金额*税额
    if (discountAmount !== 0) {
      const _utaxAmount = (udiscountAmount / discountAmount) * taxAmount;
      record.set('utaxAmount', _utaxAmount);
    }
  }
};

const handleDocumentLineTypeChange = (name, value, record) => {
  if (name === 'documentLineType') {
    const uprojectAmount = Number(record.get('uprojectAmount')) || 0; // 开票金额
    if (value === '4') {
      record.set('udiscountAmount', uprojectAmount);
      record.set('discountAmount', uprojectAmount);
      record.set('uprojectAmount', null);
      record.set('amount', null);
    }
  }
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const dayEnd = moment().endOf('day');
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
      submit: ({ data, params, dataSet }) => {
        const { queryDataSet }: any = dataSet;
        const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
        const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
        return {
          url: `${API_PREFIX}/v1/${tenantId}/prepare-invoice-infos/batch-save`,
          data,
          params: { ...params, companyCode, employeeNumber },
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
        if (name === 'uquantity' && value && uprojectUnitPrice) {
          record.set('uprojectAmount', value * uprojectUnitPrice);
        }
        if (name === 'uprojectUnitPrice' && value) {
          record.set('uprojectAmount', value * uquantity);
        }
        if (name === 'uprojectAmount' && value) {
          if (uprojectUnitPrice && uprojectUnitPrice !== 0) {
            record.set('uquantity', Number((value / uprojectUnitPrice).toFixed(8)));
          }
          // 销售行、退货行
          handleUprojectAmountChange(
            value,
            documentLineType,
            amount,
            taxAmount,
            record,
            udiscountAmount,
            discountAmount
          );
        }
        // 折扣行
        setUtaxAmount(name, value, record, udiscountAmount, discountAmount, taxAmount);
        // 行类型
        handleDocumentLineTypeChange(name, value, record);
      },
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    fields: [
      {
        name: 'state',
        label: intl.get('hiop.redInvoiceInfo.modal.state').d('状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_STATUS',
      },
      {
        name: 'sourceHeadNumber',
        label: intl.get('hiop.tobeInvoice.modal.sourceHeadNumber').d('来源单据号'),
        type: FieldType.string,
      },
      {
        name: 'sourceLineNumber',
        label: intl.get('hiop.tobeInvoice.modal.sourceLineNumber').d('来源单据行号'),
        type: FieldType.string,
      },
      {
        name: 'documentDate',
        label: intl.get('hiop.tobeInvoice.modal.documentDate').d('单据日期'),
        type: FieldType.string,
      },
      {
        name: 'businessDate',
        label: intl.get('hiop.tobeInvoice.modal.businessDate').d('业务日期'),
        type: FieldType.string,
      },
      {
        name: 'documentLineType',
        label: intl.get('hiop.tobeInvoice.modal.documentLineType').d('行类型'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_TYPE',
      },
      {
        name: 'projectNumber',
        label: intl
          .get('hiop.tobeInvoice.modal.materialCode-selfCoding)')
          .d('物料编码（自行编码）'),
        type: FieldType.string,
      },
      {
        name: 'materialDescription',
        label: intl.get('hiop.tobeInvoice.modal.materialDescription').d('物料描述'),
        type: FieldType.string,
      },
      {
        name: 'uprojectUnit',
        label: intl.get('hiop.tobeInvoice.modal.uprojectUnit').d('开票单位'),
        type: FieldType.string,
      },
      {
        name: 'uquantity',
        label: intl.get('hiop.tobeInvoice.modal.uquantity').d('开票数量'),
        type: FieldType.number,
        max: 'quantity',
        computedProps: {
          required: ({ record }) => record.get('uprojectUnitPrice'),
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
        validator: (value, name, record) => amountValidator(value, name, record),
        precision: 8,
      },
      {
        name: 'uprojectAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceAmount').d('开票金额'),
        type: FieldType.currency,
        validator: (value, name, record) => amountValidator(value, name, record),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
          required: ({ record }) => record.get('documentLineType') !== '4',
        },
      },
      {
        name: 'udiscountAmount',
        label: intl.get('hiop.tobeInvoice.modal.udiscountAmount').d('开票折扣金额'),
        type: FieldType.currency,
        validator: (value, name, record) => amountValidator(value, name, record),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
          required: ({ record }) => record.get('documentLineType') === '4',
        },
      },
      {
        name: 'udeduction',
        label: intl.get('hiop.tobeInvoice.modal.udeduction').d('开票扣除额'),
        type: FieldType.currency,
        validator: (value, name, record) => amountValidator(value, name, record),
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
      },
      {
        name: 'uprojectUnitPrice',
        label: intl.get('hiop.tobeInvoice.modal.uprojectUnitPrice').d('开票单价'),
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
        label: intl.get('hiop.tobeInvoice.modal.utaxAmount').d('开票税额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record, name }) => judgeReadOnly(record, name),
        },
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'model',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.tobeInvoice.modal.taxIncludedFlag').d('含税标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
        precision: 8,
      },
      {
        name: 'projectUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
        precision: 8,
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'projectUnit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
      },
      {
        name: 'taxRate',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'discountAmount',
        label: intl.get('hiop.tobeInvoice.modal.discountAmount').d('折扣额'),
        type: FieldType.currency,
      },
      {
        name: 'deduction',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'receiptNumber',
        label: intl.get('hiop.tobeInvoice.modal.receiptNumber').d('收票方编码'),
        type: FieldType.string,
      },
      {
        name: 'receiptName',
        label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get('hiop.invoiceReq.modal.remark').d('备注'),
        type: FieldType.string,
      },
      {
        name: 'salesMan',
        label: intl.get('hiop.invoiceReq.modal.salesMan').d('业务员'),
        type: FieldType.string,
      },
      {
        name: 'erpSalesOrderNumber',
        label: intl.get('hiop.invoiceReq.modal.erpSalesOrderNumber').d('销售订单号'),
        type: FieldType.string,
      },
      {
        name: 'erpSalesOrderLineNumber',
        label: intl.get('hiop.invoiceReq.modal.erpSalesOrderLineNumber').d('销售订单行号'),
        type: FieldType.string,
      },
      {
        name: 'erpDeliveryNumber',
        label: intl.get('hiop.invoiceReq.modal.erpDeliveryNumber').d('交货单号'),
        type: FieldType.string,
      },
      {
        name: 'erpDeliveryLineNumber',
        label: intl.get('hiop.invoiceReq.modal.erpDeliveryLineNumber').d('交货单行号'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber1',
        label: intl.get('hiop.invoiceReq.modal.sourceDocumentNumber1').d('来源单据号1'),
        type: FieldType.string,
      },
      {
        name: 'sourceLineNumber1',
        label: intl.get('hiop.invoiceReq.modal.sourceLineNumber1').d('来源单据行号1'),
        type: FieldType.string,
      },
      {
        name: 'importDate',
        label: intl.get('hiop.invoiceReq.modal.importDate').d('导入日期'),
        type: FieldType.string,
      },
      {
        name: 'batchNo',
        label: intl.get('hiop.invoiceReq.modal.batchNo').d('待开票批次号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceInfo',
        label: intl.get('hiop.invoiceReq.modal.invoiceNums').d('发票信息'),
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
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.number,
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
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
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
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'addressPhone',
          label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          readOnly: true,
        },
        {
          name: 'importDate',
          label: intl.get('hiop.tobeInvoice.modal.importDate').d('导入时间'),
          range: ['importDateFrom', 'importDateTo'],
          type: FieldType.date,
          defaultValue: {
            importDateFrom: moment().startOf('month'),
            importDateTo: dayEnd,
          },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'importDateFrom',
          type: FieldType.date,
          bind: 'importDate.importDateFrom',
        },
        {
          name: 'importDateTo',
          type: FieldType.date,
          bind: 'importDate.importDateTo',
        },
        {
          name: 'documentDate',
          label: intl.get('hiop.tobeInvoice.modal.documentDate').d('单据日期'),
          type: FieldType.date,
          range: ['documentDateFrom', 'documentDateTo'],
          // defaultValue: {
          //   documentDateFrom: moment().startOf('day'),
          //   documentDateTo: dayEnd,
          // },
          ignore: FieldIgnore.always,
          // required: true,
        },
        {
          name: 'documentDateFrom',
          type: FieldType.date,
          bind: 'documentDate.documentDateFrom',
        },
        {
          name: 'documentDateTo',
          type: FieldType.date,
          bind: 'documentDate.documentDateTo',
        },
        {
          name: 'sourceHeadNumber',
          label: intl.get('hiop.tobeInvoice.modal.sourceHeadNumber').d('来源单据号'),
          type: FieldType.string,
        },
        {
          name: 'receiptName',
          label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
          type: FieldType.string,
        },
        {
          name: 'projectNumber',
          label: intl.get('hiop.tobeInvoice.modal.projectNumber').d('物料编码'),
          type: FieldType.string,
        },
        {
          name: 'materialDescription',
          label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
          type: FieldType.string,
        },
        {
          name: 'erpSalesOrderNumber',
          label: intl.get('hiop.tobeInvoice.modal.erpSalesOrderNumber').d('销售订单号'),
          type: FieldType.string,
        },
        {
          name: 'erpDeliveryNumber',
          label: intl.get('hiop.tobeInvoice.modal.erpDeliveryNumber').d('发货单号'),
          type: FieldType.string,
        },
        {
          name: 'sourceNumber1',
          label: intl.get('hiop.tobeInvoice.modal.sourceNumber1').d('来源单据号1'),
          type: FieldType.string,
        },
        {
          name: 'state',
          label: intl.get('hiop.redInvoiceInfo.modal.state').d('状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_STATUS',
          multiple: ',',
          defaultValue: ['1', '2', '3', '5', '6', '7', '8', '10', '11'],
        },
        {
          name: 'documentLineType',
          label: intl.get('hiop.tobeInvoice.modal.documentLineType').d('行类型'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_TYPE',
          multiple: ',',
          defaultValue: ['1', '2', '3', '4'],
        },
        {
          name: 'batchNo',
          label: intl.get('hiop.tobeInvoice.modal.batchNo').d('待开票批次号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceCode',
          label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
