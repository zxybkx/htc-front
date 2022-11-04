/*
 * @Description:批量识别查验
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-25 10:52:22
 * @LastEditTime: 2022-07-26 15:04:03
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.batchCheck';

// 发票值
const vatValue = [
  '01',
  '02',
  '03',
  '04',
  '08',
  '10',
  '11',
  '14',
  '15',
  '17',
  '24',
  '30',
  '66',
  '67',
  '80',
];
// 必输受控于票据类型
const requiredByBillType = (record, name) => {
  const billTypeTag = record && record.get('billTypeTag');
  return billTypeTag.includes(name);
};

// 必输受控于发票/票据类型
const requiredByType = (record, name) => {
  const billTypeTag = record && record.get('billTypeTag');
  const invoiceType = record && record.get('invoiceType');
  if (name === 'totalAmount') {
    // 价税合计
    return billTypeTag.includes(name) || invoiceType === '15';
  } else if (vatValue.includes(invoiceType)) {
    return invoiceType !== '15';
  } else {
    return billTypeTag.includes(name);
  }
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoices/get-invoice`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'get',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoices/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoices/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
    },
    primaryKey: 'batchCheckId',
    events: {
      update: ({ record, name }) => {
        const invoiceType = record.get('invoiceType');
        if (
          [
            'invoiceCode',
            'invoiceNumber',
            'invoiceDate',
            'totalAmount',
            'invoiceAmount',
            'checkCode',
          ].includes(name) &&
          vatValue.includes(invoiceType)
        ) {
          record.set('checkStatus', '1');
        }
      },
    },
    fields: [
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司code'),
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'recognitionStatus',
        label: intl.get(`${modelCode}.view.recognitionStatus`).d('识别状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_RECOGNITION_STATE',
      },
      {
        name: 'fileType',
        label: intl.get('hivp.invoicesArchiveUpload.view.fileType').d('文件类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.FILE_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票或票据类型'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIVP.INVIOCE_AND_BILL_TYPE',
      },
      {
        name: 'billTypeTag',
        label: intl.get(`${modelCode}.view.billTypeTag`).d('票据类型标记'),
        type: FieldType.string,
        multiple: ',',
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceNumber',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'fare',
        label: intl.get(`${modelCode}.view.fare`).d('机票票价'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'aviationDevelopmentFund',
        label: intl.get(`${modelCode}.view.aviationDevelopmentFund`).d('民航发展基金'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'fuelSurcharge',
        label: intl.get(`${modelCode}.view.fuelSurcharge`).d('燃油附加费'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'otherTaxes',
        label: intl.get(`${modelCode}.view.otherTaxes`).d('其他税费'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'total',
        label: intl.get(`${modelCode}.view.total`).d('机票总金额'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('不含税金额'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByType(record, name),
        },
      },
      {
        name: 'totalAmount',
        label: intl.get('htc.common.view.totalAmount').d('价税合计'),
        type: FieldType.currency,
        computedProps: {
          required: ({ record, name }) => requiredByType(record, name),
        },
      },
      {
        name: 'buyerName',
        label: intl.get('htc.common.view.buyerName').d('购方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'checkCode',
        label: intl.get('hivp.bill.view.checkCode').d('检验码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => requiredByBillType(record, name),
        },
      },
      {
        name: 'checkStatus',
        label: intl.get(`${modelCode}.view.checkStatus`).d('发票查验状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATUS',
      },
      {
        name: 'ticketCollectorObj',
        label: intl.get(`${modelCode}.view.collectionStaff`).d('收票员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
        textField: 'employeeDesc',
      },
      {
        name: 'ticketCollectorDesc',
        label: intl.get(`${modelCode}.view.collectionStaff`).d('收票员工'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeDesc',
      },
      {
        name: 'receivedEmployeeId',
        type: FieldType.string,
        bind: 'ticketCollectorObj.employeeId',
      },
      {
        name: 'countryCode',
        label: intl.get(`${modelCode}.view.countryCode`).d('国际区号'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.internationalTelCode',
      },
      {
        name: 'employeeIdentify',
        label: intl.get(`${modelCode}.view.employeeIdentify`).d('收票员工标识'),
        type: FieldType.string,
        bind: 'ticketCollectorObj.mobile',
      },
      {
        name: 'returnCode',
        label: intl.get(`${modelCode}.view.returnCode`).d('返回码'),
        type: FieldType.string,
        // lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'returnMsg',
        label: intl.get(`${modelCode}.view.returnMsg`).d('返回信息'),
        type: FieldType.string,
        // lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceStatus',
        label: intl.get(`${modelCode}.view.invoiceStatus`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoicePoolStatus',
        label: intl.get(`${modelCode}.view.invoicePoolStatus`).d('添加至发票/票据池状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ADD_INVOICE/TICKET_POOL_STATUS',
      },
      {
        name: 'batchCode',
        label: intl.get(`${modelCode}.view.batchCode`).d('上传批次号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.string,
      },
      {
        name: 'tabActiveKey',
        type: FieldType.string,
        defaultValue: 'notAdd',
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
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'currentTime',
          label: intl.get(`${modelCode}.view.currentTime`).d('当前日期'),
          type: FieldType.date,
          defaultValue: moment().format(DEFAULT_DATE_FORMAT),
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
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
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'batchCodeObj',
          label: intl.get(`${modelCode}.view.batchCode`).d('上传批次号'),
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'batchCode',
          label: intl.get(`${modelCode}.view.batchCode`).d('上传批次号'),
          type: FieldType.string,
          bind: 'batchCodeObj.value',
        },
        {
          name: 'invoicePoolStatus',
          // label: intl.get(`${modelCode}.view.invoicePoolStatus`).d('添加至发票池、票据池'),
          type: FieldType.string,
          lookupCode: 'HIVP.ADD_INVOICE/TICKET_POOL_STATUS',
          defaultValue: 'N',
        },
        {
          name: 'invoiceCode',
          label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNumber',
          label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
