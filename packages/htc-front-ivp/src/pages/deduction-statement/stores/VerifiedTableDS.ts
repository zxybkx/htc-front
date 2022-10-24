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
        const { dataSet } = config;
        const url = `${API_PREFIX}/v1/${tenantId}/deduction-report/query-certified-report`;
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
        name: 'certifiedQuantity',
        label: intl.get('hivp.deductionStatement.view.certifiedQuantity').d('已认证份数'),
        type: FieldType.string,
      },
      {
        name: 'certifiedTotalAmount',
        label: intl
          .get('hivp.deductionStatement.view.certifiedTotalAmount')
          .d('已认证发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'certifiedTotalValidTaxAmount',
        label: intl
          .get('hivp.deductionStatement.view.certifiedTotalValidTaxAmount')
          .d('已认证发票有效税额总计'),
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
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkDateTo',
          type: FieldType.date,
          bind: 'checkDate.checkDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'certifiedQueryMonthObj',
          label: intl.get('hivp.checkCertification.view.statisticalPeriod').d('认证所属期'),
          type: FieldType.object,
          lovCode: 'HIVP.BUSINESS_TIME_INFO',
          multiple: ',',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'authenticationDate',
          type: FieldType.string,
          multiple: ',',
          bind: 'certifiedQueryMonthObj.currentPeriod',
        },
        {
          name: 'entryAccountState',
          label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
        {
          name: 'salerName',
          label: intl.get('htc.common.view.salerName').d('销方名称'),
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
          type: FieldType.number,
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
