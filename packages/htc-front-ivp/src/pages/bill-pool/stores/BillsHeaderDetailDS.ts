/*
 * @Description:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 16:29:24
 * @LastEditTime: 2022-07-26 15:38:08
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.bill';

const editAble = record =>
  // !record.get('recordType') &&
  !(
    record.get('recordState') === 'ARCHIVED' ||
    record.get('receiptsState') === '1' ||
    record.get('entryAccountState') === '1'
  );
const amountEditable = record =>
  // !record.get('recordType') &&
  !(
    record.get('recordState') === 'ARCHIVED' ||
    record.get('receiptsState') === '1' ||
    (record.get('entryAccountState') === '1' && record.get('billType') !== 'FLIGHT_ITINERARY')
  );
const flightEditable = record =>
  // !record.get('recordType') &&
  !(
    record.get('recordState') === 'ARCHIVED' ||
    record.get('receiptsState') === '1' ||
    record.get('entryAccountState') === '1'
  ) && record.get('billType') === 'FLIGHT_ITINERARY';

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

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/${dsParams.billPoolHeaderId}`;
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
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    primaryKey: 'billPoolHeaderId',
    events: {
      update: ({ record, name, value }) => {
        const billType = record.get('billType');
        if (name === 'billType') {
          const billTypeData = record && record.getField(name).getLookupData(value);
          record.set({
            billTypeTag: billTypeData && billTypeData.tag,
            taxRate: billTypeData && billTypeData.description,
          });
          getBillAmount(record);
          if (value === 'FLIGHT_ITINERARY') {
            flightAmount(record);
          }
        }
        // 价税合计
        if (name === 'totalAmount' && billType !== 'FLIGHT_ITINERARY') {
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
        type: FieldType.string,
      },
      {
        name: 'companyId',
        label: intl.get('hivp.batchCheck.view.companyId').d('公司ID'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.view.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('票据类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.BILL_TYPE',
        computedProps: { readOnly: ({ record }) => !editAble(record) },
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
        name: 'isInvoiceSeal',
        label: intl.get(`${modelCode}.view.billTypeTag`).d('是否有发票章'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票/客票号码'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'totalAmount',
        label: intl.get('htc.common.view.totalAmount').d('价税合计'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !amountEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !amountEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('税额'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !amountEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'aviationDevelopmentFund',
        label: intl.get(`${modelCode}.view.aviationDevelopmentFund`).d('民航发展基金'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !flightEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'fare',
        label: intl.get(`${modelCode}.view.fare`).d('票价'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !flightEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'fuelSurcharge',
        label: intl.get(`${modelCode}.view.fuelSurcharge`).d('燃油附加费'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !flightEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'otherTaxes',
        label: intl.get(`${modelCode}.view.otherTaxes`).d('其他税费'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !flightEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'total',
        label: intl.get(`${modelCode}.view.totalAmount`).d('发票总金额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !flightEditable(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },

      {
        name: 'drawer',
        label: intl.get(`${modelCode}.view.issuer`).d('开票人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewer',
        label: intl.get(`${modelCode}.view.reviewer`).d('复核人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'salerAddressPhone',
        label: intl.get('htc.common.view.salerAddressPhone').d('销方地址电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerAccount',
        label: intl.get('htc.common.view.salerAccount').d('销方银行账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get('htc.common.view.buyerName').d('购方名称'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.view.buyerTaxNo').d('购方税号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'buyerAddressPhone',
        label: intl.get('htc.common.view.buyerAddressPhone').d('购方地址电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerAccount',
        label: intl.get('htc.common.view.buyerAccount').d('购方银行账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'orderProcessNumber',
        label: intl.get(`${modelCode}.view.orderProcessNumber`).d('订单流水号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'paymentSerialNumber',
        label: intl.get(`${modelCode}.view.paymentSerialNumber`).d('支付流水号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerAccount',
        label: intl.get('htc.common.view.buyerAccount').d('购方银行账号'),
        type: FieldType.string,
        readOnly: true,
      },
      // {
      //   name: 'validTaxAmount',
      //   label: intl.get(`${modelCode}.view.validTaxAmount`).d('有效税额'),
      //   type: FieldType.currency,
      // },
      {
        name: 'platformCode',
        label: intl.get(`${modelCode}.view.platformCode`).d('平台编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'platformName',
        label: intl.get(`${modelCode}.view.platformName`).d('平台名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'entrance',
        label: intl.get(`${modelCode}.view.entrance`).d('始发地/入口'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'destination',
        label: intl.get(`${modelCode}.view.destination`).d('目的地/出口'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'trainAndFlight',
        label: intl.get(`${modelCode}.view.trainAndFlight`).d('车次/航班号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'seatType',
        label: intl.get(`${modelCode}.view.seatType`).d('座位/舱位类型'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => !editAble(record),
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'boardingTime',
        label: intl.get(`${modelCode}.view.boardingTime`).d('上车/乘车时间'),
        type: FieldType.dateTime,
        computedProps: { readOnly: ({ record }) => !editAble(record) },
      },
      {
        name: 'alightingTime',
        label: intl.get(`${modelCode}.view.alightingTime`).d('下车时间'),
        type: FieldType.dateTime,
        computedProps: { readOnly: ({ record }) => !editAble(record) },
      },
      {
        name: 'mileage',
        label: intl.get(`${modelCode}.view.mileage`).d('里程'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标志'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HCAN.ZERO_TAX_RATE_FLAG',
      },
      {
        name: 'electronicPaymentFlag',
        label: intl.get(`${modelCode}.view.electronicPaymentFlag`).d('电子支付标识'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.table.column.remark').d('备注'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
