/**
 * @Description:可抵扣发票统计
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
        const url = `${API_PREFIX}/v1/${tenantId}/deduction-report/query-deduction-report`;
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
    paging: false,
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
        name: 'deductibleCopies',
        label: intl.get('hivp.deductionStatement.view.deductibleCopies').d('可抵扣份数'),
        type: FieldType.string,
      },
      {
        name: 'totalDeductibleInvoiceAmount',
        label: intl
          .get('hivp.deductionStatement.view.totalDeductibleInvoiceAmount')
          .d('可抵扣发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountDeductible',
        label: intl
          .get('hivp.deductionStatement.view.totalValidTaxAmountDeductible')
          .d('可抵扣发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'deductibleShare',
        label: intl.get('hivp.deductionStatement.view.deductibleShare').d('应抵扣份数'),
        type: FieldType.string,
      },
      {
        name: 'totalInvoiceAmountDeducted',
        label: intl
          .get('hivp.deductionStatement.view.totalInvoiceAmountDeducted')
          .d('应抵扣发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountDeducted',
        label: intl
          .get('hivp.deductionStatement.view.totalValidTaxAmountDeducted')
          .d('应抵扣发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'numberOfCopiesChecked',
        label: intl.get('hivp.deductionStatement.view.numberOfCopiesChecked').d('已勾选份数'),
        type: FieldType.string,
      },
      {
        name: 'totalInvoiceAmountChecked',
        label: intl
          .get('hivp.deductionStatement.view.totalInvoiceAmountChecked')
          .d('已勾选发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountChecked',
        label: intl
          .get('hivp.deductionStatement.view.totalValidTaxAmountChecked')
          .d('已勾选发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'numberDeductButNot',
        label: intl.get('hivp.deductionStatement.view.numberDeductButNot').d('应抵未抵发票份数'),
        type: FieldType.string,
      },
      {
        name: 'totalAmountDeductButNot',
        label: intl
          .get('hivp.deductionStatement.view.totalAmountDeductButNot')
          .d('应抵未抵发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalTaxAmountDeductButNot',
        label: intl
          .get('hivp.deductionStatement.view.totalTaxAmountDeductButNot')
          .d('应抵未抵发票有效税额总计'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name }) => {
          if (name === 'systemCodeObj') {
            record.set({
              documentTypeCodeObj: '',
            });
          }
        },
      },
      fields: [
        {
          name: 'entryAccountDate',
          label: intl.get('hivp.bill.view.entryAccountDate').d('入账日期'),
          range: ['entryAccountDateFrom', 'entryAccountDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryAccountDateFrom',
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDateTo',
          type: FieldType.date,
          bind: 'entryAccountDate.entryAccountDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        // {
        //   name: 'docuAssociatedDate',
        //   label: intl.get('htc.common.v').d('单据关联日期'),
        //   range: ['docuAssociatedDateFrom', 'docuAssociatedDateTo'],
        //   type: FieldType.date,
        //   ignore: FieldIgnore.always,
        // },
        // {
        //   name: 'docuAssociatedDateFrom',
        //   type: FieldType.date,
        //   bind: 'docuAssociatedDate.docuAssociatedDateFrom',
        //   transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        // },
        // {
        //   name: 'docuAssociatedDateTo',
        //   type: FieldType.date,
        //   bind: 'docuAssociatedDate.docuAssociatedDateTo',
        //   transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        // },
        {
          name: 'entryAccountState',
          label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
        {
          name: 'salerName',
          label: intl.get('htc.common.view.salerName').d('销方纳税人名称'),
          type: FieldType.string,
        },
        {
          name: 'systemCodeObj',
          label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
          type: FieldType.object,
          lovCode: 'HTC.SOURCE_SYSTEM',
          lovPara: { enabledFlag: 1 },
          multiple: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'systemCode',
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
          disabled: true,
          // cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
          computedProps: {
            lovPara: ({ record }) => {
              return { enabledFlag: 1, docTypeHeaderId: record.get('docTypeHeaderId').join(',') };
            },
            disabled: ({ record }) => {
              return !record.get('docTypeHeaderId').length;
            },
          },
          multiple: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCode',
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
          name: 'invoiceType',
          label: intl.get('htc.common.view.invoiceType').d('发票类型'),
          type: FieldType.string,
          // defaultValue: ['01'],
          multiple: ',',
          lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
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
