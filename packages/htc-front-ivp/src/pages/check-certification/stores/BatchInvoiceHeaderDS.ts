/*
 * @Description:批量退税勾选(取消)可确认发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-26 11:01:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.tax-refund';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  // const API_PREFIX = `${commonConfig.IVP_API}-31183` || '';
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
    },
    primaryKey: 'needDownloadKey',
    paging: false,
    fields: [
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
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'failReason',
        label: intl.get(`${modelCode}.view.failReason`).d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get(`${modelCode}.view.completeTime`).d('完成时间'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
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
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeNumber',
          label: intl.get(`${modelCode}.view.employeeNumber`).d('员工编号'),
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
          label: intl.get(`${modelCode}.view.authorityCode`).d('主管税务机关代码'),
          type: FieldType.string,
        },
        {
          name: 'tjyf',
          label: intl.get(`${modelCode}.view.tjyf`).d('当前所属期'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentOperationalDeadline',
          label: intl.get(`${modelCode}.view.currentOperationalDeadline`).d('当前可操作截止时间'),
          labelWidth: '130',
          type: FieldType.dateTime,
          transformRequest: (value) => moment(value).format('YYYY-MM-DD'),
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkableTimeRange',
          label: intl.get(`${modelCode}.view.checkableTimeRange`).d('可勾选时间范围'),
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
          name: 'rqq',
          label: intl.get(`${modelCode}.view.rqq`).d('开票日期从'),
          type: FieldType.date,
          max: 'rqz',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'rqz',
          label: intl.get(`${modelCode}.view.rqz`).d('开票日期至'),
          type: FieldType.date,
          min: 'rqq',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'salerTaxNo',
          label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方税号'),
          type: FieldType.string,
        },
        {
          name: 'gxzt',
          label: intl.get(`${modelCode}.view.gxzt`).d('勾选标志'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_STATE',
          defaultValue: '0',
        },
        {
          name: 'qt',
          defaultValue: 'dq',
        },
        {
          name: 'fply',
          defaultValue: '1',
        },
      ],
    }),
  };
};
