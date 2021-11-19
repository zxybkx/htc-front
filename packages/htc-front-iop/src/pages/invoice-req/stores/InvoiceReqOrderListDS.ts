/*
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-01-19 14:34:44
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.invoice-req';
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
        type: FieldType.number,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
        type: FieldType.string,
      },
      {
        name: 'mobile',
        type: FieldType.string,
      },
      {
        name: 'sourceType',
        label: intl.get(`${modelCode}.view.sourceType`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        readOnly: true,
      },
      {
        name: 'requestNumber',
        label: intl.get(`${modelCode}.view.requestNumber`).d('申请单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        readOnly: true,
      },
      {
        name: 'sourceNumber',
        label: intl.get(`${modelCode}.view.sourceNumber`).d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewDate',
        label: intl.get(`${modelCode}.view.reviewDate`).d('审核时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('合计含税金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'totalTaxAmount',
        label: intl.get(`${modelCode}.view.totalTaxAmount`).d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'requestStatus',
        label: intl.get(`${modelCode}.view.requestStatus`).d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
        readOnly: true,
      },
      {
        name: 'totalQuantity',
        label: intl.get(`${modelCode}.view.totalQuantity`).d('订单数量'),
        type: FieldType.number,
        readOnly: true,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantId',
        label: intl.get(`${modelCode}.view.applicantId`).d('申请人标识'),
        type: FieldType.number,
      },
      {
        name: 'applicantNumber',
        label: intl.get(`${modelCode}.view.applicantNumber`).d('申请人编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantName',
        label: intl.get(`${modelCode}.view.applicantName`).d('申请人'),
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
    primaryKey: 'lineId',
    fields: [
      {
        name: 'lineId',
        type: FieldType.number,
      },
      {
        name: 'headerId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'lineNum',
        label: intl.get(`${modelCode}.view.lineNum`).d('申请单行号'),
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('商品(自行编码)'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get(`${modelCode}.view.specificationModel`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get(`${modelCode}.view.unit`).d('单位'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'price',
        label: intl.get(`${modelCode}.view.price`).d('单价'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get(`${modelCode}.view.taxIncludedFlag`).d('含税标志'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.TAX_MARK',
        defaultValue: '1',
      },
      {
        name: 'amount',
        label: intl.get(`${modelCode}.view.amount`).d('金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'discountAmount',
        label: intl.get(`${modelCode}.view.discountAmount`).d('折扣金额'),
        type: FieldType.currency,
      },
      {
        name: 'deductionAmount',
        label: intl.get(`${modelCode}.view.deductionAmount`).d('扣除额'),
        type: FieldType.currency,
      },
      {
        name: 'sourceNumber3',
        label: intl.get(`${modelCode}.view.sourceNumber3`).d('申请来源单号3'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber4',
        label: intl.get(`${modelCode}.view.sourceNumber4`).d('申请来源单号4'),
        type: FieldType.string,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_RATE',
      },
      {
        name: 'orderHeaderId',
        type: FieldType.number,
      },
      {
        name: 'orderLineId',
        type: FieldType.number,
      },
      {
        name: 'orderNumber',
        label: intl.get(`${modelCode}.view.orderNumber`).d('开票订单号'),
        type: FieldType.string,
      },
      {
        name: 'orderRemark',
        label: intl.get(`${modelCode}.view.orderRemark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get(`${modelCode}.view.orderStatus`).d('开票订单状态'),
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
        name: 'orderExtNumber',
        label: intl.get(`${modelCode}.view.orderExtNumber`).d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitterId',
        label: intl.get(`${modelCode}.view.orderSubmitterId`).d('审核人ID'),
        type: FieldType.number,
      },
      {
        name: 'orderSubmitterNumber',
        label: intl.get(`${modelCode}.view.orderSubmitterNumber`).d('审核人编号'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitterName',
        label: intl.get(`${modelCode}.view.orderSubmitterName`).d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'orderSubmitDate',
        label: intl.get(`${modelCode}.view.orderSubmitDate`).d('提交时间'),
        type: FieldType.string,
      },
      {
        name: 'orderLineNumber',
        label: intl.get(`${modelCode}.view.orderLineNumber`).d('订单行号'),
        type: FieldType.string,
      },
      {
        name: 'orderLineNature',
        label: intl.get(`${modelCode}.view.orderLineNature`).d('行性质类型'),
        lookupCode: 'HIOP.INVOICE_LINE_NATURE',
        type: FieldType.string,
      },
      {
        name: 'orderQuantity',
        label: intl.get(`${modelCode}.view.orderQuantity`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'orderUnitPrice',
        label: intl.get(`${modelCode}.view.orderUnitPrice`).d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'orderAmount',
        label: intl.get(`${modelCode}.view.orderAmount`).d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'orderTaxIncludedFlag',
        label: intl.get(`${modelCode}.view.orderTaxIncludedFlag`).d('含税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'orderTaxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'orderInvoiceCode',
        label: intl.get(`${modelCode}.view.orderInvoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'orderInvoiceNo',
        label: intl.get(`${modelCode}.view.orderInvoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'orderDeduction',
        label: intl.get(`${modelCode}.view.orderDeduction`).d('订单扣除额'),
        type: FieldType.currency,
      },
    ],
  };
};

export { ReqHeaderDS, OrderLinesDS };
