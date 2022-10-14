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
        label: intl.get('hivp.checkRule').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_TYPE',
      },
      {
        name: 'certifiedQuantity',
        label: intl.get('hivp.checkRule').d('已认证份数'),
        type: FieldType.string,
      },
      {
        name: 'certifiedTotalAmount',
        label: intl.get('hivp.checkRule').d('已认证发票金额总计'),
        type: FieldType.string,
      },
      {
        name: 'certifiedTotalValidTaxAmount',
        label: intl.get('hivp.checkRule').d('已认证发票有效税额总计'),
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
        // {
        //   name: 'authenticationDate',
        //   label: intl.get('hivp.checkRule').d('认证所属期'),
        //   type: FieldType.string,
        //   lookupCode: '',
        // },
        {
          name: 'certifiedQueryMonthObj',
          label: intl.get('hivp.checkRule').d('认证所属期'),
          type: FieldType.object,
          lovCode: 'HIVP.BUSINESS_TIME_INFO',
          multiple: ',',
          computedProps: {
            lovPara: () => {
              return { companyId: localStorage.getItem('certifiedCompanyId') };
            },
          },
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
