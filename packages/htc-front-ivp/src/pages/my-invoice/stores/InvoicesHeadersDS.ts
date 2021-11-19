/*
 * @Descripttion:我的发票
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2021-01-28 17:58:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.myInvoice';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const halfYearStart = moment().subtract(6, 'months').startOf('month');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/my-invoice/my-invoice-search`;
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
    fields: [
      {
        name: 'poolHeaderId',
        label: intl.get(`${modelCode}.view.poolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
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
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('公司纳税人识别号'),
        type: FieldType.string,
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
        name: 'invoiceTypeMeaning',
        label: intl.get(`${modelCode}.view.invoiceTypeMeaning`).d('发票类型'),
        type: FieldType.string,
        // lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型代码'),
        type: FieldType.string,
        // lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceTypeTag',
        label: intl.get(`${modelCode}.view.invoiceTypeTag`).d('发票类型标记'),
        type: FieldType.string,
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
        required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get(`${modelCode}.view.validTaxAmount`).d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('档案文件'),
        type: FieldType.string,
      },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name }) => {
          if (record && name === 'sourceCode') {
            record.set('invoiceType', '');
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
          // defaultValue: dsParams.companyObj,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'employeeName',
          label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
          type: FieldType.string,
          bind: 'companyObj.employeeName',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'inOutType',
          type: FieldType.string,
          defaultValue: 'IN',
        },
        {
          name: 'notSubmittedFlag',
          label: intl.get(`${modelCode}.view.notSubmittedFlag`).d('未报发票'),
          type: FieldType.boolean,
          trueValue: '1',
          falseValue: '0',
          defaultValue: '1',
        },
        {
          name: 'isSubmittedFlag',
          label: intl.get(`${modelCode}.view.isSubmittedFlag`).d('已报发票'),
          type: FieldType.boolean,
          trueValue: '1',
          falseValue: '0',
          defaultValue: '0',
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.date,
          max: 'invoiceDateTo',
          defaultValue: halfYearStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.date,
          min: 'invoiceDateFrom',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'salerName',
          label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'sourceCode',
          label: intl.get(`${modelCode}.view.sourceCode`).d('发票来源'),
          type: FieldType.string,
        },
        {
          name: 'invoiceType',
          label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
          type: FieldType.string,
          lookupCode: 'HIVC.INVOICE_TYPE',
          computedProps: {
            disabled: ({ record }) => !record.get('sourceCode'),
          },
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
          name: 'invoiceAmount',
          label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
          type: FieldType.currency,
        },
      ],
    }),
  };
};
