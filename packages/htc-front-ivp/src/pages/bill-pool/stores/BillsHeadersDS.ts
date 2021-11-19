/*
 * @Descripttion:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 16:29:24
 * @LastEditTime: 2021-03-03 17:48:08
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.bills';

// 必输受控于票据类型
const requiredByBillType = (record, name) => {
  const billTypeTag = record && record.get('billTypeTag');
  return billTypeTag.includes(name);
};

// 金额校验
// const amountValidator = (value, name, record) => {
//   if (value && name && record) {
//     const invoiceAmount = record.getField('invoiceAmount')?.getValue() || 0; // 金额
//     const taxAmount = record.getField('taxAmount')?.getValue() || 0; // 税额
//     const totalAmount = record.getField('totalAmount')?.getValue(); // 价税合计
//     if (totalAmount && Number(invoiceAmount) + Number(taxAmount) !== Number(totalAmount)) {
//       return '发票金额与发票税额之和不等于价税合计';
//     }
//   }
//   return undefined;
// };

// const accSub = (arg1, arg2) => {
//   let r1;
//   let r2;
//   try {
//     r1 = arg1.toString().split('.')[1].length;
//   } catch (e) {
//     r1 = 0;
//   }
//   try {
//     r2 = arg2.toString().split('.')[1].length;
//   } catch (e) {
//     r2 = 0;
//   }
//   const m =(10 ** Math.max(r1, r2));
//   return ((arg1 * m - arg2 * m)/m).toFixed(2);
// };

// 金额计算
const getBillAmount = (record) => {
  const taxRate = Number(record.get('taxRate')) || 0;
  const totalAmount = Number(record.get('totalAmount')) || 0;
  const invoiceAmount = Number(((1000 * totalAmount) / ((1 + taxRate) * 1000)).toFixed(2));
  const taxAmount = ((totalAmount * 100 - invoiceAmount * 100) / 100).toFixed(2);
  const aviationDevelopmentFund = Number(record.get('aviationDevelopmentFund')) || 0;
  record.set({
    invoiceAmount,
    taxAmount,
    invoiceTotalAmount: aviationDevelopmentFund + totalAmount,
  });
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const halfYearStart = moment().subtract(6, 'months').startOf('month');
  const yearStart = moment().subtract(12, 'months').startOf('month');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos`;
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
          url: `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'billPoolHeaderId',
    events: {
      update: ({ record, name, value }) => {
        if (name === 'billType') {
          const billTypeData = record && record.getField(name).getLookupData(value);
          record.set({
            billTypeTag: billTypeData && billTypeData.tag,
            taxRate: billTypeData && billTypeData.description,
          });
          getBillAmount(record);
        }
        // 价税合计
        if (name === 'totalAmount') {
          getBillAmount(record);
        }
        // 发票金额
        if (name === 'invoiceAmount') {
          const totalAmount = Number(record.get('totalAmount')) || 0;
          const invoiceAmount = Number(record.get('invoiceAmount')) || 0;
          const taxAmount = ((totalAmount * 100 - invoiceAmount * 100) / 100).toFixed(2);
          record.set({ taxAmount });
        }
        // 发票税额
        if (name === 'taxAmount') {
          const totalAmount = Number(record.get('totalAmount')) || 0;
          const taxAmount = Number(record.get('taxAmount')) || 0;
          const invoiceAmount = ((totalAmount * 100 - taxAmount * 100) / 100).toFixed(2);
          record.set({ invoiceAmount });
        }
        // 民航发展基金
        if (name === 'aviationDevelopmentFund') {
          const totalAmount = Number(record.get('totalAmount')) || 0;
          record.set({ invoiceTotalAmount: totalAmount + value });
        }

        // 收票日期
        if (name === 'ticketCollectorObj') {
          record.set('ticketCollectorDate', value ? moment() : '');
        }
      },
    },
    fields: [
      {
        name: 'billPoolHeaderId',
        label: intl.get(`${modelCode}.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      // {
      //   name: 'tenantName',
      //   label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
      //   type: FieldType.string,
      //   defaultValue: getCurrentTenant().tenantName,
      // },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('公司纳税人识别号'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('票据类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.BILL_TYPE',
        required: true,
      },
      {
        name: 'billTypeTag',
        label: intl.get(`${modelCode}.view.billTypeTag`).d('票据类型标记'),
        type: FieldType.string,
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceState',
        label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
        required: true,
        // computedProps: {
        //   required: ({ record }) => record.get('billType') !== 'BLOCK_CHAIN',
        // },
        defaultValue: '0',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票/客票号码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'aviationDevelopmentFund',
        label: intl.get(`${modelCode}.view.aviationDevelopmentFund`).d('民航发展基金'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceTotalAmount',
        label: intl.get(`${modelCode}.view.invoiceTotalAmount`).d('发票总金额'),
        type: FieldType.currency,
        ignore: FieldIgnore.always,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方纳税识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      // {
      //   name: 'salerAddressPhone',
      //   label: intl.get(`${modelCode}.view.salerAddressPhone`).d('销方地址、电话'),
      //   type: FieldType.string,
      // },
      // {
      //   name: 'salerAccount',
      //   label: intl.get(`${modelCode}.view.salerAccount`).d('销方开户行及账号'),
      //   type: FieldType.string,
      // },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      // {
      //   name: 'buyerAddressPhone',
      //   label: intl.get(`${modelCode}.view.buyerAddressPhone`).d('购方地址、电话'),
      //   type: FieldType.string,
      // },
      // {
      //   name: 'buyerAccount',
      //   label: intl.get(`${modelCode}.view.buyerAccount`).d('购方开户行及账号'),
      //   type: FieldType.string,
      // },
      {
        name: 'entrance',
        label: intl.get(`${modelCode}.view.entrance`).d('始发地/入口'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'destination',
        label: intl.get(`${modelCode}.view.destination`).d('目的地/出口/城市'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'trainAndFlight',
        label: intl.get(`${modelCode}.view.trainAndFlight`).d('车次/航班号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'seatType',
        label: intl.get(`${modelCode}.view.seatType`).d('座位/舱位类型'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'boardingTime',
        label: intl.get(`${modelCode}.view.boardingTime`).d('上车时间/乘车时间'),
        type: FieldType.dateTime,
        // transformResponse: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        name: 'alightingTime',
        label: intl.get(`${modelCode}.view.alightingTime`).d('下车时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'ticketCollectorObj',
        label: intl.get(`${modelCode}.view.ticketCollectorObj`).d('收票员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
        textField: 'employeeDesc',
      },
      {
        name: 'ticketCollectorDesc',
        label: intl.get(`${modelCode}.view.ticketCollectorDesc`).d('收票员工'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeDesc',
      },
      {
        name: 'ticketCollector',
        type: FieldType.number,
        bind: 'ticketCollectorObj.employeeId',
      },
      {
        name: 'employeeTypeCode',
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeTypeCode',
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`${modelCode}.view.internationalTelCode`).d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
        },
        bind: 'ticketCollectorObj.internationalTelCode',
      },
      {
        name: 'employeeIdentify',
        label: intl.get(`${modelCode}.view.employeeIdentify`).d('收票员工标识'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.mobile',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
          pattern: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return PHONE;
            }
          },
          defaultValidationMessages: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return { patternMismatch: '手机格式不正确' };
            }
          },
        },
      },
      {
        name: 'ticketCollectorDate',
        label: intl.get(`${modelCode}.view.ticketCollectorDate`).d('收票日期'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      // {
      //   name: 'abnormalSign',
      //   label: intl.get(`${modelCode}.view.abnormalSign`).d('异常标记'),
      //   type: FieldType.string,
      //   lookupCode: 'HIVP.ABNORMAL_SIGN',
      //   multiple: ',',
      // },
      {
        name: 'recordType',
        label: intl.get(`${modelCode}.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'recordState',
        label: intl.get(`${modelCode}.view.recordState`).d('归档状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ARCHIVING_STATE',
        // defaultValue: 'NON_ARCHIVED',
      },
      {
        name: 'receiptsState',
        label: intl.get(`${modelCode}.view.receiptsState`).d('单据状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
        defaultValue: '0',
      },
      {
        name: 'entryAccountState',
        label: intl.get(`${modelCode}.view.entryAccountState`).d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
        defaultValue: '0',
      },
      {
        name: 'entryAccountDate',
        label: intl.get(`${modelCode}.view.entryAccountDate`).d('入账日期'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'entryPoolDatetime',
        label: intl.get(`${modelCode}.view.entryPoolDatetime`).d('进池时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'entryPoolSource',
        label: intl.get(`${modelCode}.view.entryPoolSource`).d('进池来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.BILL_FROM',
        defaultValue: 'NEW_BILL_POOL',
      },
      // {
      //   name: 'entryPoolSourceIdentify',
      //   label: intl.get(`${modelCode}.view.entryPoolSourceIdentify`).d('进池来源标识'),
      //   type: FieldType.string,
      // },
      {
        name: 'taxBureauManageState',
        label: intl.get(`${modelCode}.view.taxBureauManageState`).d('税局管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
      // {
      //   name: 'inOutType',
      //   label: intl.get(`${modelCode}.view.inOutType`).d('进销项类型'),
      //   type: FieldType.string,
      //   lookupCode: 'HIVP.IN_OUT_TYPE',
      // },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'fileDate',
        label: intl.get(`${modelCode}.view.fileName`).d('档案日期'),
        type: FieldType.dateTime,
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
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('公司税号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNum',
          label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get(`${modelCode}.view.email`).d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'billType',
          label: intl.get(`${modelCode}.view.billType`).d('票据类型'),
          type: FieldType.string,
          lookupCode: 'HIVP.BILL_TYPE',
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.date,
          max: 'invoiceDateTo',
          required: true,
          defaultValue: halfYearStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.date,
          min: 'invoiceDateFrom',
          required: true,
          defaultValue: moment().format(DEFAULT_DATE_FORMAT),
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        // {
        //   name: 'invoiceType',
        //   label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        //   type: FieldType.string,
        //   lookupCode: 'HIVC.INVOICE_TYPE',
        // },
        {
          name: 'ticketCollectorDateFrom',
          label: intl.get(`${modelCode}.view.ticketCollectorDateFrom`).d('收票日期从'),
          type: FieldType.date,
          max: 'ticketCollectorDateTo',
          required: true,
          defaultValue: yearStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorDateTo',
          label: intl.get(`${modelCode}.view.ticketCollectorDateTo`).d('收票日期至'),
          type: FieldType.date,
          min: 'ticketCollectorDateFrom',
          required: true,
          defaultValue: moment().format(DEFAULT_DATE_FORMAT),
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorObj',
          label: intl.get(`${modelCode}.view.ticketCollectorObj`).d('收票员工'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'ticketCollector',
          type: FieldType.number,
          bind: 'ticketCollectorObj.employeeId',
        },
        {
          name: 'entryAccountDateFrom',
          label: intl.get(`${modelCode}.view.entryAccountDateFrom`).d('入账日期从'),
          type: FieldType.date,
          max: 'entryAccountDateTo',
          required: true,
          defaultValue: yearStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDateTo',
          label: intl.get(`${modelCode}.view.entryAccountDateTo`).d('入账日期至'),
          type: FieldType.date,
          min: 'entryAccountDateFrom',
          required: true,
          defaultValue: moment().format(DEFAULT_DATE_FORMAT),
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        // {
        //   name: 'entryPoolSource',
        //   label: intl.get(`${modelCode}.view.entryPoolSource`).d('进池来源'),
        //   type: FieldType.string,
        //   lookupCode: 'HIVP.INVOICE_FROM',
        // },
        {
          name: 'recordState',
          label: intl.get(`${modelCode}.view.recordState`).d('归档状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ARCHIVING_STATE',
        },
        {
          name: 'entryPoolSource',
          label: intl.get(`${modelCode}.view.entryPoolSource`).d('进池来源'),
          type: FieldType.string,
          lookupCode: 'HIVP.BILL_FROM',
        },
        {
          name: 'entryPoolDatetimeFrom',
          label: intl.get(`${modelCode}.view.entryPoolDatetimeFrom`).d('进池日期从'),
          type: FieldType.date,
          max: 'entryPoolDatetimeTo',
          required: true,
          defaultValue: yearStart,
        },
        {
          name: 'entryPoolDatetimeTo',
          label: intl.get(`${modelCode}.view.entryPoolDatetimeTo`).d('进池日期至'),
          type: FieldType.date,
          min: 'entryPoolDatetimeFrom',
          required: true,
          defaultValue: moment().format(DEFAULT_DATE_FORMAT),
          transformRequest: (value) =>
            value && moment(value).endOf('day').format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'salerName',
          label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'amount',
          label: intl.get(`${modelCode}.view.amount`).d('金额'),
          type: FieldType.currency,
        },
        // {
        //   name: 'displayOptions',
        //   label: intl.get(`${modelCode}.view.displayOptions`).d('显示选项'),
        //   type: FieldType.string,
        //   lookupCode: 'HIVP.DISPLAY_OPTIONS',
        //   required: true,
        //   multiple: ',',
        // },
        {
          name: 'invoiceStates',
          label: intl.get(`${modelCode}.view.invoiceStates`).d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
          required: true,
          multiple: ',',
        },
        {
          name: 'entryAccountStates',
          label: intl.get(`${modelCode}.view.entryAccountStates`).d('入账状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ACCOUNT_STATE',
          multiple: ',',
          required: true,
        },
        {
          name: 'receiptsStates',
          label: intl.get(`${modelCode}.view.receiptsStates`).d('单据状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
          multiple: ',',
          required: true,
        },
      ],
    }),
  };
};
