/**
 * @Description:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-12 16:29:24
 * @LastEditTime: 2021-01-28 10:44:06
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.bill';

export default (billPoolHeaderId): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/${billPoolHeaderId}`;
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
    },
    paging: false,
    primaryKey: 'billPoolHeaderId',
    fields: [
      {
        name: 'billPoolHeaderId',
        label: intl.get(`${modelCode}.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      // {
      //   name: 'companyId',
      //   label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
      //   type: FieldType.number,
      // },
      // {
      //   name: 'companyCode',
      //   label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
      //   type: FieldType.string,
      // },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('票据类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.BILL_TYPE',
        readOnly: true,
      },
      // {
      //   name: 'billTypeTag',
      //   label: intl.get(`${modelCode}.view.billTypeTag`).d('票据类型标记'),
      //   type: FieldType.string,
      //   multiple: ',',
      // },
      {
        name: 'isInvoiceSeal',
        label: intl.get(`${modelCode}.view.billTypeTag`).d('是否有发票章'),
        type: FieldType.string,
        readOnly: true,
      },
      // {
      //   name: 'invoiceType',
      //   label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
      //   type: FieldType.string,
      //   lookupCode: 'HIVC.INVOICE_TYPE',
      // },
      // {
      //   name: 'invoiceState',
      //   label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
      //   type: FieldType.string,
      //   lookupCode: 'HMDM.INVOICE_STATE',
      //   dynamicProps: {
      //     required: ({ record }) => record.get('billType') !== 'BLOCK_CHAIN',
      //   },
      //   defaultValue: '0',
      // },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票/客票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.string,
        readOnly: true,
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
        readOnly: true,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
        type: FieldType.string,
        readOnly: true,
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
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.view.buyerTaxNo').d('购方税号'),
        type: FieldType.string,
        readOnly: true,
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
      // {
      //   name: 'buyerAccount',
      //   label: intl.get(`${modelCode}.view.buyerAccount`).d('购方银行账号'),
      //   type: FieldType.string,
      //   readOnly: true,
      // },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('发票税额'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'totalAmount',
        label: intl.get('htc.common.view.totalAmount').d('价税合计'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'aviationDevelopmentFund',
        label: intl.get(`${modelCode}.view.aviationDevelopmentFund`).d('民航发展基金'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'fare',
        label: intl.get(`${modelCode}.view.fare`).d('票价'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'fuelSurcharge',
        label: intl.get(`${modelCode}.view.fuelSurcharge`).d('燃油附加费'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'otherTaxes',
        label: intl.get(`${modelCode}.view.otherTaxes`).d('其他税费'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'total',
        label: intl.get(`${modelCode}.view.total`).d('发票总金额'),
        type: FieldType.currency,
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
        readOnly: true,
      },
      {
        name: 'destination',
        label: intl.get(`${modelCode}.view.destination`).d('目的地/出口'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'trainAndFlight',
        label: intl.get(`${modelCode}.view.trainAndFlight`).d('车次/航班号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'seatType',
        label: intl.get(`${modelCode}.view.seatType`).d('座位/舱位类型'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'boardingTime',
        label: intl.get(`${modelCode}.view.boardingTime`).d('上车/乘车时间'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'alightingTime',
        label: intl.get(`${modelCode}.view.alightingTime`).d('下车时间'),
        type: FieldType.string,
        readOnly: true,
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
        label: intl.get('hzero.common.remark').d('备注'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
