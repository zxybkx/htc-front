/*
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
import commonConfig from '@common/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.invoice-void';

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
      {
        name: 'invoiceVariety',
        type: FieldType.string,
        // required: true,
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== '3',
        },
      },
      {
        name: 'extNumberObj',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.object,
        required: true,
        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== '3',
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
        bind: 'extNumberObj.extNumber',
      },
      {
        name: 'billingType',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'originalBillingType',
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
        label: intl.get(`${modelCode}.view.payeeName`).d('收款人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        required: true,
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== '3',
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
        name: 'issuerNameObj',
        label: intl.get(`${modelCode}.view.issuerName`).d('开票人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        readOnly: true,
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'issuerName',
        label: intl.get(`${modelCode}.view.issuerName`).d('开票人'),
        type: FieldType.string,
        bind: 'issuerNameObj.employeeName',
      },
      {
        name: 'reviewerNameObj',
        label: intl.get(`${modelCode}.view.reviewerName`).d('复核'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) => record.get('billingType') !== '3',
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
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        readOnly: true,
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
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
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
