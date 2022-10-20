/**
 * @Description:不抵扣发票统计
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
        const url = `${API_PREFIX}/v1/${tenantId}/deduction-report/undeduction-all`;
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
        label: intl.get('hivp.checkRule').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_TYPE',
      },
      {
        name: 'checkedInvoiceNumber',
        label: intl.get('hivp.checkRule').d('已勾选份数'),
        type: FieldType.string,
      },
      {
        name: 'checkedInvoiceTotalAmount',
        label: intl.get('hivp.checkRule').d('已勾选发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'checkedInvoiceTotalTaxAmount',
        label: intl.get('hivp.checkRule').d('已勾选发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'checkedInvoiceNumberInPool',
        label: intl.get('hivp.checkRule').d('在池已勾选发票份数'),
        type: FieldType.string,
      },
      {
        name: 'checkedInvoiceTotalAmountInPool',
        label: intl.get('hivp.checkRule').d('在池已勾选发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'checkedInvoiceTotalTaxAmountInPool',
        label: intl.get('hivp.checkRule').d('在池已勾选发票有效税额总计'),
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
          name: 'invoiceDate',
          label: intl.get('htc.common.v').d('开票日期'),
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
          name: 'checkDate',
          label: intl.get('htc.common.v').d('勾选日期'),
          range: ['checkDateFrom', 'checkDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkDateFrom',
          type: FieldType.date,
          bind: 'checkDate.checkDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkDateTo',
          type: FieldType.date,
          bind: 'checkDate.checkDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDate',
          label: intl.get('htc.common.v').d('入账日期'),
          range: ['entryAccountDateFrom', 'entryAccountDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'entryAccountDateFrom',
          type: FieldType.date,
          bind: 'entryAccountDate.invoiceTickDateStart',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountDateTo',
          type: FieldType.date,
          bind: 'entryAccountDate.invoiceTickDateEnd',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        // {
        //   name: 'docuAssociatedDate',
        //   label: intl.get('htc.common.v').d('单据关联日期'),
        //   range: ['documentRelationDateFrom', 'documentRelationDateTo'],
        //   type: FieldType.date,
        //   ignore: FieldIgnore.always,
        // },
        // {
        //   name: 'docuAssociatedDateFrom',
        //   type: FieldType.date,
        //   bind: 'docuAssociatedDate.documentRelationDateFrom',
        //   transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        // },
        // {
        //   name: 'documentRelationDateTo',
        //   type: FieldType.date,
        //   bind: 'docuAssociatedDate.documentRelationDateTo',
        //   transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        // },
        {
          name: 'salerName',
          label: intl.get('hivp.checkRule').d('销方纳税人名称'),
          type: FieldType.string,
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
          label: intl.get('hivp.checkRule.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE_LOV',
          disabled: true,
          // cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
          computedProps: {
            lovPara: ({ record }) => {
              return { enabledFlag: 1, docTypeHeaderId: record.get('docTypeHeaderId').join(',') };
            },
            disabled: ({ record }) => {
              if (record.get('docTypeHeaderId').length) {
                return false;
              } else {
                return true;
              }
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
          name: 'entryAccountStates',
          label: intl.get('hivp.checkRule').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
        {
          name: 'invoiceTypes',
          label: intl.get('hivp.checkRule').d('发票类型'),
          type: FieldType.string,
          // defaultValue: ['01'],
          multiple: ',',
          lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
        },
      ],
    }),
  };
};
