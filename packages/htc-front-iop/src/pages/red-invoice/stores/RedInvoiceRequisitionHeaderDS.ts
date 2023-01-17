/**
 * @Description: 专票红字申请单DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2021-01-08 21:06:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

/**
 * 只读校验规则
 * @params {object} record-行记录
 * @returns {*[]}
 */
const headerReadOnlyRule = record => {
  return !['E', 'R', 'N'].includes(record.get('status')) && record.get('status');
};

export default (dsParams): DataSetProps => {
  const HIOP_API = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/${dsParams.headerId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            redInvoiceApplyHeaderId: dsParams.headerId,
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      create: ({ data }) => {
        return {
          url: `${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/createRedInvoice`,
          data: data[0],
          params: {
            companyCode: dsParams.companyCode,
            employeeNumber: dsParams.employeeNumber,
          },
          method: 'POST',
        };
      },
      // update: ({ data }) => {
      //   return {
      //     url: `${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/saveRedInvoice`,
      //     data: data[0],
      //     params: {
      //       companyCode: dsParams.companyCode,
      //       employeeNumber: dsParams.employeeNumber,
      //     },
      //     method: 'POST',
      //   };
      // },
    },
    paging: false,
    primaryKey: 'redInvoiceApplyHeaderId',
    events: {
      update: ({ record, name, value }) => {
        if (name === 'requisitionReasonObj' && value) {
          record.set('requisitionDescription', value.meaning);
        } else if (name === 'requisitionReasonObj') {
          record.set('requisitionDescription', '');
        }
        if (name === 'applicantType' && value === '02') {
          record.set('deductionStatus', null);
          record.set('invoiceObj', null);
          record.set('blueInvoiceNo', null);
          record.set('blueInvoiceCode', null);
        }
      },
    },
    fields: [
      {
        name: 'redInvoiceApplyHeaderId',
        type: FieldType.string,
      },
      {
        name: 'applicantType',
        label: intl.get('hiop.redInvoiceInfo.modal.applicantType').d('申请方'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLICANT_FOR_RED_REQUISITION',
        defaultValue: '02',
        readOnly: true,
      },
      {
        name: 'deductionStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.deductionStatus').d('是否抵扣'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.DEDUCTION_STATUS_OF_PURCHASE',
        readOnly: true,
      },
      {
        name: 'employeeNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.employeeNum').d('员工编号'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceObj',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
        lovPara: { companyId: dsParams.companyId, companyCode: dsParams.companyCode },
        ignore: FieldIgnore.always,
        readOnly: true,
      },
      {
        name: 'invoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
        // bind: 'invoiceObj.invoiceCode',
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        // bind: 'invoiceObj.invoiceNo',
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.fullElectricInvoiceNo').d('全电发票号码'),
        type: FieldType.string,
        // bind: 'invoiceObj.invoiceNo',
        readOnly: true,
      },
      {
        name: 'goodsVersion',
        label: intl.get('hiop.redInvoiceInfo.modal.goodsVersion').d('商品编码版本号'),
        type: FieldType.string,
        labelWidth: '100',
        readOnly: true,
      },
      {
        name: 'serialNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.serialNumber').d('信息表流水号'),
        type: FieldType.string,
        labelWidth: '100',
        readOnly: true,
      },
      {
        name: 'requisitionReasonObj',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionDescription').d('申请说明'),
        type: FieldType.object,
        lookupCode: 'HIOP.REQUEST_DESCRIPTION',
        textField: 'description',
        valueField: 'description',
        ignore: FieldIgnore.always,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
        },
      },
      {
        name: 'requisitionReason',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionDescription').d('申请说明'),
        type: FieldType.string,
        bind: 'requisitionReasonObj.description',
        readOnly: true,
      },
      {
        name: 'redMarkReason',
        label: intl.get('hiop.invoiceWorkbench.modal.redMarkReason').d('红冲原因'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.REDREASON',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) =>
            ['61', '81', '82', '85', '86'].includes(record.get('invoiceTypeCode')),
        },
      },
      {
        name: 'requisitionDescription',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionReason').d('申请原因'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxType',
        label: intl.get('hiop.redInvoiceInfo.modal.taxType').d('税种类别'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_TYPE',
        defaultValue: '1',
        readOnly: true,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'uploadEmployeeNameObj',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        computedProps: {
          lovPara: () => {
            return { companyId: dsParams.companyId };
          },
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        required: true,
      },
      {
        name: 'employeeCode',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        bind: 'uploadEmployeeNameObj.employeeNum',
      },
      {
        name: 'employeeId',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        bind: 'uploadEmployeeNameObj.employeeId',
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        bind: 'uploadEmployeeNameObj.employeeName',
      },
      {
        name: 'infoType',
        label: intl.get('hiop.redInvoiceInfo.modal.infoType').d('信息表类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INFORMATION_TABLE_TYPE ',
        labelWidth: '100',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        required: true,
      },
      {
        name: 'businessTaxMarkCode',
        label: intl.get('hiop.redInvoiceInfo.modal.businessTaxMarkCode').d('营业税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SALES_TAX_MARK',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
        },
      },
      {
        name: 'operateType',
        label: intl.get('hiop.redInvoiceInfo.modal.operateType').d('操作类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_OPERATION_TYPE',
        defaultValue: 0,
        readOnly: true,
      },
      {
        name: 'status',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_STATUS',
        readOnly: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.taxDiskNumber').d('机器编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'extensionNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_INFO_EXTENSION',
        lovPara: { companyId: dsParams.companyId, employeeId: dsParams.employeeId },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extensionNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
        bind: 'extensionNumberObj.extNumber',
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        computedProps: {
          // readOnly: ({ record }) => record.get('deductionStatus') !== '01',
          required: ({ record }) => record.get('deductionStatus') === '01',
        },
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.redInvoiceInfo.modal.blueInvoiceCode').d('蓝票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.redInvoiceInfo.modal.blueInvoiceNo').d('蓝票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
        type: FieldType.dateTime,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
          required: ({ record }) => record.get('deductionStatus') !== '01',
        },
        transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
          required: ({ record }) => record.get('deductionStatus') === '01',
        },
      },
      {
        name: 'sellerTaxNo',
        label: intl.get('hiop.redInvoiceInfo.modal.salesTaxNumber').d('销方税号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
          required: ({ record }) => record.get('deductionStatus') === '01',
        },
      },
      {
        name: 'invoiceAmount',
        label: intl.get('hiop.redInvoiceInfo.modal.invoiceAmount').d('合计金额'),
        type: FieldType.currency,
        readOnly: true,
        transformRequest: value => value && value.toFixed(2),
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTaxAmount').d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
        transformRequest: value => value && value.toFixed(2),
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('hiop.redInvoiceInfo.modal.purchasersTaxNumber').d('购方税号'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
