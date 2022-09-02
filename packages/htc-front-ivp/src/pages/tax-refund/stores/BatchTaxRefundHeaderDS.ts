/*
 * @Description:批量退税勾选(取消)可确认发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-26 11:01:10
 * @LastEditTime: 2022-09-01 17:47:50
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

const modelCode = 'hivp.taxRefund';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { companyId, companyCode, employeeId, employeeNumber } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/refund-invoice-operation/query-batch-refund-invoice`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            companyId,
            companyCode,
            employeeId,
            employeeNumber,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'batchTaxRefundHeader',
    paging: false,
    fields: [
      {
        name: 'checkState',
        label: intl.get(`hivp.taxRefund.view.checkState`).d('勾选标志'),
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
        name: 'batchNo',
        label: intl.get('hivp.checkCertification.view.batchNo').d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'failReason',
        label: intl.get('hivp.checkCertification.view.failReason').d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        label: intl.get('hivp.checkCertification.view.requestTime').d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get('hivp.checkCertification.view.completeTime').d('完成时间'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyDesc`).d('所属公司'),
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
          // ignore: FieldIgnore.always,
        },
        {
          name: 'companyName',
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          required: true,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNumber',
          label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          required: true,
        },
        {
          name: 'authorityCode',
          label: intl.get(`${modelCode}.view.authorityCode`).d('主管机构代码'),
          type: FieldType.string,
        },
        {
          name: 'checkMonth',
          label: intl.get('hivp.checkCertification.view.checkMonth').d('勾选月份'),
          type: FieldType.string,
          defaultValue: moment().format('YYYYMM'),
          readOnly: true,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get('hivp.bill.view.invoiceDateFrom').d('开票日期从'),
          max: 'invoiceDateTo',
          type: FieldType.date,
        },
        {
          name: 'invoiceDateTo',
          label: intl.get('hivp.bill.view.invoiceDateTo').d('开票日期至'),
          min: 'invoiceDateFrom',
          type: FieldType.date,
        },
        {
          name: 'salerTaxNo',
          label: intl.get('htc.common.view.salerTaxNo').d('销方税号'),
          type: FieldType.string,
        },
        {
          name: 'checkFlag',
          label: intl.get('hivp.taxRefund.view.checkState').d('勾选标志'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_STATE',
          defaultValue: '0',
        },
      ],
    }),
  };
};
