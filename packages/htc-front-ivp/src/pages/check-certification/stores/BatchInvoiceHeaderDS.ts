/**
 * @Description: 批量退税勾选(取消)可确认发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-26 11:01:10
 * @LastEditTime: 2022-07-26 16:14:07
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.taxRefund';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/batch-check/certified-invoice-query`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/batch-check/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
    },
    primaryKey: 'needDownloadKey',
    pageSize: 10,
    fields: [
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.modal.bcbh`).d('批次编号'),
        type: FieldType.string,
      },
      {
        name: 'checkState',
        label: intl.get(`${modelCode}.view.checkState`).d('勾选标志'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'invoiceNum',
        label: intl.get(`${modelCode}.view.invoiceNum`).d('发票份数'),
        type: FieldType.string,
      },
      {
        name: 'totalInvoiceAmountGross',
        label: intl.get(`${modelCode}.view.totalInvoiceAmountGross`).d('合计金额（元）'),
        type: FieldType.currency,
      },
      {
        name: 'totalInvoiceTheAmount',
        label: intl.get(`${modelCode}.view.totalInvoiceTheAmount`).d('合计税额（元）'),
        type: FieldType.currency,
      },
      {
        name: 'checkResource',
        label: intl.get(`${modelCode}.modal.lylx`).d('来源类型'),
        lookupCode: 'HTC.IVP.CHECK_RESOURCE',
        type: FieldType.string,
      },
      {
        name: 'abnormalInvoiceCount',
        label: intl.get(`${modelCode}.view.ycfpyj`).d('异常发票预警'),
        type: FieldType.number,
      },
      {
        name: 'batchNumber',
        label: intl.get(`${modelCode}.modal.qqpch`).d('请求批次号'),
        type: FieldType.string,
      },
      {
        name: 'failCount',
        label: intl.get(`${modelCode}.view.failCount`).d('本次失败份数'),
        type: FieldType.number,
      },
      {
        name: 'taxStatistics',
        label: intl.get('hivp.checkCertification.view.taxselectedAmount').d('本次勾选税额'),
        type: FieldType.currency,
      },
      {
        name: 'failReason',
        label: intl.get('hivp.checkCertification.view.failReason').d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'uploadTime',
        label: intl.get(`${modelCode}.view.sssj`).d('生成时间'),
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        label: intl.get('hiop.redInvoiceInfo.modal.requestTime').d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get('hiop.redInvoiceInfo.modal.completeTime').d('完成时间'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      autoCreate: true,
      events: {
        update: ({ record, name }) => {
          if (name === 'systemCodeObj') {
            record.set('documentTypeCodeObj', null);
            record.set('documentNumberObj', null);
          }
          if (name === 'documentTypeCodeObj') {
            record.set('documentNumberObj', null);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyCode',
          label: intl.get('htc.common.modal.companyCode').d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeNumber',
          label: intl.get('hiop.redInvoiceInfo.modal.employeeNum').d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'authorityCode',
          label: intl.get('hcan.invoiceDetail.view.taxAuthorityCode').d('主管税务机关代码'),
          type: FieldType.string,
        },
        {
          name: 'currentPeriod',
          label: intl.get(`${modelCode}.view.tjyf`).d('当前所属期'),
          type: FieldType.string,
          readOnly: true,
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentOperationalDeadline',
          label: intl.get(`${modelCode}.view.currentOperationalDeadline`).d('当前可操作截止时间'),
          labelWidth: '130',
          type: FieldType.string,
          transformRequest: value => moment(value).format('YYYY-MM-DD'),
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkableTimeRange',
          label: intl.get(`${modelCode}.view.checkableTimeRange`).d('可勾选时间范围'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentCertState',
          label: intl.get('hivp.taxRefund.view.currentCertState').d('当前认证状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentOperationalDeadline',
          label: intl.get(`${modelCode}.view.currentOperationalDeadline`).d('当前操作截止'),
          labelWidth: '130',
          type: FieldType.string,
          transformRequest: value => moment(value).format(DEFAULT_DATE_FORMAT),
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkableTimeRange',
          label: intl.get(`${modelCode}.view.checkableTimeRange`).d('可选时间范围'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'currentCertState',
          label: intl.get(`${modelCode}.view.currentCertState`).d('当前认证状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDate',
          label: intl.get(`htc.common.view.invoiceDate`).d('开票日期'),
          type: FieldType.date,
          range: ['invoiceDateFrom', 'invoiceDateEnd'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get('hivp.bill.view.invoiceDateFrom').d('开票日期从'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateEnd',
          label: intl.get('hivp.bill.view.invoiceDateTo').d('开票日期至'),
          type: FieldType.date,
          bind: 'invoiceDate.invoiceDateEnd',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'entryAccountState',
          label: intl.get('hivp.bill.view.entryAccountState').d('入账状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.ACCOUNT_STATE',
          multiple: ',',
        },
        {
          name: 'entryAccountDate',
          label: intl.get('htc.common.view.entryAccountDate').d('入账日期'),
          type: FieldType.date,
          range: ['entryAccountDateFrom', 'entryAccountDateTo'],
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
        {
          name: 'systemCodeShare',
          label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
          type: FieldType.string,
          lookupCode: 'HTC.SOURCE_SYSTEM_SHARE',
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
          multiple: ',',
          bind: 'systemCodeObj.docTypeHeaderId',
        },
        {
          name: 'documentTypeCodeShare',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.string,
          lookupCode: 'HTC.DOCUMENT_TYPE_SHARE_LOV',
        },
        {
          name: 'documentTypeCodeObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_TYPE_LOV',
          computedProps: {
            lovPara: ({ record }) => {
              return { docTypeHeaderId: record.get('docTypeHeaderId').join(',') };
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
        },
        {
          name: 'docuTypeHeaderId',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentTypeCodeObj.docTypeHeaderId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumberShare',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
          type: FieldType.string,
        },
        {
          name: 'documentNumberObj',
          label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
          type: FieldType.object,
          lovCode: 'HTC.DOCUMENT_CODE_LOV',
          multiple: true,
          computedProps: {
            lovPara: ({ record }) => {
              return {
                docTypeHeaderId: record.get('docuTypeHeaderId').join(','),
                docTypeLineId: record.get('docTypeLineId').join(','),
              };
            },
            disabled: ({ record }) => {
              return !record.get('docuTypeHeaderId').length;
            },
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'documentNumber',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentNumberObj.documentNumber',
        },
        {
          name: 'detailId',
          type: FieldType.string,
          multiple: ',',
          bind: 'documentNumberObj.detailId',
        },
        {
          name: 'salerName',
          label: intl.get('htc.common.view.salerName').d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'xfsbh',
          label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
          type: FieldType.string,
        },
        {
          name: 'checkState',
          label: intl.get(`${modelCode}.view.checkState`).d('勾选标志'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_STATE',
          // defaultValue: '0',
        },
        {
          name: 'qt',
          defaultValue: 'dq',
        },
        {
          name: 'fply',
          defaultValue: '1',
        },
        {
          name: 'batchNo',
          label: intl.get(`${modelCode}.modal.bcbh`).d('批次编号'),
          type: FieldType.string,
        },
        {
          name: 'requestTime',
          label: intl.get('hivp.checkCertification.view.requestTime').d('请求时间'),
          type: FieldType.dateTime,
          range: ['invoiceDateFrom', 'invoiceDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'requestTimeFrom',
          type: FieldType.dateTime,
          bind: 'requestTime.requestTimeFrom',
          max: 'requestTimeTo',
          // transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'requestTimeTo',
          type: FieldType.dateTime,
          bind: 'requestTime.requestTimeTo',
          min: 'requestTimeFrom',
          // transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkResource',
          label: intl.get('hivp.taxRefund.modal.lylx').d('来源类型'),
          lookupCode: 'HTC.IVP.CHECK_RESOURCE',
          type: FieldType.string,
        },
      ],
    }),
  };
};
