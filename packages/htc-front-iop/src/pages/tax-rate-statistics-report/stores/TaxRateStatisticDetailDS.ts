/**
 * @Description:分税率统计报表明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-21
 * @LastEditTime: 2022-06-15 10:18
 * @Copyright: Copyright (c) 2022, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { recordInfo } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-points/detail`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          data: recordInfo,
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'taxHeaderId',
    fields: [
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'orderNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
        type: FieldType.string,
      },
      {
        name: 'extNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDatee').d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'hxTotalAmount',
        label: intl
          .get('hiop.taxRateStatistic.modal.invoiceTotalPriceTaxAmount')
          .d('发票价税合计金额'),
        type: FieldType.currency,
      },
      {
        name: 'hxTaxAmount',
        label: intl.get('hiop.taxRateStatistic.modal.invoiceTotalTax').d('发票合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'hxProjectAmount',
        label: intl
          .get('hiop.taxRateStatistic.modal.invoiceExcludeTaxAmount')
          .d('发票合计不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'sellerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'billingType',
        label: intl.get('hiop.invoiceWorkbench.modal.billingType').d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceLineNature',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceLineNature').d('发票行性质'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
      },
      {
        name: 'lineNumber',
        label: intl.get('hcan.invoiceDetail.view.orderSeq').d('行号'),
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.projectObj').d('商品（自行编码）'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'projectUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxRate',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.tobeInvoice.modal.taxIncludedFlag').d('含税标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK ',
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'deduction',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'model',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'projectUnit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.preferentialPolicyFlag').d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.zeroTaxRateFlag').d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
      },
      {
        name: 'specialVatManagement',
        label: intl.get('hiop.invoiceWorkbench.modal.specialVatManagement').d('增值税特殊管理'),
        type: FieldType.string,
      },
      {
        name: 'commodityNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
        type: FieldType.string,
      },
    ],
  };
};
