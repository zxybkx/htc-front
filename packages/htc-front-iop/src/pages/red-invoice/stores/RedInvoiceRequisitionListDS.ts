/*
 * @Descripttion: 专票红字申请单列表DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-14 09:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hiop.redInvoice';

export default (): DataSetProps => {
  const HIOP_API = `${commonConfig.IOP_API}`;
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
    primaryKey: 'redInvoiceRequisitionHeaderId',
    events: {},
    fields: [
      {
        name: 'serialNumber',
        label: intl.get(`${modelCode}.view.serialNumber`).d('信息表流水号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'redInvoiceRequisitionHeaderId',
        type: FieldType.number,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get(`${modelCode}.view.redInvoiceDate`).d('填开时间'),
        type: FieldType.dateTime,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        required: true,
      },
      {
        name: 'requisitionReason',
        label: intl.get(`${modelCode}.view.requisitionReason`).d('申请说明'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'requisitionDescription',
        label: intl.get(`${modelCode}.view.requisitionDescription`).d('申请原因'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'status',
        label: intl.get(`${modelCode}.view.status`).d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_STATUS',
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('金税盘编号（机器编码）'),
        type: FieldType.string,
      },
      {
        name: 'extensionNumber',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
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
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('申请人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'employeeCode',
        label: intl.get(`${modelCode}.view.employeeCode`).d('申请人代码'),
        type: FieldType.string,
      },
      {
        name: 'uploadEmployeeName',
        label: intl.get(`${modelCode}.view.uploadEmployeeName`).d('上传人'),
        type: FieldType.string,
      },
      {
        name: 'uploadEmployeeId',
        label: intl.get(`${modelCode}.view.uploadEmployeeId`).d('上传人Id'),
        type: FieldType.string,
      },
      {
        name: 'uploadDate',
        label: intl.get(`${modelCode}.view.uploadDate`).d('上传局端时间'),
        type: FieldType.dateTime,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        name: 'businessNoticeNum',
        label: intl.get(`${modelCode}.view.businessNoticeNum`).d('业务通知流水号'),
        type: FieldType.string,
      },
      {
        name: 'resultName',
        label: intl.get(`${modelCode}.view.resultName`).d('税控执行结果'),
        type: FieldType.string,
      },
      {
        name: 'resultCode',
        label: intl.get(`${modelCode}.view.resultCode`).d('税控执行结果编码'),
        type: FieldType.string,
      },
      {
        name: 'errorMessage',
        label: intl.get(`${modelCode}.view.errorMessage`).d('异常信息'),
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
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
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
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNum',
          label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get(`${modelCode}.view.email`).d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'redInvoiceDateFrom',
          label: intl.get(`${modelCode}.view.redInvoiceDateFrom`).d('填开时间从'),
          type: FieldType.dateTime,
          max: 'redInvoiceDateTo',
          // defaultValue: yesterdayStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'redInvoiceDateTo',
          label: intl.get(`${modelCode}.view.redInvoiceDateTo`).d('填开时间至'),
          type: FieldType.dateTime,
          min: 'redInvoiceDateFrom',
          // defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'serialNumber',
          label: intl.get(`${modelCode}.view.serialNumber`).d('信息表流水号'),
          type: FieldType.string,
        },
        {
          name: 'employeeName',
          label: intl.get(`${modelCode}.view.employeeName`).d('申请人'),
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
          label: intl.get(`${modelCode}.view.employeeName`).d('申请人'),
          type: FieldType.string,
          lovCode: 'HMDM.EMPLOYEE_NAME',
          bind: 'employeeName.employeeId',
        },
        {
          name: 'blueInvoiceObj',
          label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝字发票代码'),
          type: FieldType.object,
          lovCode: 'HIOP.SPECIAL_INVOICE',
          computedProps: {
            lovPara: ({ record }) => {
              return { companyId: record.get('companyId') };
            },
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'blueInvoiceCode',
          label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝字发票代码'),
          type: FieldType.string,
          // lovCode: 'HIOP.SPECIAL_INVOICE',
          // bind: 'blueInvoiceObj.invoiceCode',
        },
        {
          name: 'blueInvoiceNo',
          label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝字发票号码'),
          type: FieldType.string,
          lovCode: 'HIOP.SPECIAL_INVOICE',
          bind: 'blueInvoiceObj.invoiceNo',
          // readOnly: true,
        },
        {
          name: 'sellerName',
          label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'status',
          label: intl.get(`${modelCode}.view.status`).d('申请单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.REQUEST_STATUS',
          multiple: ',',
        },
      ],
    }),
  };
};
