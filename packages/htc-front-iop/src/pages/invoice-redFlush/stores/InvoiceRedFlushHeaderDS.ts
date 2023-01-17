/**
 * @Description:发票红冲
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-30 15:59:22
 * @LastEditTime: 2021-08-26 16:32:34
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

/**
 * 红字信息表编号校验
 * @params {string} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const redInfoSerialNumberValidator = (value, name, record) => {
  if (value && name && record) {
    const validateNumber = new RegExp(/^\d{16}$/);
    if (!validateNumber.test(value)) {
      return Promise.resolve('请输入16位数字');
    }
  }
  return Promise.resolve(true);
};

export default (dsParams): DataSetProps => {
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
          if (['85', '86'].includes(value)) {
            record.set('remark', '');
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
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        type: FieldType.string,
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.redInfoSerialNumber').d('红字信息表编号'),
        type: FieldType.string,
        labelWidth: '120',
        computedProps: {
          readOnly: ({ record }) =>
            (record.get('invoiceVariety') !== '0' && record.get('invoiceVariety') !== '52') ||
            record.get('readonly'),
          required: ({ record }) =>
            ['0', '52', '61', '81', '82', '85', '86'].includes(record.get('invoiceVariety')),
        },
        validator: (value, name, record) => redInfoSerialNumberValidator(value, name, record),
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) =>
            ['0', '41', '52', '61', '81', '82'].includes(record.get('invoiceVariety')),
        },
        required: true,
      },
      {
        name: 'billingType',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'redInvoice',
        label: intl.get('hiop.invoiceRedFlush.modal.redInvoice').d('红冲票据'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerCompanyAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerBankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        readOnly: true,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerCompanyAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerBankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerCompanyType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        readOnly: true,
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
        name: 'issuerName',
        label: intl.get('hiop.invoiceWorkbench.modal.issuerName').d('开票人'),
        type: FieldType.string,
        readOnly: true,
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
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
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
        label: intl.get('hiop.invoiceWorkbench.modal.priceTaxAmount').d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'redMarkReason',
        label: intl.get('hiop.invoiceWorkbench.modal.redMarkReason').d('红冲原因'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.REDREASON',
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
          required: ({ record }) => ['2', '41', '51'].includes(record.get('invoiceVariety')),
        },
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'originalInvoiceDate',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
        type: FieldType.date,
        readOnly: true,
      },
      {
        name: 'originalSourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
        readOnly: true,
      },
      {
        name: 'originalInvoiceSourceOrder',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'specialRedMark',
        label: intl.get('hiop.invoiceWorkbench.modal.specialRedMark').d('特殊红冲标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_RED_MARK',
        readOnly: true,
      },
      {
        name: 'referenceNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.referenceNumber').d('参考编号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('readonly'),
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
        label: intl.get('hiop.invoiceRedFlush.modal.phoneOrEmail').d('手机/邮件'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            ['51', '52', '81', '61', '82'].includes(record.get('invoiceVariety')),
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return phoneReg;
              }
            }
          },
          readOnly: ({ record }) => record.get('readonly'),
        },
      },
      {
        name: 'remark',
        label: intl.get('hiop.invoiceRedFlush.modal.remark').d('发票备注'),
        type: FieldType.string,
        computedProps: {
          maxLength: ({ record }) => (record.get('invoiceVariety') === '41' ? 170 : 230),
        },
      },
    ],
    queryDataSet: new DataSet({
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
          name: 'companyName',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
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
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
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
