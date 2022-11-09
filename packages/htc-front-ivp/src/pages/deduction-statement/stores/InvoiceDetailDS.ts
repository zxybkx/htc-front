/**
 * @Description:发票明细查看
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import { ActiveKey } from '../list/DeductionStatementListPage';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { activeKey } = config.data;
        const url =
          activeKey === ActiveKey.notDeductibleTable
            ? `${API_PREFIX}/v1/${tenantId}/deduction-report/undeduction-detail`
            : `${API_PREFIX}/v1/${tenantId}/deduction-report/query-invoice-master-info`;
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
    paging: true,
    selection: false,
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('hhtc.common.view.invoiceCode').d('发票代码'),
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
        label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
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
        label: intl.get('hivp.taxRefund.view.validTaxAmount').d('有效税额'),
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
        label: intl.get('hivp.checkCertification.view.checkTime').d('勾选时间'),
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
      autoCreate: true,
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
          name: 'taxpayerNumber',
          type: FieldType.string,
        },
        {
          name: 'checkDate',
          // label: intl.get('htc.common.v').d('勾选日期'),
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
          name: 'authenticationDate',
          // label: intl.get('hivp.checkRule').d('认证所属期'),
          type: FieldType.string,
          lookupCode: '',
        },
        {
          name: 'entryAccountDate',
          // label: intl.get('htc.common.v').d('入账日期'),
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
          // label: intl.get('htc.common.v').d('单据关联日期'),
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
          // label: intl.get('hivp.checkRule').d('入账状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.ACCOUNT_STATE',
        },
        {
          name: 'salerName',
          // label: intl.get('hivp.checkRule').d('销方纳税人名称'),
          type: FieldType.string,
        },
        {
          name: 'systemCodeObj',
          // label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
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
          // label: intl.get('hivp.checkRule.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE_LOV',
          disabled: true,
          // cascadeMap: { docTypeHeaderId: 'sysTypeHeaderId' },
          computedProps: {
            lovPara: ({ record }) => {
              return { enabledFlag: 1, docTypeHeaderId: record.get('sysTypeHeaderId').join(',') };
            },
            disabled: ({ record }) => {
              return !record.get('sysTypeHeaderId').length;
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
          // label: intl.get('hivp.checkRule').d('发票类型'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
        },
        {
          name: 'checkState',
          // label: intl.get('hivp.checkRule').d('勾选状态'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CHECK_STATE',
        },
        {
          name: 'authenticationType',
          // label: intl.get('hivp.checkRule').d('认证类型'),
          type: FieldType.string,
          multiple: ',',
          lookupCode: 'HIVP.CERTIFICATION_TYPE',
        },
      ],
    }),
  };
};
