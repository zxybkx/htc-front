/*
 * @Description:我的发票
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-09-01 17:15:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
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
  const halfYearStart = moment()
    .subtract(6, 'months')
    .startOf('month');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/my-invoice/my-invoice-search`;
        const invoiceStatus = config.data.invoiceStatus ? config.data.invoiceStatus.split(',') : [];
        const isSubmittedFlag = invoiceStatus.includes('1') ? '1' : '0';
        const notSubmittedFlag = invoiceStatus.includes('2') ? '1' : '0';
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          data: {
            ...config.data,
            isSubmittedFlag,
            notSubmittedFlag,
          },
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
        label: intl.get('hivp.bill.view.billPoolHeaderId').d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyId',
        label: intl.get('hivp.batchCheck.view.companyId').d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('hzero.hzeroTheme.page.companyName').d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('公司纳税人识别号'),
        type: FieldType.string,
      },

      {
        name: 'employeeId',
        label: intl.get('hivp.bill.view.employeeId').d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get('hivp.bill').d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        // lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceTypeCode`).d('发票类型代码'),
        type: FieldType.string,
        // lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceTypeTag',
        label: intl.get('hivp.bill.view.invoiceTypeTag').d('发票类型标记'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`htc.common.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`htc.common.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`htc.common.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        required: true,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`htc.common.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`htc.common.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'totalAmount',
        label: intl.get(`htc.common.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'checkCode',
        label: intl.get('hivp.bill.view.checkCode').d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`htc.common.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`htc.common.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.files`).d('档案文件'),
        type: FieldType.string,
      },
      {
        name: 'fileUrl',
        label: intl.get('hivp.invoicesArchiveUpload.view.fileUrl').d('文件URL'),
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
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
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
          name: 'employeeName',
          type: FieldType.string,
          bind: 'companyObj.employeeName',
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'sourceCode',
          label: intl.get(`${modelCode}.view.sourceCode`).d('发票来源'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.INVOICE_SOURCE',
        },
        {
          name: 'invoiceType',
          label: intl.get(`htc.common.view.invoiceType`).d('发票类型'),
          type: FieldType.string,
          lookupCode: 'HIVC.INVOICE_TYPE',
          computedProps: {
            disabled: ({ record }) => !record.get('sourceCode'),
            lookupCode: ({ record }) => {
              const sourceCode = record.get('sourceCode');
              return sourceCode === 'INVOICE_POOL' ? 'HIVC.INVOICE_TYPE' : 'HIVP.BILL_TYPE';
            },
          },
        },
        {
          name: 'invoiceCode',
          label: intl.get(`htc.common.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`htc.common.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceAmount',
          label: intl.get(`htc.common.view.invoiceAmount`).d('发票金额'),
          type: FieldType.number,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`hivp.bill.view.invoiceDateFrom`).d('开票日期从'),
          type: FieldType.date,
          max: 'invoiceDateTo',
          defaultValue: halfYearStart,
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`hivp.bill.view.invoiceDateTo`).d('开票日期至'),
          type: FieldType.date,
          min: 'invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceStatus',
          label: intl.get(`${modelCode}.view.invoiceStatus`).d('报销状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP.REIMBURSEMENT_STATUS',
          multiple: ',',
          defaultValue: ['2'],
        },
        {
          name: 'buyerName',
          label: intl.get(`htc.common.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'salerName',
          label: intl.get(`购方名称.view.salerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'inOutType',
          label: intl.get(`${modelCode}.view.inOutType`).d('发票源自'),
          type: FieldType.string,
          required: true,
          lookupCode: 'HTC.HIOP.INVOICE_FROM',
          defaultValue: 'IN',
        },
      ],
    }),
  };
};
