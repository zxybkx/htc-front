/**
 * @Description: 销项开票关联表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-09-01 14:09
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-association-table/list`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          // params: {
          //   ...config.params,
          //   tenantId,
          // },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'invoiceAssociationTable',
    fields: [
      {
        name: 'companyName',
        label: intl.get('htc.common.label.companyName').d('所属公司'),
        type: FieldType.string,
      },
      {
        name: 'orderNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
        type: FieldType.string,
      },
      {
        name: 'billingType',
        label: intl.get('hiop.invoiceWorkbench.modal.billingType').d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'fullElectricInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.fullElectricInvoiceNo').d('全电发票号码'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
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
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get('hiop.statisticsTable.view.invoiceSourceOrder').d('订单来源单号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceSourceFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceFlag').d('订单来源标识'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票/作废日期'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceCode').d('原蓝字代码'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceNo').d('原蓝字号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceTotalPriceTaxAmount',
        label: intl.get('hiop.statisticsTable.view.quarterInvoicedAmount').d('发票含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceExcludeTaxAmount',
        label: intl.get('hiop.statisticsTable.view.annualInvoicingLimit').d('发票不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceTotalTax',
        label: intl.get('htc.common.view.taxAmount').d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'totalPriceTaxAmount',
        label: intl.get('hiop.statisticsTable.view.totalPriceTaxAmount').d('订单含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalExcludingTaxAmount',
        label: intl.get('hiop.statisticsTable.view.totalExcludingTaxAmount').d('订单不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalTax',
        label: intl.get('hiop.statisticsTable.view.totalTax').d('订单税额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceAmountDifference',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceAmountDifference').d('开票税差'),
        type: FieldType.string,
      },
      {
        name: 'requestNumber',
        label: intl.get('hiop.invoiceReq.modal.requestNumber').d('申请单号'),
        type: FieldType.string,
      },
      // {
      //   name: 'requestStatus',
      //   label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
      //   type: FieldType.string,
      //   lookupCode: 'HIOP.APPLY_STATUS',
      // },
      {
        name: 'requisitionTotalPriceTaxAmount',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'requisitionExcludingTaxAmount',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalAmount',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单税额'),
        type: FieldType.currency,
      },
      {
        name: 'sourceNumber',
        label: intl.get('hiop.statisticsTable.view.sourceNumber').d('申请单来源单号'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'sourceNumber1',
        label: intl.get('hiop.statisticsTable.view.sourceNumber1').d('申请单来源单号1'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'sourceNumber2',
        label: intl.get('hiop.statisticsTable.view.sourceNumber2').d('申请单来源单号2'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'sourceHeadNumber',
        label: intl.get('hiop.invoiceReq.modal.sourceHeadNumber').d('待开票来源单据号'),
        type: FieldType.string,
      },
      {
        name: 'sourceLineNumber',
        label: intl.get('hiop.tobeInvoice.modal.sourceLineNumber').d('来源单据行号'),
        type: FieldType.string,
      },
      // {
      //   name: 'state',
      //   label: intl.get('hiop.redInvoiceInfo.modal.dkphzt').d('待开票行状态'),
      //   type: FieldType.string,
      //   lookupCode: 'HTC.HIOP.TOBE_INVOICED_LINE_STATUS',
      // },
      {
        name: 'prepareTotalPriceTaxAmount',
        label: intl.get('hiop.invoiceReq.modal.prepareTotalPriceTaxAmount').d('待开票含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'prepareExcludingTaxAmount',
        label: intl.get('hiop.invoiceReq.modal.prepareExcludingTaxAmount').d('待开票不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'utaxAmount',
        label: intl.get('hiop.invoiceReq.modal.utaxAmount').d('待开票税额'),
        type: FieldType.currency,
      },
      {
        name: 'batchNo',
        label: intl.get('hiop.tobeInvoice.modal.batchNo').d('待开票批次号'),
        type: FieldType.string,
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
        },
      },
      fields: [
        {
          name: 'tenantObject',
          label: intl.get('htc.common.view.tenantName').d('租户名称'),
          type: FieldType.object,
          lovCode: 'HPFM.TENANT',
          readOnly: true,
          required: true,
          defaultValue: tenantInfo,
          ignore: FieldIgnore.always,
        },
        {
          name: 'organizationId',
          type: FieldType.string,
          bind: `tenantObject.tenantId`,
        },
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'invoiceDate',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
          type: FieldType.dateTime,
          required: true,
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          defaultValue: {
            invoiceDateFrom: moment().startOf('month'),
            invoiceDateTo: moment(),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get('hivp.bill.view.invoiceDateFrom').d('开票日期从'),
          type: FieldType.dateTime,
          bind: 'invoiceDate.invoiceDateFrom',
        },
        {
          name: 'invoiceDateTo',
          label: intl.get('hivp.bill.view.invoiceDateTo').d('开票日期至'),
          type: FieldType.dateTime,
          bind: 'invoiceDate.invoiceDateTo',
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
          name: 'orderNumber',
          label: intl.get('hiop.statisticsTable.view.orderNumber').d('开票订单号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceSourceOrder',
          label: intl.get('hiop.statisticsTable.view.invoiceSourceOrder').d('订单来源单号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceSourceFlag',
          label: intl.get('hiop.statisticsTable.view.invoiceSourceFlag').d('订单来源标识'),
          type: FieldType.string,
          labelWidth: '100',
        },
        {
          name: 'requestNumber',
          label: intl.get('hiop.statisticsTable.view.requestNumber').d('开票申请单号'),
          type: FieldType.string,
        },
        {
          name: 'sourceNumber',
          label: intl.get('hiop.statisticsTable.view.sourceNumber').d('申请单来源单号'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'sourceNumber1',
          label: intl.get('hiop.statisticsTable.view.sourceNumber1').d('申请单来源单号1'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'sourceNumber2',
          label: intl.get('hiop.statisticsTable.view.sourceNumber2').d('申请单来源单号2'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'sourceHeadNumber',
          label: intl.get('hiop.statisticsTable.view.sourceHeadNumber').d('待开票单据号'),
          type: FieldType.string,
        },
        {
          name: 'batchNo',
          label: intl.get('hiop.statisticsTable.view.batchNo').d('待开票批次号'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
