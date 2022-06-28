/**
 * @Description:开票订单头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-10 11:28:22
 * @LastEditTime: 2021-03-04 17:07:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28090` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-headers`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'get',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderHeaderId',
    fields: [
      {
        name: 'invoiceSourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get('hiop.invoiceWorkbench.modal.orderStatus').d('订单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_STATUS',
      },
      {
        name: 'orderProgress',
        label: intl.get('hiop.invoiceWorkbench.modal.orderProgress').d('订单进展'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_PROGRESS',
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
        name: 'billingType',
        label: intl.get('hiop.invoiceWorkbench.modal.billingType').d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceWorkbench.modal.founder').d('创建人'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get('hiop.invoiceWorkbench.modal.creationDate').d('创建时间'),
        type: FieldType.string,
      },
      {
        name: 'submitterName',
        label: intl.get('hiop.invoiceWorkbench.modal.submitterName').d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'submitDate',
        label: intl.get('hiop.invoiceWorkbench.modal.submitDate').d('提交时间'),
        type: FieldType.string,
      },
      {
        name: 'invoiceVariety',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceState',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceState').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
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
        type: FieldType.string,
      },
      {
        name: 'checkNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.checkNumber').d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'totalExcludingTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.excludingTaxAmount').d('合计不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalPriceTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.priceTaxAmount').d('合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalTax',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTax').d('开票合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'buyerTaxpayerNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerTaxpayerNumber').d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerTaxpayerNumber').d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'requestUniqueNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.requestUniqueNumber').d('发票请求流水号'),
        type: FieldType.string,
      },
      {
        name: 'downloadUrl',
        label: intl.get('hiop.invoiceWorkbench.modal.downloadUrl').d('电票版式下载链接'),
        type: FieldType.string,
      },
      {
        name: 'printNum',
        label: intl.get('hiop.invoiceWorkbench.modal.printNum').d('导出打印次数'),
        type: FieldType.number,
      },
      {
        name: 'printFileDownloadUrl',
        label: intl.get('hiop.invoiceWorkbench.modal.printFileDownloadUrl').d('打印文件'),
        type: FieldType.string,
      },
      {
        name: 'dataPermission',
        label: intl.get('hiop.invoiceWorkbench.modal.dataPermission').d('数据权限'),
        type: FieldType.string,
      },
      {
        name: 'invoiceSourceFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceFlag').d('订单来源标识'),
        type: FieldType.string,
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get('hiop.invoiceWorkbench.modal.electronicReceiverInfo').d('电票交付方式'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get('hiop.invoiceWorkbench.modal.receiverName').d('收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.receiverPhone').d('收件电话'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get('hiop.invoiceWorkbench.modal.receiverAddress').d('收件地址'),
        type: FieldType.string,
      },
      {
        name: 'nextDefaultFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.receiveFlag').d('收件默认标识'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceCode').d('蓝字发票代码'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceNo').d('蓝字发票号码'),
        type: FieldType.string,
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.purchaseInvoiceFlag').d('收购标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_MARK',
      },
      {
        name: 'listFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.listFlag').d('清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.remark').d('备注'),
        type: FieldType.string,
      },
      {
        name: 'redMarkReason',
        label: intl.get('hiop.invoiceWorkbench.modal.redMarkReason').d('红冲原因'),
        type: FieldType.string,
      },
      {
        name: 'specialRedMark',
        label: intl.get('hiop.invoiceWorkbench.modal.specialRedMark').d('特殊红冲标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_RED_MARK',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.redInfoSerialNumber').d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'referenceNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.referenceNumber').d('参考编号'),
        type: FieldType.string,
      },
      {
        name: 'exceptionDesc',
        label: intl.get('hiop.invoiceWorkbench.modal.exceptionDesc').d('状态描述'),
        type: FieldType.string,
      },
    ],
    events: {
      selectAll: ({ dataSet }) => {
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ allCheckFlag: 'Y' });
        }
      },
      unSelectAll: ({ dataSet }) => {
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ allCheckFlag: 'N' });
        }
      },
      unSelect: ({ dataSet }) => {
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ allCheckFlag: 'N' });
        }
      },
    },
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
          name: 'companyObj',
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'companyEmployeeName',
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
        {
          name: 'curEmployeeName',
          type: FieldType.string,
          bind: 'companyObj.employeeName',
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'addressPhone',
          label: intl.get('htc.common.modal.addressPhone').d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          readOnly: true,
        },
        {
          name: 'invoiceState',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceState').d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
        },
        {
          name: 'billingType',
          label: intl.get('hiop.invoiceWorkbench.modal.billingType').d('开票类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_TYPE',
        },
        {
          name: 'employeeNameObj',
          label: intl.get('hiop.invoiceWorkbench.modal.founder').d('创建人'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'createNumber',
          type: FieldType.string,
          bind: 'employeeNameObj.employeeNum',
        },
        {
          name: 'employeeName',
          type: FieldType.string,
          bind: 'employeeNameObj.employeeName',
        },
        {
          name: 'invoiceSourceOrder',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
          type: FieldType.string,
        },
        {
          name: 'creatDate',
          label: intl.get('hiop.invoiceWorkbench.modal.creationDate').d('创建时间'),
          type: FieldType.object,
          required: true,
          range: ['creationDate', 'creationDateTo'],
          defaultValue: {
            creationDate: moment().startOf('day'),
            creationDateTo: moment().endOf('day'),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'creationDate',
          type: FieldType.date,
          bind: 'creatDate.creationDate',
        },
        {
          name: 'creationDateTo',
          type: FieldType.date,
          bind: 'creatDate.creationDateTo',
        },
        {
          name: 'submitDates',
          label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('审核时间'),
          type: FieldType.object,
          range: ['submitDate', 'submitDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'submitDate',
          type: FieldType.date,
          bind: 'submitDates.submitDate',
        },
        {
          name: 'submitDateTo',
          type: FieldType.date,
          bind: 'submitDates.submitDateTo',
        },
        {
          name: 'invoiceDates',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
          type: FieldType.object,
          range: ['invoiceDate', 'invoiceDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDate',
          type: FieldType.date,
          bind: 'invoiceDates.invoiceDate',
        },
        {
          name: 'invoiceDateTo',
          type: FieldType.date,
          bind: 'invoiceDates.invoiceDateTo',
        },
        {
          name: 'invoiceVariety',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
        },
        {
          name: 'printFlag',
          label: intl.get('hiop.invoiceWorkbench.modal.printFlag').d('打印状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.PRINT_STATUS',
        },
        {
          name: 'invoiceSourceType',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
        },
        {
          name: 'invoiceSourceFlag',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceFlag').d('订单来源标识'),
          type: FieldType.string,
        },
        {
          name: 'purchaseInvoiceFlag',
          label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.PURCHASE_MARK',
        },
        {
          name: 'orderStatus',
          label: intl.get('hiop.invoiceWorkbench.modal.orderStatus').d('订单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.ORDER_STATUS',
        },
        {
          name: 'buyerName',
          label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'orderNumber',
          label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceAmount',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceAmount').d('开票金额'),
          type: FieldType.currency,
        },
        {
          name: 'sellerName',
          label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
          type: FieldType.string,
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
          name: 'allCheckFlag',
          label: intl.get('hiop.invoiceWorkbench.modal.allCheckFlag').d('是否全选'),
          type: FieldType.string,
          defaultValue: 'N',
        },
      ],
    }),
  };
};
