/*
 * @Description:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 16:29:24
 * @LastEditTime: 2022-09-02 10:41:09
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { phoneReg } from '@htccommon/utils/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.bill';

// 必输受控于票据类型
const requiredByBillType = (record, name) => {
  const billTypeTag = record && record.get('billTypeTag');
  return billTypeTag.includes(name);
};

// 票价（fare)、aviationDevelopmentFund(民航发展基金)、total(发票总金额)、fuelSurcharge(燃油附加费)、otherTaxes(其他税费)
// 行程单计算
const flightAmount = record => {
  const total = Number(record.get('total')) || 0;
  const fare = Number(record.get('fare')) || 0;
  const aviationDevelopmentFund = Number(record.get('aviationDevelopmentFund')) || 0;
  const fuelSurcharge = Number(record.get('fuelSurcharge')) || 0;
  const otherTaxes = Number(record.get('otherTaxes')) || 0;
  const calTotal = fare + aviationDevelopmentFund + fuelSurcharge + otherTaxes;
  const taxRate = Number(record.get('taxRate')) || 0;
  const totalAmount = total === calTotal ? fare + fuelSurcharge : total - otherTaxes;
  const invoiceAmount = Number(((1000 * totalAmount) / ((1 + taxRate) * 1000)).toFixed(2));
  const taxAmount = ((totalAmount * 100 - invoiceAmount * 100) / 100).toFixed(2);
  record.set({ totalAmount, invoiceAmount, taxAmount });
};

// taxRate(税率)、totalAmount(价税合计)、invoiceAmount(发票金额)、taxAmount(发票税额)
// 金额计算
const getBillAmount = record => {
  const taxRate = Number(record.get('taxRate')) || 0;
  const totalAmount = Number(record.get('totalAmount')) || 0;
  const invoiceAmount = Number(((1000 * totalAmount) / ((1 + taxRate) * 1000)).toFixed(2));
  const taxAmount = ((totalAmount * 100 - invoiceAmount * 100) / 100).toFixed(2);
  record.set({
    invoiceAmount,
    taxAmount,
  });
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const halfYearStart = moment()
    .subtract(6, 'months')
    .startOf('month');
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
      update: ({ record, name, value, dataSet }) => {
        const fn1 = () => {
          const billTypeData = record && record.getField(name).getLookupData(value);
          record.set({
            billTypeTag: billTypeData && billTypeData.tag,
            taxRate: billTypeData && billTypeData.description,
          });
          getBillAmount(record);
          if (value === 'FLIGHT_ITINERARY') {
            flightAmount(record);
          }
        };
        const fn2 = () => {
          // 发票金额
          const totalAmount = Number(record.get('totalAmount')) || 0;
          const invoiceAmount = Number(record.get('invoiceAmount')) || 0;
          const taxAmount = ((totalAmount * 100 - invoiceAmount * 100) / 100).toFixed(2);
          record.set({ taxAmount });
        };
        switch (name) {
          case 'billType':
            fn1();
            break;
          case 'totalAmount':
            // 价税合计
            getBillAmount(record);
            break;
          case 'invoiceAmount':
            fn2();
            break;
          case 'ticketCollectorObj':
            // 收票日期
            record.set('ticketCollectorDate', value ? moment() : '');
            dataSet.submit();
            break;
          default:
            break;
        }
        // 发票税额
        if (name === 'taxAmount') {
          const totalAmount = Number(record.get('totalAmount')) || 0;
          const taxAmount = Number(record.get('taxAmount')) || 0;
          const invoiceAmount = ((totalAmount * 100 - taxAmount * 100) / 100).toFixed(2);
          record.set({ invoiceAmount });
        }
        // 民航发展基金
        if (
          ['aviationDevelopmentFund', 'fare', 'total', 'fuelSurcharge', 'otherTaxes'].includes(name)
        ) {
          flightAmount(record);
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
        label: intl.get('hivp.batchCheck.view.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.modal.companyName').d('公司名称'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
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
        label: intl.get(`${modelCode}.view.ticketTypeTag`).d('票据类型标记'),
        type: FieldType.string,
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceState').d('发票状态'),
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
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
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
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('发票税额'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'totalAmount',
        label: intl.get('htc.common.view.totalAmount').d('价税合计'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        // validator: (value, name, record) =>
        //   new Promise((reject) => reject(amountValidator(value, name, record))),
      },
      {
        name: 'fare',
        label: intl.get(`${modelCode}.view.fare`).d('票价'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
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
        name: 'fuelSurcharge',
        label: intl.get(`${modelCode}.view.fuelSurcharge`).d('燃油附加费'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'otherTaxes',
        label: intl.get(`${modelCode}.view.otherTaxes`).d('其他税费'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'total',
        label: intl.get(`${modelCode}.view.totalAmount`).d('发票总金额'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
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
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方纳税识别号'),
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
        label: intl.get('htc.common.view.buyerName').d('购方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.view.buyerTaxNo').d('购方纳税人识别号'),
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
        label: intl.get('hzero.common.table.column.remark').d('备注'),
        type: FieldType.string,
      },
      {
        name: 'ticketCollectorObj',
        label: intl.get('hivp.batchCheck.view.collectionStaff').d('收票员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
        textField: 'employeeDesc',
      },
      {
        name: 'ticketCollectorDesc',
        label: intl.get('hivp.batchCheck.view.collectionStaff').d('收票员工'),
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
        label: intl.get('hivp.batchCheck.view.countryCode').d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
        },
        bind: 'ticketCollectorObj.internationalTelCode',
      },
      {
        name: 'employeeIdentify',
        label: intl.get('hivp.batchCheck.view.employeeIdentify').d('收票员工标识'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.mobile',
        computedProps: {
          required: ({ record }) => record.get('ticketCollector'),
          pattern: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return phoneReg;
            }
          },
          defaultValidationMessages: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return {
                patternMismatch: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
              };
            }
          },
        },
      },
      {
        name: 'ticketCollectorDate',
        label: intl.get(`${modelCode}.view.ticketCollectorDate`).d('收票日期'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
        label: intl.get('htc.common.view.recordType').d('档案类型'),
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
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
        label: intl.get('hivp.invoicesArchiveUpload.view.fileUrl').d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get('hivp.invoicesArchiveUpload.view.fileName').d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'fileDate',
        label: intl.get(`${modelCode}.view.fileDate`).d('档案日期'),
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
          if (name === 'systemCodeObj') {
            record.set('documentTypeCodeObj', null);
            record.set('documentNumberObj', null);
          }
          if (name === 'documentTypeCodeObj') {
            record.set('documentNumberObj', null);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
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
          label: intl.get('htc.common.view.companyName').d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get('htc.common.view.companyCode').d('公司代码'),
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
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeNum',
          label: intl.get('hivp.batchCheck.view.employeeNum').d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get('hzero.hzeroTheme.page.email').d('邮箱'),
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
          name: 'invoiceDate',
          label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
          type: FieldType.date,
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorDate',
          label: intl.get(`${modelCode}.view.ticketCollectorDate`).d('收票日期'),
          type: FieldType.date,
          range: ['ticketCollectorDateFrom', 'ticketCollectorDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'ticketCollectorDateFrom',
          label: intl.get(`${modelCode}.view.ticketCollectorDateFrom`).d('收票日期从'),
          type: FieldType.date,
          bind: 'ticketCollectorDate.ticketCollectorDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorDateTo',
          label: intl.get(`${modelCode}.view.ticketCollectorDateTo`).d('收票日期至'),
          type: FieldType.date,
          bind: 'ticketCollectorDate.ticketCollectorDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'ticketCollectorObj',
          label: intl.get('hivp.batchCheck.view.collectionStaff').d('收票员工'),
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
          name: 'entryAccountDate',
          label: intl.get(`${modelCode}.view.entryAccountDate`).d('入账日期'),
          type: FieldType.date,
          range: ['entryAccountDateFrom', 'entryAccountDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryAccountDateFrom',
          label: intl.get(`${modelCode}.view.entryAccountDateFrom`).d('入账日期从'),
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDateTo',
          label: intl.get(`${modelCode}.view.entryAccountDateTo`).d('入账日期至'),
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
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
          name: 'entryPoolDatetime',
          label: intl.get(`${modelCode}.view.entryPoolDatetime`).d('进池日期'),
          type: FieldType.date,
          range: ['entryPoolDatetimeFrom', 'entryPoolDatetimeTo'],
          defaultValue: {
            entryPoolDatetimeFrom: halfYearStart,
            entryPoolDatetimeTo: moment().format(DEFAULT_DATE_FORMAT),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryPoolDatetimeFrom',
          label: intl.get(`${modelCode}.view.entryPoolDatetimeFrom`).d('进池日期从'),
          type: FieldType.date,
          bind: 'entryPoolDatetime.entryPoolDatetimeFrom',
        },
        {
          name: 'entryPoolDatetimeTo',
          label: intl.get(`${modelCode}.view.entryPoolDatetimeTo`).d('进池日期至'),
          type: FieldType.date,
          bind: 'entryPoolDatetime.entryPoolDatetimeTo',
          transformRequest: value =>
            value &&
            moment(value)
              .endOf('day')
              .format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'salerName',
          label: intl.get('htc.common.view.salerName').d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get('htc.common.view.buyerName').d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'invoiceCode',
          label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'amount',
          label: intl.get('hivp.bill.view.amountExcludeTax').d('金额（不含税）'),
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
          label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
          multiple: ',',
        },
        {
          name: 'entryAccountStates',
          label: intl.get(`${modelCode}.view.entryAccountState`).d('入账状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ACCOUNT_STATE',
          multiple: ',',
        },
        {
          name: 'receiptsStates',
          label: intl.get(`${modelCode}.view.receiptsState`).d('单据状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
          multiple: ',',
        },
        {
          name: 'systemCodeObj',
          label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
          type: FieldType.object,
          lovCode: 'HTC.SOURCE_SYSTEM',
          lovPara: { enabledFlag: 1 },
          ignore: FieldIgnore.always,
        },
        {
          name: 'systemCode',
          type: FieldType.string,
          bind: 'systemCodeObj.systemCode',
        },
        {
          name: 'sysTypeHeaderId',
          type: FieldType.number,
          bind: 'systemCodeObj.docTypeHeaderId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCodeObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE',
          cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
          lovPara: { enabledFlag: 1 },
          ignore: FieldIgnore.always,
        },
        {
          name: 'docTypeLineId',
          type: FieldType.string,
          bind: 'documentTypeCodeObj.docTypeLineId',
        },
        {
          name: 'docTypeHeaderId',
          type: FieldType.number,
          bind: 'documentTypeCodeObj.docTypeHeaderId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumberObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_CODE',
          cascadeMap: { docTypeHeaderId: 'docTypeHeaderId', docTypeLineId: 'docTypeLineId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumber',
          type: FieldType.string,
          bind: 'documentNumberObj.documentNumber',
        },
      ],
    }),
  };
};
