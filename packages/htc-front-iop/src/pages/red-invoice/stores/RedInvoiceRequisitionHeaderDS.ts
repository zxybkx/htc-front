/**
 * @Description: 专票红字申请单DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2021-01-08 21:06:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hiop.redInvoice';

const headerReadOnlyRule = (record) => {
  return !['E', 'R', 'N'].includes(record.get('status')) && record.get('status');
};

export default (dsParams): DataSetProps => {
  const HIOP_API = `${commonConfig.IOP_API}`;
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/${dsParams.headerId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            redInvoiceRequisitionHeaderId: dsParams.headerId,
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
      update: ({ data }) => {
        return {
          url: `${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/saveRedInvoice`,
          data: data[0],
          params: {
            companyCode: dsParams.companyCode,
            employeeNumber: dsParams.employeeNumber,
          },
          method: 'POST',
        };
      },
    },
    paging: false,
    primaryKey: 'redInvoiceRequisitionHeaderId',
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
        name: 'redInvoiceRequisitionHeaderId',
        type: FieldType.number,
      },
      {
        name: 'applicantType',
        label: intl.get(`${modelCode}.view.applicantType`).d('申请方'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLICANT_FOR_RED_REQUISITION',
        defaultValue: '02',
        required: true,
        computedProps: { readOnly: ({ record }) => headerReadOnlyRule(record) },
      },
      {
        name: 'deductionStatus',
        label: intl.get(`${modelCode}.view.deductionStatus`).d('是否抵扣'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.DEDUCTION_STATUS_OF_PURCHASE',
        computedProps: {
          required: ({ record }) => record.get('applicantType') === '01',
          readOnly: ({ record }) =>
            record.get('applicantType') === '02' || headerReadOnlyRule(record),
        },
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司代码'),
        type: FieldType.number,
      },
      {
        name: 'invoiceObj',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
        lovPara: { companyId: dsParams.companyId, companyCode: dsParams.companyCode },
        ignore: FieldIgnore.always,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) ||
            (record.get('applicantType') === '01' && record.get('deductionStatus') === '01'),
          required: ({ record }) => !dsParams.headerId && record.get('deductionStatus') !== '01',
        },
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        // lovCode: 'HIOP.SPECIAL_INVOICE',
        bind: 'invoiceObj.invoiceCode',
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        // lovCode: 'HIOP.SPECIAL_INVOICE',
        bind: 'invoiceObj.invoiceNo',
        readOnly: true,
        computedProps: {
          required: ({ record }) => !dsParams.headerId && record.get('deductionStatus') !== '01',
        },
      },
      {
        name: 'goodsVersion',
        label: intl.get(`${modelCode}.view.goodsVersion`).d('商品编码版本号'),
        type: FieldType.string,
        labelWidth: '100',
        readOnly: true,
      },
      {
        name: 'serialNumber',
        label: intl.get(`${modelCode}.view.infoTableSerialNumber`).d('信息表流水号'),
        type: FieldType.string,
        labelWidth: '100',
        readOnly: true,
      },
      {
        name: 'requisitionReasonObj',
        label: intl.get(`${modelCode}.view.requisitionReason`).d('申请说明'),
        type: FieldType.object,
        lookupCode: 'HIOP.REQUEST_DESCRIPTION',
        textField: 'description',
        valueField: 'description',
        ignore: FieldIgnore.always,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'requisitionReason',
        label: intl.get(`${modelCode}.view.requisitionReason`).d('申请原因'),
        type: FieldType.string,
        bind: 'requisitionReasonObj.description',
        readOnly: true,
      },
      {
        name: 'requisitionDescription',
        label: intl.get(`${modelCode}.view.requisitionReason`).d('申请原因'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxType',
        label: intl.get(`${modelCode}.view.taxType`).d('税种类别'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_TYPE',
        bind: 'taxTypeObj.value',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'redInvoiceDate',
        label: intl.get(`${modelCode}.view.redInvoiceDate`).d('填开时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'uploadEmployeeName',
        label: intl.get(`${modelCode}.view.uploadEmployeeName`).d('申请人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        computedProps: {
          lovPara: () => {
            return { companyId: dsParams.companyId };
          },
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'employeeCode',
        label: intl.get(`${modelCode}.view.uploadEmployeeName`).d('申请人'),
        type: FieldType.string,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        bind: 'uploadEmployeeName.employeeNum',
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.uploadEmployeeName`).d('申请人'),
        type: FieldType.number,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        bind: 'uploadEmployeeName.employeeId',
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.uploadEmployeeName`).d('申请人'),
        type: FieldType.string,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        bind: 'uploadEmployeeName.employeeName',
      },
      {
        name: 'infoType',
        label: intl.get(`${modelCode}.view.infoType`).d('信息表类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INFORMATION_TABLE_TYPE ',
        labelWidth: '100',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'businessTaxMarkCode',
        label: intl.get(`${modelCode}.view.businessTaxMark`).d('营业税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SALES_TAX_MARK',
        bind: 'businessTaxMarkObj.value',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'businessTaxMarkMeaning',
        label: intl.get(`${modelCode}.view.businessTaxMark`).d('营业税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.SALES_TAX_MARK',
      },
      {
        name: 'operateTypeObj',
        label: intl.get(`${modelCode}.view.operateType`).d('操作类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_OPERATION_TYPE',
        ignore: FieldIgnore.always,
        readOnly: true,
      },
      {
        name: 'operateType',
        label: intl.get(`${modelCode}.view.operateType`).d('操作类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_OPERATION_TYPE',
        defaultValue: 0,
        readOnly: true,
      },
      {
        name: 'status',
        label: intl.get(`${modelCode}.view.status`).d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_STATUS',
        readOnly: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('机器编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'extensionNumberObj',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_INFO_EXTENSION',
        lovPara: { companyId: dsParams.companyId, employeeId: dsParams.employeeId },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extensionNumber',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
        type: FieldType.string,
        bind: 'extensionNumberObj.extNumber',
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get(`${modelCode}.view.invoiceTypeCode`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
          required: ({ record }) => record.get('deductionStatus') === '01',
        },
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝票代码'),
        type: FieldType.string,
        lovCode: 'HIOP.SPECIAL_INVOICE',
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
        },
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
        },
      },
      {
        name: 'sellerTaxNo',
        label: intl.get(`${modelCode}.view.sellerTaxNo`).d('销方税号'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => record.get('deductionStatus') !== '01',
        },
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('合计金额'),
        type: FieldType.currency,
        readOnly: true,
        transformRequest: (value) => value && value.toFixed(2),
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
        transformRequest: (value) => value && value.toFixed(2),
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方税号'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
