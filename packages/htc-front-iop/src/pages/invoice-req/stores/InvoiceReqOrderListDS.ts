/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-01-19 14:34:44
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const API_PREFIX = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();

const ReqHeaderDS = (): DataSetProps => {
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers/show-order`;
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
    paging: false,
    primaryKey: 'headerId',
    fields: [
      {
        name: 'headerId',
        type: FieldType.string,
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
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        type: FieldType.string,
      },
      {
        name: 'mobile',
        type: FieldType.string,
      },
      {
        name: 'sourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        readOnly: true,
      },
      {
        name: 'requestNumber',
        label: intl.get('hiop.invoiceReq.modal.requestNumber').d('申请单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestType',
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        readOnly: true,
      },
      {
        name: 'sourceNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewDate',
        label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('审核时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'totalAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.priceTaxAmount').d('合计含税金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'totalTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTaxAmount').d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'requestStatus',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
        readOnly: true,
      },
      {
        name: 'totalQuantity',
        label: intl.get('hiop.invoiceReq.modal.orderQuantity').d('订单数量'),
        type: FieldType.number,
        readOnly: true,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceReq.modal.buyerName').d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantId',
        label: intl.get('hiop.invoiceReq.modal.applicantId').d('申请人标识'),
        type: FieldType.string,
      },
      {
        name: 'applicantNumber',
        label: intl.get('hiop.invoiceReq.modal.applicantNumber').d('申请人编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantName',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};

const OrderLinesDS = (): DataSetProps => {
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers/show-order/lines`;
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
    primaryKey: 'orderLineId',
    fields: [
      {
        name: 'orderLineId',
        type: FieldType.string,
      },
      {
        name: 'headerId',
        type: FieldType.string,
      },
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'lineNum',
        label: intl.get('hiop.invoiceReq.modal.lineNum').d('申请单行号'),
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.projectObj').d('商品(自行编码)'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'price',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.invoiceReq.modal.taxIncludedFlag').d('含税标志'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.TAX_MARK',
        defaultValue: '1',
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'discountAmount',
        label: intl.get('hiop.invoiceReq.modal.discountAmount').d('折扣金额'),
        type: FieldType.currency,
      },
      {
        name: 'deductionAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.deduction').d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'sourceNumber3',
        label: intl.get('hiop.invoiceReq.modal.sourceLineNum3').d('申请来源单号3'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber4',
        label: intl.get('hiop.invoiceReq.modal.sourceLineNum4').d('申请来源单号4'),
        type: FieldType.string,
      },
      {
        name: 'taxRate',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_RATE',
      },
      {
        name: 'orderHeaderId',
        type: FieldType.string,
      },
      {
        name: 'orderLineId',
        type: FieldType.string,
      },
      {
        name: 'orderNumber',
        label: intl.get('hiop.invoiceReq.modal.orderNumber').d('开票订单号'),
        type: FieldType.string,
      },
      {
        name: 'orderRemark',
        label: intl.get('hzero.common.remark').d('备注'),
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get('hiop.invoiceReq.modal.orderStatus').d('开票订单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_STATUS',
      },
      {
        name: 'orderProgress',
        label: intl.get('hiop.invoiceReq.modal.orderProgress').d('订单进展'),
        type: FieldType.string,
        lookupCode: 'HIOP.ORDER_PROGRESS',
      },
      {
        name: 'orderExtNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitterId',
        label: intl.get('hiop.invoiceReq.modal.orderSubmitterId').d('审核人ID'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitterNumber',
        label: intl.get('hiop.invoiceReq.modal.orderSubmitterNumber').d('审核人编号'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitterName',
        label: intl.get('hiop.invoiceWorkbench.modal.submitterName').d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitDate',
        label: intl.get('hiop.invoiceWorkbench.modal.submitDate').d('提交时间'),
        type: FieldType.string,
      },
      {
        name: 'orderLineNumber',
        label: intl.get('hiop.invoiceReq.modal.orderLineNumber').d('订单行号'),
        type: FieldType.string,
      },
      {
        name: 'orderLineNature',
        label: intl.get('hiop.invoiceReq.modal.orderLineNature').d('行性质类型'),
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
        type: FieldType.string,
      },
      {
        name: 'orderQuantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'orderUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'orderAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'orderTaxIncludedFlag',
        label: intl.get('hiop.invoiceReq.modal.taxIncludedFlag').d('含税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'orderTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'orderInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'orderInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'orderDeduction',
        label: intl.get('hiop.invoiceReq.modal.orderDeduction').d('订单扣除额'),
        type: FieldType.currency,
      },
    ],
  };
};

export { ReqHeaderDS, OrderLinesDS };
