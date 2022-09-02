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
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/monthly-quarter-annual/query-report`;
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
        name: 'ddlydh',
        label: intl.get('hiop.statisticsTable.view.ddlydh').d('订单来源单号'),
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
        name: 'yinvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('原蓝字代码'),
        type: FieldType.string,
      },
      {
        name: 'yinvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('原蓝字号码'),
        type: FieldType.string,
      },
      {
        name: 'fphsje',
        label: intl.get('hiop.statisticsTable.view.quarterInvoicedAmount').d('发票含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'fpbhsje',
        label: intl.get('hiop.statisticsTable.view.annualInvoicingLimit').d('发票不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'fpse',
        label: intl.get('htc.common.view.taxAmount').d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'ddhsje',
        label: intl.get('hiop.statisticsTable.view.monthlyInvoicingLimit').d('订单含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'ddbhsje',
        label: intl.get('hiop.statisticsTable.view.monthlyInvoicedAmount').d('订单不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'ddse',
        label: intl.get('hiop.statisticsTable.view.quarterInvoicingLimit').d('订单税额'),
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
        name: 'sqdhsje',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'sqdbhsje',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'sqdse',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单税额'),
        type: FieldType.currency,
      },
      {
        name: 'sqdlydh',
        label: intl.get('hiop.statisticsTable.view.sqdlydh').d('申请单来源单号'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'kpsqdh1',
        label: intl.get('hiop.statisticsTable.view.currentTime').d('申请单来源单号1'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'kpsqdh2',
        label: intl.get('hiop.statisticsTable.view.currentTime').d('申请单来源单号2'),
        type: FieldType.string,
        labelWidth: '120',
      },
      {
        name: 'dkplydjh',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('待开票来源单据号'),
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
        name: 'sssqhsje',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('待开票含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'sssqbhsje',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('待开票不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'sssqse',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('待开票税额'),
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
          name: 'tenantId',
          type: FieldType.number,
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
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          readOnly: true,
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
          name: 'invoiceDate',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
          type: FieldType.dateTime,
          required: true,
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          defaultValue: {
            invoiceDateFrom: moment().startOf('day'),
            invoiceDateTo: moment(),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`hivp.bill.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.dateTime,
          bind: 'invoiceDate.invoiceDateFrom',
          // transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`hivp.bill.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.dateTime,
          bind: 'invoiceDate.invoiceDateTo',
          // transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'kpddh',
          label: intl.get('hiop.statisticsTable.view.kpddh').d('开票订单号'),
          type: FieldType.string,
        },
        {
          name: 'ddlydh',
          label: intl.get('hiop.statisticsTable.view.ddlydh').d('订单来源单号'),
          type: FieldType.string,
        },
        {
          name: 'ddlybz',
          label: intl.get('hiop.statisticsTable.view.ddlybz').d('订单来源标识'),
          type: FieldType.string,
          labelWidth: '100',
        },
        {
          name: 'kpsqdh',
          label: intl.get('hiop.statisticsTable.view.kpsqdh').d('开票申请单号'),
          type: FieldType.string,
        },
        {
          name: 'sqdlydh',
          label: intl.get('hiop.statisticsTable.view.sqdlydh').d('申请单来源单号'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'kpsqdh1',
          label: intl.get('hiop.statisticsTable.view.currentTime').d('申请单来源单号1'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'kpsqdh2',
          label: intl.get('hiop.statisticsTable.view.currentTime').d('申请单来源单号2'),
          type: FieldType.string,
          labelWidth: '120',
        },
        {
          name: 'dkpdjh',
          label: intl.get('hiop.statisticsTable.view.currentTime').d('待开票单据号'),
          type: FieldType.string,
        },
        {
          name: 'dkppch',
          label: intl.get('hiop.statisticsTable.view.dkppch').d('待开票批次号'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
