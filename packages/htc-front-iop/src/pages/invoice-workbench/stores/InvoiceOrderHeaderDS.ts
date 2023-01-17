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
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const tenantId = getCurrentOrganizationId();
/**
 * 只读验证规则
 * @params {object} record-行记录
 */
const headerReadOnlyRule = record => {
  return (
    record.get('readonly') ||
    (record.getPristineValue('billingType') === '2' && record.get('orderStatus') === 'Q')
  );
};

/**
 * 设置默认值
 * @params {object} params-默认发票交付信息参数
 */
const setDefaultInvoiceInfo = (params, record) => {
  defaultInvoiceInfo(params).then(res => {
    if (!isEmpty(res)) {
      record.set({
        paperTicketReceiverName: res.paperTicketReceiverName,
        paperTicketReceiverPhone: res.paperTicketReceiverPhone,
        paperTicketReceiverAddress: res.paperTicketReceiverAddress,
        electronicReceiverInfo: res.electronicReceiverInfo,
        nextDefaultFlag: res.nextDefaultFlag,
      });
    }
  });
};

/**
 * 判断纸票收件人标签是否只读
 * @params {object} record-当前行
 */
const judgePaperReadonly = record => {
  return record.get('readonly') || ['51', '52'].includes(record.get('invoiceVariety'));
};

/**
 * 设置销方/购方信息
 * @params {object} value-当前值
 * @params {object} record-当前行
 * @params {number} type 0-购方 1-销方
 */
const setCustomerInfo = (value, oldValue, record, type, companyId) => {
  if (type === 0) {
    const buyerName = value.enterpriseName || value.buyerName;
    const buyerTaxpayerNumber = value.buyerTaxpayerNumber || value.taxpayerNumber;
    const buyerCompanyAddressPhone = value.businessAddressPhone || value.buyerCompanyAddressPhone;
    const buyerBankNumber = value.corporateBankAccount || value.buyerBankNumber;
    const { buyerCompanyType } = value;
    // 赋值
    record.set({
      buyerName,
      buyerTaxpayerNumber,
      buyerCompanyAddressPhone,
      buyerBankNumber,
      buyerCompanyType,
    });
  } else {
    const sellerName = value.enterpriseName || value.sellerName;
    const sellerTaxpayerNumber = value.sellerTaxpayerNumber || value.taxpayerNumber;
    const sellerCompanyAddressPhone = value.businessAddressPhone || value.sellerCompanyAddressPhone;
    const sellerBankNumber = value.corporateBankAccount || value.sellerBankNumber;
    const { sellerCompanyType } = value;
    // 赋值
    record.set({
      sellerName,
      sellerTaxpayerNumber,
      sellerCompanyAddressPhone,
      sellerBankNumber,
      sellerCompanyType,
    });
  }
  const _buyerName = record.get('buyerName');
  const _sellerName = record.get('sellerName');
  const invoiceVariety = record.get('invoiceVariety');
  if (value !== oldValue && _buyerName && _sellerName && invoiceVariety) {
    // 下次默认
    const params = {
      tenantId,
      companyId,
      invoiceVariety,
      buyerName: _buyerName,
      sellerName: _sellerName,
    };
    setDefaultInvoiceInfo(params, record);
  }
};

const judgeSource = record => {
  return (
    record.get('readonly') ||
    !['MANUAL', 'LEADING_IN', 'ORDER_COPY'].includes(record.get('invoiceSourceType'))
  );
};

/**
 * 形式发票必输验证规则
 */
const proformaRequiredRule = record => {
  return record.get('purchaseInvoiceFlag') === '5';
};
/**
 * 不动产经营租赁必输验证规则
 */
const realestateRequiredRule = record => {
  return record.get('purchaseInvoiceFlag') === '06';
};
/**
 * 建筑服务必输验证规则
 */
const ctnServicesRequiredRule = record => {
  return record.get('purchaseInvoiceFlag') === '22';
};
export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
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
        if (name === 'buyerObj' && value) {
          setCustomerInfo(value, oldValue, record, 0, dsParams.companyId);
        }
        // 销方名称
        if (name === 'sellerObj' && value) {
          setCustomerInfo(value, oldValue, record, 1, dsParams.companyId);
        }
        if (name === 'invoiceTypeObj' && value) {
          console.log(123124);

          const invoiceVariety = value.value;
          if (
            invoiceVariety !== '51' &&
            invoiceVariety !== '52' &&
            invoiceVariety !== '61' &&
            invoiceVariety !== '81' &&
            invoiceVariety !== '82'
          ) {
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

        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        lovPara: { companyId: dsParams.companyId },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) =>
            !['61', '81', '82', '85', '86'].includes(record.get('invoiceVariety')),
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
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) =>
            !['61', '81', '82', '85', '86'].includes(record.get('invoiceVariety')),
        },
      },
      {
        name: 'purchaseInvoiceFlagObj',
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.object,
        lovCode: 'HIOP.ACQUISITION_SIGN',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'purchaseInvoiceFlag',
        type: FieldType.string,
        bind: 'purchaseInvoiceFlagObj.value',
      },
      {
        name: 'purchaseInvoiceFlagMeaning',
        type: FieldType.string,
        bind: 'purchaseInvoiceFlagObj.meaning',
      },
      {
        name: 'invoiceTypeObj',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.INVOICE_VARIETY',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'invoiceVariety',
        type: FieldType.string,
        bind: 'invoiceTypeObj.value',
      },
      {
        name: 'invoiceVarietyMeaning',
        type: FieldType.string,
        bind: 'invoiceTypeObj.meaning',
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
        lookupUrl: `${API_PREFIX}/v1/${tenantId}/billing-info/buyer-info-list`,
        lookupAxiosConfig: config => ({
          ...config,
          params: {
            companyId: dsParams.companyId,
            ...config.params,
          },
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
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceVariety')),
        },
        maxLength: 100,
      },
      {
        name: 'buyerAddress',
        label: intl.get('htc.common.modal.sellerAddress').d('地址'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
        },
        maxLength: 100,
      },
      {
        name: 'buyerPhone',
        label: intl.get('htc.common.modal.sellerPhone').d('电话'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
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
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceVariety')),
        },
        maxLength: 100,
      },
      {
        name: 'buyerOpeanBank',
        label: intl.get('htc.common.modal.buyerOpeanBank').d('开户行'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
        },
        maxLength: 100,
      },
      {
        name: 'buyerBankAccount',
        label: intl.get('htc.common.modal.buyerBankAccount').d('银行账号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '0',
        },
        maxLength: 100,
      },
      {
        name: 'buyerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) => !['61', '81', '82'].includes(record.get('invoiceVariety')),
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
        lookupUrl: `${API_PREFIX}/v1/${tenantId}/billing-info/seller-info-list`,
        lookupAxiosConfig: config => ({
          ...config,
          params: {
            companyId: dsParams.companyId,
            ...config.params,
          },
          method: 'GET',
        }),
        maxLength: 100,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
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
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerAddress',
        label: intl.get('htc.common.modal.sellerAddress').d('地址'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerPhone',
        label: intl.get('htc.common.modal.sellerPhone').d('电话'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerBankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerOpeanBank',
        label: intl.get('htc.common.modal.buyerOpeanBank').d('开户行'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'sellerBankAccount',
        label: intl.get('htc.common.modal.buyerBankAccount').d('银行账号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('purchaseInvoiceFlag') === '1',
        },
        maxLength: 100,
      },
      {
        name: 'loadingPort',
        label: intl.get('hiop.invoiceWorkbench.view.loadingPort').d('交货港'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'destinationPort',
        label: intl.get('hiop.invoiceWorkbench.view.destinationPort').d('目的港'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'bankAddress',
        label: intl.get('hiop.invoiceWorkbench.view.bankAddress').d('收款账户地址'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'swiftCode',
        label: intl.get('hiop.invoiceWorkbench.view.swiftCode').d('收款账户银行代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'termsOfTrade',
        label: intl.get('hiop.invoiceWorkbench.view.termsOfTrade').d('贸易条件'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TERMS_OF_TRADE',
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'typeOfShipping',
        label: intl.get('hiop.invoiceWorkbench.view.typeOfShapping').d('运输方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TYPE_OF_SHIPPING',
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'paymentMethod',
        label: intl.get('hiop.invoiceWorkbench.view.paymentMethod').d('付款方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.PAYMENT_METHOD',
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'shippingDateObj',
        label: intl.get('hiop.invoiceWorkbench.view.shippingDateObj').d('装运期'),
        type: FieldType.date,
        range: ['shippingDateFrom', 'shippingDateTo'],
        ignore: FieldIgnore.always,
        computedProps: {
          required: ({ record }) => proformaRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },

      {
        name: 'houseOrRealEstate',
        label: intl
          .get('hiop.invoiceWorkbench.view.houseOrRealEstate')
          .d('房屋产权证书/不动产权证号码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'realEstateAddress',
        label: intl.get('hiop.invoiceWorkbench.view.realEstateAddress').d('不动产地址'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'realEstateDetailAddress',
        label: intl.get('hiop.invoiceWorkbench.view.realEstateDetailAddress').d('不动产详细地址'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'leaseTermFrom',
        label: intl.get('hiop.invoiceWorkbench.view.leaseTermFrom').d('租赁期起'),
        type: FieldType.date,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        transformResponse: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'leaseTermTo',
        label: intl.get('hiop.invoiceWorkbench.view.leaseTermTo').d('租赁期止'),
        type: FieldType.date,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        transformResponse: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'leaseCrossCitySign',
        label: intl.get('hiop.invoiceWorkbench.view.leaseCrossCitySign').d('跨地市标志'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'areaUnit',
        label: intl.get('hiop.invoiceWorkbench.view.areaUnit').d('面积单位'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.AREA_UNIT',
        computedProps: {
          required: ({ record }) => realestateRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },

      {
        name: 'buildingServicePlace',
        label: intl.get('hiop.invoiceWorkbench.view.buildingServicePlace').d('建筑服务发生地'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => ctnServicesRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'occurDetailAddress',
        label: intl.get('hiop.invoiceWorkbench.view.occurDetailAddress').d('发生地详细地址'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => ctnServicesRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'buildingProjectName',
        label: intl.get('hiop.invoiceWorkbench.view.buildingProjectName').d('建筑项目名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => ctnServicesRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'landVatItemNo',
        label: intl.get('hiop.invoiceWorkbench.view.landVatItemNo').d('土地增值税项目编号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => ctnServicesRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'buildingCrossCitySign',
        label: intl.get('hiop.invoiceWorkbench.view.leaseCrossCitySign').d('跨地市标志'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => ctnServicesRequiredRule(record),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },

      {
        name: 'attentionLine',
        label: intl.get('hiop.invoiceWorkbench.view.attentionLine').d('经办人姓名'),
        type: FieldType.string,
      },
      {
        name: 'operatorIdNumber',
        label: intl.get('hiop.invoiceWorkbench.view.operatorIdNumber').d('经办人证件号码'),
        type: FieldType.string,
      },
      {
        name: 'operatorIdTypeCode',
        label: intl.get('hiop.invoiceWorkbench.view.operatorIdTypeCode').d('经办人证件种类代码'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP_OPERATOR_ID_TYPE_CODE',
      },
      {
        name: 'operatorTaxpayerNumber',
        label: intl
          .get('hiop.invoiceWorkbench.view.operatorTaxpayerNumber')
          .d('经办人纳税人识别号'),
        type: FieldType.string,
      },

      {
        name: 'shippingDateFrom',
        type: FieldType.date,
        bind: 'shippingDateObj.shippingDateFrom',
      },
      {
        name: 'shippingDateTo',
        type: FieldType.date,
        bind: 'shippingDateObj.shippingDateTo',
      },
      {
        name: 'sellerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) => !['61', '81', '82'].includes(record.get('invoiceVariety')),
        },
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.remark').d('备注'),
        // maxLength: 200,
        type: FieldType.string,
      },
      {
        name: 'userRemark',
        label: intl.get('hzero.common.remark').d('备注'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
          maxLength: ({ record }) => (record.get('invoiceVariety') === '41' ? 170 : 230),
        },
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => judgePaperReadonly(record),
          required: ({ record }) =>
            record.get('purchaseInvoiceFlag') === '5' &&
            !['51', '52'].includes(record.get('invoiceVariety')),
        },
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverPhone').d('纸票收件人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        computedProps: {
          readOnly: ({ record }) => judgePaperReadonly(record),
          required: ({ record }) =>
            record.get('purchaseInvoiceFlag') === '5' &&
            !['51', '52'].includes(record.get('invoiceVariety')),
          pattern: ({ record }) => {
            if (record.get('paperTicketReceiverPhone')) {
              if (record.get('paperTicketReceiverPhone').indexOf('-') > -1) {
                return new RegExp(/^\d*[-]\d*$/);
              } else {
                return phoneReg;
              }
            }
          },
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
          readOnly: ({ record }) => judgePaperReadonly(record),
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
          readOnly: ({ record }) =>
            record.get('readonly') || ['61', '81', '82'].includes(record.get('invoiceVariety')),
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
          required: ({ record }) => !['61', '81', '82'].includes(record.get('invoiceVariety')),
          readOnly: ({ record }) =>
            record.get('readonly') || ['61', '81', '82'].includes(record.get('invoiceVariety')),
        },
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
        computedProps: {
          readOnly: ({ record }) => judgeSource(record),
        },
      },
      {
        name: 'invoiceSourceFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.sourceIdentification').d('来源标识'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => judgeSource(record),
        },
      },
      {
        name: 'systemCodeObj',
        label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
        type: FieldType.object,
        lovCode: 'HTC.SOURCE_SYSTEM',
        lovPara: { enabledFlag: 1 },
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'systemCode',
        type: FieldType.string,
        bind: 'systemCodeObj.systemCode',
      },
      {
        name: 'docTypeHeaderId',
        type: FieldType.string,
        bind: 'systemCodeObj.docTypeHeaderId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCodeObj',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.object,
        lovCode: 'HTC.DOCUMENT_TYPE',
        cascadeMap: { docTypeHeaderId: 'docTypeHeaderId' },
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
        lovPara: { enabledFlag: 1 },
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCode',
        type: FieldType.string,
        bind: 'documentTypeCodeObj.documentTypeCode',
      },
    ],
  };
};
