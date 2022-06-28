/**
 * @Description: 专票红字申请单列表DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-14 09:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

export default (): DataSetProps => {
  const HIOP_API = commonConfig.IOP_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${organizationId}/red-invoice-requisitions`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/cancel`,
          data,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'redInvoiceApplyHeaderId',
    fields: [
      {
        name: 'serialNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.serialNumber').d('信息表流水号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'redInvoiceApplyHeaderId',
        type: FieldType.number,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
        type: FieldType.dateTime,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        required: true,
      },
      {
        name: 'requisitionReason',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionReason').d('申请说明'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'requisitionDescription',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionReason').d('申请原因'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'status',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_STATUS',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.redInfoSerialNumber').d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.TaxDiskNumber').d('金税盘编号（机器编码）'),
        type: FieldType.string,
      },
      {
        name: 'extensionNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
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
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeCode',
        label: intl.get('hiop.redInvoiceInfo.modal.employeeCode').d('申请人代码'),
        type: FieldType.string,
      },
      {
        name: 'uploadEmployeeName',
        label: intl.get('hiop.redInvoiceInfo.modal.uploadEmployeeName').d('上传人'),
        type: FieldType.string,
      },
      {
        name: 'uploadEmployeeId',
        label: intl.get('hiop.redInvoiceInfo.modal.uploadEmployeeId').d('上传人Id'),
        type: FieldType.string,
      },
      {
        name: 'uploadDate',
        label: intl.get('hiop.redInvoiceInfo.modal.uploadDate').d('上传局端时间'),
        type: FieldType.dateTime,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        name: 'businessNoticeNum',
        label: intl.get('hiop.redInvoiceInfo.modal.businessNoticeNum').d('业务通知流水号'),
        type: FieldType.string,
      },
      {
        name: 'resultName',
        label: intl.get('hiop.redInvoiceInfo.modal.resultName').d('税控执行结果'),
        type: FieldType.string,
      },
      {
        name: 'resultCode',
        label: intl.get('hiop.redInvoiceInfo.modal.resultCode').d('税控执行结果编码'),
        type: FieldType.string,
      },
      {
        name: 'errorMessage',
        label: intl.get('hiop.redInvoiceInfo.modal.errorMessage').d('异常信息'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile, taxpayerNumber } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
            record.set('taxpayerNumber', taxpayerNumber);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId: organizationId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get('hiop.redInvoiceInfo.modal.email').d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          readOnly: true,
        },
        {
          name: 'redInvoiceDate',
          label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
          type: FieldType.dateTime,
          range: ['redInvoiceDateFrom', 'redInvoiceDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'redInvoiceDateFrom',
          type: FieldType.dateTime,
          bind: 'redInvoiceDate.redInvoiceDateFrom',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'redInvoiceDateTo',
          type: FieldType.dateTime,
          bind: 'redInvoiceDate.redInvoiceDateTo',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'serialNumber',
          label: intl.get('hiop.redInvoiceInfo.modal.serialNumber').d('信息表流水号'),
          type: FieldType.string,
        },
        {
          name: 'employeeName',
          label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          computedProps: {
            lovPara: ({ record }) => {
              return { companyId: record.get('companyId') };
            },
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
          type: FieldType.string,
          bind: 'employeeName.employeeId',
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
          name: 'sellerName',
          label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'status',
          label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.REQUEST_STATUS',
          multiple: ',',
        },
      ],
    }),
  };
};

const RedInvoiceCreateDS = (): DataSetProps => {
  return {
    events: {
      update: ({ record, name, value }) => {
        if (name === 'applicantType' && value === '02') {
          record.set('deductionStatus', null);
          record.set('invoiceObj', null);
        }
        if (name === 'deductionStatus' && value === '01') {
          record.set('invoiceObj', null);
          record.set('invoiceCode', null);
          record.set('invoiceNo', null);
        }
      },
    },
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.label.companyName').d('所属公司'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'applicantType',
        label: intl.get('hiop.redInvoiceInfo.modal.applicantType').d('申请方'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLICANT_FOR_RED_REQUISITION',
        defaultValue: '02',
        required: true,
      },
      {
        name: 'deductionStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.deductionStatus').d('是否抵扣'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.DEDUCTION_STATUS_OF_PURCHASE',
        computedProps: {
          required: ({ record }) => record.get('applicantType') === '01',
          readOnly: ({ record }) => record.get('applicantType') === '02',
        },
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
        name: 'invoiceObj',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        ignore: FieldIgnore.always,
        computedProps: {
          required: ({ record }) => record.get('deductionStatus') !== '01',
          lovPara: ({ record }) => {
            if (record.get('applicantType') === '02') {
              return { inOutType: 'OUT' };
            } else {
              return { inOutType: record.get('deductionStatus') === '02' ? 'IN' : null };
            }
          },
        },
      },
      {
        name: 'invoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        bind: 'invoiceObj.invoiceCode',
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        bind: 'invoiceObj.invoiceNo',
        readOnly: true,
        computedProps: {
          required: ({ record }) => record.get('deductionStatus') !== '01',
        },
      },
    ],
  };
};

export { RedInvoiceCreateDS };
