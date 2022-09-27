/**
 * @Description:已认证发票统计
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
        const url = `${API_PREFIX}/v1/${tenantId}/document-relation/select-relation-document`;
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
    paging: false,
    selection: false,
    primaryKey: 'rulesHeaderId',
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
        multiple: ',',
        lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
      },
      {
        name: 'deductibleCopies',
        label: intl.get('hivp.checkRule').d('可抵扣份数'),
        type: FieldType.string,
      },
      {
        name: 'totalDeductibleInvoiceAmount',
        label: intl.get('hivp.checkRule').d('可抵扣发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountDeductible',
        label: intl.get('hivp.checkRule').d('可抵扣发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'deductibleShare',
        label: intl.get('hivp.checkRule').d('应抵扣份数'),
        type: FieldType.string,
      },
      {
        name: 'totalInvoiceAmountDeducted',
        label: intl.get('hivp.checkRule').d('应抵扣发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountDeducted',
        label: intl.get('hivp.checkRule').d('应抵扣发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'numberOfCopiesChecked',
        label: intl.get('hivp.checkRule').d('已勾选份数'),
        type: FieldType.string,
      },
      {
        name: 'totalInvoiceAmountChecked',
        label: intl.get('hivp.checkRule').d('已勾选发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalValidTaxAmountChecked',
        label: intl.get('hivp.checkRule').d('已勾选发票有效税额总计'),
        type: FieldType.string,
      },
      {
        name: 'numberDeductButNot',
        label: intl.get('hivp.checkRule').d('应抵未抵发票份数'),
        type: FieldType.string,
      },
      {
        name: 'totalAmountDeductButNot',
        label: intl.get('hivp.checkRule').d('应抵未抵发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'totalTaxAmountDeductButNot',
        label: intl.get('hivp.checkRule').d('应抵未抵发票有效税额总计'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        // update: ({ record, name, value }) => {
        //     if (value && name === 'companyObj') {
        //         const { companyCode, employeeNum, employeeName, mobile } = value;
        //         const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
        //         record.set('employeeDesc', employeeDesc);
        //     }
        // },
      },
      fields: [
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
        {
          name: 'docuAssociatedDate',
          label: intl.get('htc.common.v').d('单据关联日期'),
          range: ['docuAssociatedDateFrom', 'docuAssociatedDateTo'],
          type: FieldType.date,
          ignore: FieldIgnore.always,
        },
        {
          name: 'docuAssociatedDateFrom',
          type: FieldType.date,
          bind: 'docuAssociatedDate.invoiceTickDateStart',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'docuAssociatedDateTo',
          type: FieldType.date,
          bind: 'docuAssociatedDate.invoiceTickDateEnd',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountStates',
          label: intl.get('hivp.checkRule').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
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
          name: 'systemCode',
          type: FieldType.string,
          multiple: ',',
          bind: 'systemCodeObj.systemCode',
        },
        {
          name: 'sysTypeHeaderId',
          type: FieldType.string,
          bind: 'systemCodeObj.docTypeHeaderId',
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
              return { enabledFlag: 1, docTypeHeaderId: record.get('sysTypeHeaderId').join(',') };
            },
            disabled: ({ record }) => {
              if (!record.get('sysTypeHeaderId').length) {
                return true;
              } else {
                return false;
              }
            },
          },
          multiple: ',',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentTypeCode',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentTypeCodeObj.documentTypeCode',
        },
        {
          name: 'docTypeHeaderId',
          type: FieldType.string,
          bind: 'documentTypeCodeObj.docTypeHeaderId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceType',
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
