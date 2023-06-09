/**
 * @Description:开票订单头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-4 9:54:22
 * @LastEditTime: 2022-06-13 17:50
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { defaultInvoiceInfo } from '@src/services/invoiceOrderService';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 只读验证规则
 * @params {object} record-行记录
 */
const headerReadOnlyRule = (record) => {
  return (
    record.get('readonly') ||
    (record.getPristineValue('billingType') === '2' && record.get('orderStatus') === 'Q')
  );
};

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { headerId } = config.data;
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/${headerId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderHeaderId',
    events: {
      update: ({ record, name, value, oldValue }) => {
        // 购方名称
        if (name === 'buyerObj') {
          const buyerName = value && (value.enterpriseName || value.buyerName);
          const buyerTaxpayerNumber = value && (value.buyerTaxpayerNumber || value.taxpayerNumber);
          const buyerCompanyAddressPhone =
            value && (value.businessAddressPhone || value.buyerCompanyAddressPhone);
          const buyerBankNumber = value && (value.corporateBankAccount || value.buyerBankNumber);
          const buyerCompanyType = value && value.buyerCompanyType;
          // 赋值
          record.set({
            buyerName,
            buyerTaxpayerNumber,
            buyerCompanyAddressPhone,
            buyerBankNumber,
            buyerCompanyType,
          });
          const sellerName = record.get('sellerName');
          const invoiceVariety = record.get('invoiceVariety');
          if (value !== oldValue && buyerName && sellerName && invoiceVariety) {
            // 下次默认
            const params = {
              tenantId,
              companyId: dsParams.companyId,
              invoiceVariety,
              buyerName,
              sellerName,
            };
            defaultInvoiceInfo(params).then((res) => {
              if (!isEmpty(res)) {
                record.set({
                  paperTicketReceiverName: res.paperTicketReceiverName,
                  paperTicketReceiverPhone: res.paperTicketReceiverPhone,
                  paperTicketReceiverAddress: res.paperTicketReceiverAddress,
                  // deliveryWay: res.deliveryWay,
                  electronicReceiverInfo: res.electronicReceiverInfo,
                  nextDefaultFlag: 1,
                });
              }
            });
          }
        }
        // 销方名称
        if (name === 'sellerObj') {
          const sellerName = value && (value.enterpriseName || value.sellerName);
          const sellerTaxpayerNumber =
            value && (value.sellerTaxpayerNumber || value.taxpayerNumber);
          const sellerCompanyAddressPhone =
            value && (value.businessAddressPhone || value.sellerCompanyAddressPhone);
          const sellerBankNumber = value && (value.corporateBankAccount || value.sellerBankNumber);
          const sellerCompanyType = value && value.sellerCompanyType;
          // 赋值
          record.set({
            sellerName,
            sellerTaxpayerNumber,
            sellerCompanyAddressPhone,
            sellerBankNumber,
            sellerCompanyType,
          });
          const buyerName = record.get('buyerName');
          const invoiceVariety = record.get('invoiceVariety');
          if (value !== oldValue && buyerName && sellerName && invoiceVariety) {
            // 下次默认
            const params = {
              tenantId,
              companyId: dsParams.companyId,
              invoiceVariety,
              buyerName,
              sellerName,
            };
            defaultInvoiceInfo(params).then((res) => {
              if (!isEmpty(res)) {
                record.set({
                  paperTicketReceiverName: res.paperTicketReceiverName,
                  paperTicketReceiverPhone: res.paperTicketReceiverPhone,
                  paperTicketReceiverAddress: res.paperTicketReceiverAddress,
                  // deliveryWay: res.deliveryWay,
                  electronicReceiverInfo: res.electronicReceiverInfo,
                  nextDefaultFlag: 1,
                });
              }
            });
          }
        }
        if (name === 'invoiceVariety') {
          if (value !== '51' && value !== '52') {
            record.set('deliveryWay', '0');
            record.set('electronicReceiverInfo', '');
          } else {
            record.set('deliveryWay', '1');
            record.set('paperTicketReceiverName', '');
            record.set('paperTicketReceiverPhone', '');
            record.set('paperTicketReceiverAddress', '');
          }
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
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        type: FieldType.string,
      },
      {
        name: 'companyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('是否小规模公司'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'extNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.object,
        required: true,
        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        lovPara: { companyId: dsParams.companyId },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extNumber',
        type: FieldType.string,
        bind: 'extNumberObj.extNumber',
      },
      {
        name: 'listFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK ',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        required: true,
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        required: true,
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        required: true,
      },
      {
        name: 'buyerObj',
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
        },
        required: true,
        textField: 'buyerName',
        valueField: 'buyerTaxpayerNumber',
        lookupAxiosConfig: () => ({
          url: `${API_PREFIX}/v1/${tenantId}/billing-info/buyer-info-list?companyId=${dsParams.companyId}`,
          method: 'GET',
        }),
        maxLength: 100,
      },
      {
        name: 'buyerTaxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
          required: ({ record }) =>
            record.get('buyerCompanyType') !== '03' && record.get('buyerCompanyType') !== '04',
        },
        maxLength: 24,
      },
      {
        name: 'buyerCompanyAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
          required: ({ record }) =>
            record.get('invoiceVariety') === '0' || record.get('invoiceVariety') === '52',
        },
        maxLength: 100,
      },
      {
        name: 'buyerBankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
          required: ({ record }) =>
            record.get('invoiceVariety') === '0' || record.get('invoiceVariety') === '52',
        },
        maxLength: 100,
      },
      {
        name: 'buyerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'sellerObj',
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        type: FieldType.string,
        required: true,
        textField: 'sellerName',
        valueField: 'sellerTaxpayerNumber',
        lookupAxiosConfig: () => ({
          url: `${API_PREFIX}/v1/${tenantId}/billing-info/seller-info-list?companyId=${dsParams.companyId}`,
          method: 'GET',
        }),
        maxLength: 100,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
          required: ({ record }) =>
            record.get('buyerCompanyType') !== '02' &&
            record.get('buyerCompanyType') !== '03' &&
            record.get('buyerCompanyType') !== '04',
        },
        maxLength: 24,
      },
      {
        name: 'sellerCompanyAddressPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerBankNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.remark').d('备注'),
        maxLength: 200,
        type: FieldType.string,
      },
      {
        name: 'userRemark',
        label: intl.get('hzero.common.remark').d('备注'),
        type: FieldType.string,
        maxLength: 200,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            record.get('readonly') ||
            record.get('invoiceVariety') === '51' ||
            record.get('invoiceVariety') === '52',
        },
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverPhone').d('纸票收件人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        // defaultValidationMessages: {
        //   patternMismatch: intl
        //     .get('hzero.common.validation.phone')
        //     .d('手机格式不正确'),
        // },
        computedProps: {
          readOnly: ({ record }) =>
            record.get('readonly') ||
            record.get('invoiceVariety') === '51' ||
            record.get('invoiceVariety') === '52',
        },
      },
      {
        name: 'nextDefaultFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.nextDefaultFlag').d('下次默认'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl
          .get('hiop.invoiceWorkbench.modal.paperTicketReceiverAddress')
          .d('纸票收件人地址'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            record.get('readonly') ||
            record.get('invoiceVariety') === '51' ||
            record.get('invoiceVariety') === '52',
        },
      },
      {
        name: 'deliveryWay',
        label: intl.get('hiop.invoiceWorkbench.modal.deliveryWay').d('交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
        readOnly: true,
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get('hiop.invoiceWorkbench.modal.electronicReceiverInfo').d('手机/邮件'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('deliveryWay') === '1',
          readOnly: ({ record }) => record.get('readonly') || record.get('deliveryWay') !== '1',
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return phoneReg;
              }
            }
          },
        },
      },
      {
        name: 'payeeNameObj',
        label: intl.get('hiop.invoiceWorkbench.modal.payeeName').d('收款人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'payeeName',
        label: intl.get('hiop.invoiceWorkbench.modal.payeeName').d('收款人'),
        type: FieldType.string,
        bind: 'payeeNameObj.employeeName',
      },
      {
        name: 'issuerNameObj',
        label: intl.get('hiop.invoiceWorkbench.modal.issuerName').d('开票人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
        // required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'issuerName',
        label: intl.get('hiop.invoiceWorkbench.modal.issuerName').d('开票人'),
        type: FieldType.string,
        bind: 'issuerNameObj.employeeName',
      },
      {
        name: 'reviewerNameObj',
        label: intl.get('hiop.invoiceWorkbench.modal.reviewerName').d('复核'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'reviewerName',
        label: intl.get('hiop.invoiceWorkbench.modal.reviewerName').d('复核'),
        type: FieldType.string,
        bind: 'reviewerNameObj.employeeName',
      },
      {
        name: 'billingType',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('isRedMark') !== 'Y' || record.get('readonly'),
        },
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('isRedMark') !== 'Y' || record.get('readonly'),
        },
      },
      {
        name: 'invoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'totalExcludingTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.excludingTaxAmount').d('合计不含税金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'totalPriceTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.priceTaxAmount').d('合计含税金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'totalTax',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTaxAmount').d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'orderNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'orderStatus',
        label: intl.get('hiop.invoiceWorkbench.modal.orderStatus').d('订单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_STATUS',
        readOnly: true,
      },
      {
        name: 'invoiceSourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
      },
      {
        name: 'orderProgress',
        label: intl.get('hiop.invoiceWorkbench.modal.orderProgress').d('订单进展'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_PROGRESS ',
        readOnly: true,
      },
      {
        name: 'invoiceAmountDifference',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceAmountDifference').d('开票税差'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
