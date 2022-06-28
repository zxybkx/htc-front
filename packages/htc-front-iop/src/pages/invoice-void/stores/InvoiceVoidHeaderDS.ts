/**
 * @Description:发票作废
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 10:01:22
 * @LastEditTime: 2021-2-22 17:07:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSet } from 'choerodon-ui/pro';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28090` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/invoice-void`;
        const axiosConfig: AxiosRequestConfig = {
          // params: {
          //   ...config.data,
          // },
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoiceOverHeaderId',
    selection: false,
    paging: false,
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
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
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== 3,
        },
      },
      {
        name: 'extNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.object,
        required: true,
        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== 3,
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
        bind: 'extNumberObj.extNumber',
      },
      {
        name: 'billingType',
        label: intl.get('hiop.invoiceVoid.modal.billingType').d('作废类型'),
        type: FieldType.number,
        lookupCode: 'HTC.HIOP.INVOICE_VOID_TYPE',
        readOnly: true,
      },
      {
        name: 'originalBillingType',
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
        type: FieldType.string,
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
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
        required: true,
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== 3,
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
        readOnly: true,
        required: true,
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
        label: intl.get('hiop.invoiceVoid.modal.reviewerName').d('复核人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== 3,
        },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'reviewerName',
        label: intl.get('hiop.invoiceVoid.modal.reviewerName').d('复核人'),
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
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
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
