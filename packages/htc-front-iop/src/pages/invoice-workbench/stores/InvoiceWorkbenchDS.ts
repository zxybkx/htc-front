/*
 * @Description:开票订单头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-10 11:28:22
 * @LastEditTime: 2021-03-04 17:07:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.invoice-workbench';

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
        label: intl.get(`${modelCode}.view.invoiceSourceType`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
      },
      {
        name: 'invoiceSourceOrder',
        label: intl.get(`${modelCode}.view.invoiceSourceOrder`).d('来源单号'),
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get(`${modelCode}.view.orderStatus`).d('订单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_STATUS',
      },
      {
        name: 'orderProgress',
        label: intl.get(`${modelCode}.view.orderProgress`).d('订单进展'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_PROGRESS',
      },
      {
        name: 'orderNumber',
        label: intl.get(`${modelCode}.view.orderNumber`).d('订单号'),
        type: FieldType.string,
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'billingType',
        label: intl.get(`${modelCode}.view.billingType`).d('开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_TYPE',
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('创建人'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.string,
      },
      {
        name: 'submitterName',
        label: intl.get(`${modelCode}.view.submitterName`).d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'submitDate',
        label: intl.get(`${modelCode}.view.submitDate`).d('提交时间'),
        type: FieldType.string,
      },
      {
        name: 'invoiceVariety',
        label: intl.get(`${modelCode}.view.invoiceVariety`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceState',
        label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.string,
      },
      {
        name: 'checkNumber',
        label: intl.get(`${modelCode}.view.checkNumber`).d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'totalExcludingTaxAmount',
        label: intl.get(`${modelCode}.view.totalExcludingTaxAmount`).d('合计不含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalPriceTaxAmount',
        label: intl.get(`${modelCode}.view.totalPriceTaxAmount`).d('合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalTax',
        label: intl.get(`${modelCode}.view.totalTax`).d('开票合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'buyerTaxpayerNumber',
        label: intl.get(`${modelCode}.view.buyerTaxpayerNumber`).d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get(`${modelCode}.view.sellerTaxpayerNumber`).d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'requestUniqueNumber',
        label: intl.get(`${modelCode}.view.requestUniqueNumber`).d('发票请求流水号'),
        type: FieldType.string,
      },
      {
        name: 'downloadUrl',
        label: intl.get(`${modelCode}.view.downloadUrl`).d('电票版式下载链接'),
        type: FieldType.string,
      },
      {
        name: 'printNum',
        label: intl.get(`${modelCode}.view.printNum`).d('导出打印次数'),
        type: FieldType.number,
      },
      {
        name: 'printFileDownloadUrl',
        label: intl.get(`${modelCode}.view.printFileDownloadUrl`).d('打印文件'),
        type: FieldType.string,
      },
      {
        name: 'dataPermission',
        label: intl.get(`${modelCode}.view.dataPermission`).d('数据权限'),
        type: FieldType.string,
      },
      {
        name: 'invoiceSourceFlag',
        label: intl.get(`${modelCode}.view.invoiceSourceFlag`).d('订单来源标识'),
        type: FieldType.string,
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get(`${modelCode}.view.electronicReceiverInfo`).d('电票交付方式'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get(`${modelCode}.view.paperTicketReceiverName`).d('收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get(`${modelCode}.view.paperTicketReceiverPhone`).d('收件电话'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get(`${modelCode}.view.paperTicketReceiverAddress`).d('收件地址'),
        type: FieldType.string,
      },
      {
        name: 'nextDefaultFlag',
        label: intl.get(`${modelCode}.view.nextDefaultFlag`).d('收件默认标识'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝字发票代码'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝字发票号码'),
        type: FieldType.string,
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get(`${modelCode}.view.purchaseInvoiceFlag`).d('收购标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_MARK',
      },
      {
        name: 'listFlag',
        label: intl.get(`${modelCode}.view.listFlag`).d('清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'redMarkReason',
        label: intl.get(`${modelCode}.view.redMarkReason`).d('红冲原因'),
        type: FieldType.string,
      },
      {
        name: 'specialRedMark',
        label: intl.get(`${modelCode}.view.specialRedMark`).d('特殊红冲标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_RED_MARK',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'referenceNumber',
        label: intl.get(`${modelCode}.view.buyerName`).d('参考编号'),
        type: FieldType.string,
      },
      {
        name: 'exceptionDesc',
        label: intl.get(`${modelCode}.view.exceptionDesc`).d('状态描述'),
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
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
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
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
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
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'addressPhone',
          label: intl.get(`${modelCode}.view.addressPhone`).d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          readOnly: true,
        },
        {
          name: 'invoiceState',
          label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
        },
        {
          name: 'billingType',
          label: intl.get(`${modelCode}.view.billingType`).d('开票类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_TYPE',
        },
        {
          name: 'employeeNameObj',
          label: intl.get(`${modelCode}.view.employeeNameObj`).d('创建人'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'createNumber',
          label: intl.get(`${modelCode}.view.employeeName`).d('创建人'),
          type: FieldType.string,
          bind: 'employeeNameObj.employeeNum',
        },
        {
          name: 'employeeName',
          label: intl.get(`${modelCode}.view.employeeName`).d('创建人'),
          type: FieldType.string,
          bind: 'employeeNameObj.employeeName',
        },
        {
          name: 'invoiceSourceOrder',
          label: intl.get(`${modelCode}.view.invoiceSourceOrder`).d('来源单号'),
          type: FieldType.string,
        },
        {
          name: 'creationDate',
          label: intl.get(`${modelCode}.view.creationDate`).d('创建时间从'),
          type: FieldType.date,
          max: 'creationDateTo',
          defaultValue: moment().startOf('day'),
          required: true,
        },
        {
          name: 'creationDateTo',
          label: intl.get(`${modelCode}.view.creationDateTo`).d('创建时间至'),
          type: FieldType.date,
          min: 'creationDate',
          defaultValue: moment().endOf('day'),
          required: true,
        },
        {
          name: 'submitDate',
          label: intl.get(`${modelCode}.view.submitDate`).d('审核时间从'),
          max: 'submitDateTo',
          type: FieldType.date,
        },
        {
          name: 'submitDateTo',
          label: intl.get(`${modelCode}.view.submitDateTo`).d('审核时间至'),
          min: 'submitDate',
          type: FieldType.date,
        },
        {
          name: 'invoiceDate',
          label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期从'),
          max: 'invoiceDateTo',
          type: FieldType.date,
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期至'),
          min: 'invoiceDate',
          type: FieldType.date,
        },
        {
          name: 'invoiceVariety',
          label: intl.get(`${modelCode}.view.invoiceVariety`).d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
        },
        {
          name: 'printFlag',
          label: intl.get(`${modelCode}.view.printFlag`).d('打印状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.PRINT_STATUS',
        },
        {
          name: 'invoiceSourceType',
          label: intl.get(`${modelCode}.view.invoiceSourceType`).d('来源类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_SOURCE_TYPE',
        },
        {
          name: 'invoiceSourceFlag',
          label: intl.get(`${modelCode}.view.invoiceSourceFlag`).d('订单来源标识'),
          type: FieldType.string,
        },
        {
          name: 'purchaseInvoiceFlag',
          label: intl.get(`${modelCode}.view.purchaseInvoiceFlag`).d('业务类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.PURCHASE_MARK',
        },
        {
          name: 'orderStatus',
          label: intl.get(`${modelCode}.view.orderStatus`).d('订单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.ORDER_STATUS',
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'orderNumber',
          label: intl.get(`${modelCode}.view.orderNumber`).d('订单号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceAmount',
          label: intl.get(`${modelCode}.view.invoiceAmount`).d('开票金额'),
          type: FieldType.currency,
        },
        {
          name: 'sellerName',
          label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'allCheckFlag',
          label: intl.get(`${modelCode}.view.allCheckFlag`).d('是否全选'),
          type: FieldType.string,
          defaultValue: 'N',
        },
      ],
    }),
  };
};
