/**
 * @Description:抵扣报表明细
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import { AxiosRequestConfig } from 'axios';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { dataSet } = config;
        const url = `${API_PREFIX}/v1/${tenantId}/deduction-report/deduction-detail`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            ...dataSet?.myState,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: true,
    selection: false,
    events: {
      // update: ({ record, name }) => {
      //     if (name === 'systemCodeObj') {
      //         record.set({
      //             documentTypeCodeObj: '',
      //         });
      //     }
      // },
    },
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get('hivp.checkCertification.view.taxAmount').d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'checkState',
        label: intl.get('hivp.checkCertification.view.checkState').d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'authenticationType',
        label: intl.get('hivp.deductionStatement.view.authenticationType').d('勾选类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'reasonsForNonDeduction',
        label: intl.get('hivp.checkCertification.view.reasonsForNonDeduction').d('不抵扣原因'),
        type: FieldType.string,
        lookupCode: 'NO_DEDUCT_REASON',
      },
      {
        name: 'isPoolFlag',
        label: intl.get('hivp.deductionStatement.view.isPoolFlag').d('是否在池'),
        type: FieldType.string,
        lookupCode: 'HTC.HIVP.ISPOOL_FLAG',
      },
      {
        name: 'entryAccountState',
        label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
      {
        name: 'receiptsState',
        label: intl.get('hivp.checkCertification.view.receiptsState').d('单据关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
      },
      {
        name: 'systemName',
        label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.string,
      },
      {
        name: 'documentRemark',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
        type: FieldType.string,
      },
      {
        name: 'documentNumber',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
        type: FieldType.string,
      },
      {
        name: 'authenticationState',
        label: intl.get('hivp.checkCertification.view.authenticationState').d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
      },
      {
        name: 'checkDate',
        label: intl.get('hivp.checkCertification.view.checkDate').d('勾选日期'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'authenticationDate',
        label: intl.get('hivp.checkCertification.view.statisticalPeriod').d('认证所属期'),
        type: FieldType.string,
      },
      {
        name: 'riskLevel',
        label: intl.get('hivp.deductionStatement.view.riskLevel').d('风险等级'),
        type: FieldType.string,
      },
      {
        name: 'recordState',
        label: intl.get('hivp.bill.view.recordState').d('归档状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ARCHIVING_STATE',
      },
      {
        name: 'fileUrl',
        label: intl.get('hivp.deductionStatement.view.fileUrl').d('档案URL'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name }) => {
          if (name === 'systemCodeObj') {
            record.set({
              documentTypeCodeObj: '',
              documentNumberObj: '',
            });
          }
        },
      },
      fields: [
        {
          name: 'invoiceDate',
          label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceTypes',
          label: intl.get('htc.common.view.invoiceType').d('发票类型'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
        },
        {
          name: 'invoiceCode',
          label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'checkStates',
          label: intl.get('hivp.checkCertification.view.checkState').d('勾选状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CHECK_STATE',
        },
        {
          name: 'checkDate',
          label: intl.get('hivp.checkCertification.view.checkDate').d('勾选日期'),
          range: ['checkDateFrom', 'checkDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkDateFrom',
          type: FieldType.date,
          bind: 'checkDate.checkDateFrom',
          max: 'checkDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkDateTo',
          type: FieldType.date,
          bind: 'checkDate.checkDateTo',
          min: 'checkDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'systemCodeObj',
          label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
          type: FieldType.object,
          lovCode: 'HTC.SOURCE_SYSTEM',
          lovPara: { enabledFlag: 1 },
          multiple: ',',
          ignore: FieldIgnore.always,
        },
        {
          name: 'systemCodes',
          type: FieldType.string,
          multiple: ',',
          bind: 'systemCodeObj.systemCode',
        },
        {
          name: 'docTypeHeaderId',
          type: FieldType.string,
          bind: 'systemCodeObj.docTypeHeaderId',
          multiple: ',',
          ignore: FieldIgnore.always,
        },
        {
          name: 'systemName',
          type: FieldType.string,
          bind: 'systemCodeObj.systemName',
          multiple: ',',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCodeObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE_LOV',
          // cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
          computedProps: {
            lovPara: ({ record }) => {
              return { enabledFlag: 1, docTypeHeaderId: record.get('docTypeHeaderId').join(',') };
            },
            disabled: ({ record }) => {
              return !record.get('docTypeHeaderId').length;
            },
          },
          multiple: ',',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCodes',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentTypeCodeObj.documentTypeCode',
        },
        {
          name: 'docTypeLineId',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentTypeCodeObj.docTypeLineId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeMeaning',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentTypeCodeObj.documentTypeMeaning',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumberObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_CODE_LOV',
          multiple: ',',
          computedProps: {
            lovPara: ({ record }) => {
              return {
                enabledFlag: 1,
                docTypeHeaderId: record.get('docTypeHeaderId').join(','),
                docTypeLineId: record.get('docTypeLineId').join(','),
              };
            },
            disabled: ({ record }) => {
              return !record.get('docTypeLineId').length;
            },
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumbers',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentNumberObj.documentNumber',
        },
        {
          name: 'authenticationStates',
          label: intl.get('hivp.checkCertification.view.authenticationState').d('认证状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CERTIFICATION_STATE',
        },
        {
          name: 'authenticationTypes',
          label: intl.get('hivp.deductionStatement.view.authenticationType').d('勾选类型'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CERTIFICATION_TYPE',
        },
        {
          name: 'isInPool',
          label: intl.get('hivp.deductionStatement.view.isPoolFlag').d('是否在池'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HTC.HIVP.ISPOOL_FLAG',
        },
        {
          name: 'entryAccountStates',
          label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
        {
          name: 'receiptsStates',
          label: intl.get('hivp.checkCertification.view.receiptsState').d('单据关联状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
        },
        {
          name: 'companyObj',
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
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
          name: 'employeeNumber',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
      ],
    }),
  };
};
