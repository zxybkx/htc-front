/*
 * @Description:发票红冲
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-30 15:59:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { EMAIL, PHONE } from 'utils/regExp';

const modelCode = 'hiop.invoice-redFlush';

const redInfoSerialNumberValidator = (value, name, record) => {
  if (value && name && record) {
    const validateNumber = new RegExp(/^[0-9]{16}$/);
    if (!validateNumber.test(value)) {
      return '请输入16位数字';
    }
  }
  return undefined;
};

export default (dsParams): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28090` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { invoicingOrderHeaderId, invoicingReqHeaderId } = dsParams;
  const params = {
    orderHeaderId: invoicingOrderHeaderId || invoicingReqHeaderId,
    headerId: invoicingReqHeaderId,
  };
  return {
    transport: {
      read: (): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/invoice-reverse`;
        const axiosConfig: AxiosRequestConfig = {
          params: {
            ...params,
          },
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoiceRedFlushId',
    selection: false,
    paging: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'invoiceVariety') {
          if (['51', '52'].includes(value)) {
            record.set('deliveryWay', 1);
          } else {
            record.set('deliveryWay', 0);
            record.set('electronicReceiverInfo', '');
          }
        }
      },
      loadFailed: ({ dataSet }) => {
        dataSet.current!.set({ readonly: true });
      },
    },
    fields: [
      {
        name: 'readonly',
        type: FieldType.boolean,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司id'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('员工号'),
        type: FieldType.string,
      },
      // {
      //   name: 'redInfoSerialObj',
      //   label: intl.get(`${modelCode}.view.redInfoSerialObj`).d('红字信息表编号'),
      //   labelWidth: '120',
      //   type: FieldType.object,
      //   textField: 'redInfoSerialNumber',
      //   lovCode: 'HIOP.RED_INVOICE_INFO',
      //   dynamicProps: {
      //     readOnly: ({ record }) =>
      //       record.get('invoiceVariety') !== '0' && record.get('invoiceVariety') !== '52',
      //     required: ({ record }) =>
      //       record.get('invoiceVariety') === '0' || record.get('invoiceVariety') === '52',
      //   },
      //   ignore: FieldIgnore.always,
      // },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('红字信息表编号'),
        type: FieldType.string,
        labelWidth: '120',
        computedProps: {
          readOnly: ({ record }) =>
            (record.get('invoiceVariety') !== '0' && record.get('invoiceVariety') !== '52') ||
            record.get('readonly'),
          required: ({ record }) =>
            record.get('invoiceVariety') === '0' || record.get('invoiceVariety') === '52',
        },
        validator: (value, name, record) =>
          new Promise((reject) => reject(redInfoSerialNumberValidator(value, name, record))),
      },
      {
        name: 'invoiceVariety',
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'billingType',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxpayerNumber',
        label: intl.get(`${modelCode}.view.buyerTaxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerCompanyAddressPhone',
        label: intl.get(`${modelCode}.view.buyerCompanyAddressPhone`).d('地址、电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerBankNumber',
        label: intl.get(`${modelCode}.view.buyerBankNumber`).d('开户行及账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerCompanyType',
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        readOnly: true,
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get(`${modelCode}.view.sellerTaxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerCompanyAddressPhone',
        label: intl.get(`${modelCode}.view.sellerCompanyAddressPhone`).d('地址、电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerBankNumber',
        label: intl.get(`${modelCode}.view.sellerBankNumber`).d('开户行及账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerCompanyType',
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        readOnly: true,
      },
      {
        name: 'payeeNameObj',
        label: intl.get(`${modelCode}.view.payeeNameObj`).d('收款人'),
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
        label: intl.get(`${modelCode}.view.payeeName`).d('收款人'),
        type: FieldType.string,
        bind: 'payeeNameObj.employeeName',
      },
      {
        name: 'issuerName',
        label: intl.get(`${modelCode}.view.issuerName`).d('开票人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewerNameObj',
        label: intl.get(`${modelCode}.view.reviewerNameObj`).d('复核'),
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
        label: intl.get(`${modelCode}.view.reviewerName`).d('复核'),
        type: FieldType.string,
        bind: 'reviewerNameObj.employeeName',
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'totalPriceTaxAmount',
        label: intl.get(`${modelCode}.view.totalPriceTaxAmount`).d('含税金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'totalTax',
        label: intl.get(`${modelCode}.view.totalTax`).d('税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'redMarkReason',
        label: intl.get(`${modelCode}.view.redMarkReason`).d('红冲原因'),
        type: FieldType.string,
        required: true,
        maxLength: 200,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get(`${modelCode}.view.invoiceSourceOrder`).d('订单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'originalInvoiceDate',
        label: intl.get(`${modelCode}.view.originalInvoiceDate`).d('开票日期'),
        type: FieldType.date,
        readOnly: true,
      },
      {
        name: 'originalSourceType',
        label: intl.get(`${modelCode}.view.originalSourceType`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
        readOnly: true,
      },
      {
        name: 'originalInvoiceSourceOrder',
        label: intl.get(`${modelCode}.view.originalInvoiceSourceOrder`).d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'specialRedMark',
        label: intl.get(`${modelCode}.view.specialRedMark`).d('特殊红冲标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_RED_MARK',
        readOnly: true,
      },
      {
        name: 'referenceNumber',
        label: intl.get(`${modelCode}.view.referenceNumber`).d('参考编号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'deliveryWay',
        label: intl.get(`${modelCode}.view.deliveryWay`).d('交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
        readOnly: true,
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get(`${modelCode}.view.electronicReceiverInfo`).d('手机/邮件'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            // ['0', '2', '41'].includes(record.get('invoiceVarietyCopy')) &&
            ['51', '52'].includes(record.get('invoiceVariety')),
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return PHONE;
              }
            }
          },
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
    ],
    queryDataSet: new DataSet({
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
          name: 'companyName',
          label: intl.get(`${modelCode}.view.companyName`).d('所属公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
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
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'employeeNumber',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
      ],
    }),
  };
};
