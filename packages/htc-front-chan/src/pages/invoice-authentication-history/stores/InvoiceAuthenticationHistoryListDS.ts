/**
 * @Description: 发票认证请求历史记录
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-21 10:26:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-21 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hcan.invoice-authentication-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/invoice-authentication-historys`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            // tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'authenticationHistoryId',
    selection: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工'),
        type: FieldType.string,
      },
      {
        name: 'taxDiskPassword',
        label: intl.get(`${modelCode}.view.taxDiskPassword`).d('税盘密码'),
        type: FieldType.string,
      },
      {
        name: 'competentAgencyCode',
        label: intl.get(`${modelCode}.view.competentAgencyCode`).d('主管机构代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNumber',
        label: intl.get(`${modelCode}.view.invoiceNumber`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'vendorNumber',
        label: intl.get(`${modelCode}.view.vendorNumber`).d('销方识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDateFrom',
        label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期起'),
        type: FieldType.date,
      },
      {
        name: 'invoiceDateInto',
        label: intl.get(`${modelCode}.view.invoiceDateInto`).d('开票日期止'),
        type: FieldType.date,
      },
      {
        name: 'checkStatus',
        label: intl.get(`${modelCode}.view.checkStatus`).d('勾选状态'),
        type: FieldType.string,
      },
      {
        name: 'managementStatus',
        label: intl.get(`${modelCode}.view.managementStatus`).d('管理状态'),
        type: FieldType.string,
      },
      {
        name: 'invoiceStatus',
        label: intl.get(`${modelCode}.view.invoiceStatus`).d('发票状态'),
        type: FieldType.string,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('查询类型'),
        type: FieldType.string,
        lookupCode: 'HCAN.INVOICE_AUTHENTICATION_REQUEST_TYPE',
      },
      {
        name: 'invoicePurpose',
        label: intl.get(`${modelCode}.view.invoicePurpose`).d('发票用途'),
        type: FieldType.string,
      },
      {
        name: 'submissionMonth',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('提交月份'),
        type: FieldType.string,
      },
      {
        name: 'queryStatus',
        label: intl.get(`${modelCode}.view.queryStatus`).d('查询状态'),
        type: FieldType.string,
      },
      {
        name: 'processStatusCode',
        label: intl.get(`${modelCode}.view.processStatusCode`).d('请求状态码'),
        type: FieldType.string,
      },
      {
        name: 'processRemark',
        label: intl.get(`${modelCode}.view.processRemark`).d('处理消息'),
        type: FieldType.string,
      },
      {
        name: 'inChannelCode',
        label: intl.get(`${modelCode}.view.inChannelCode`).d('通道服务'),
        type: FieldType.string,
        lookupCode: 'HMDM.IN_CHANNEL',
      },
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('处理日期从'),
        type: FieldType.dateTime,
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('处理日期至'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        type: FieldType.number,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'companyObject',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        ignore: FieldIgnore.always,
        cascadeMap: { organizationId: 'tenantId' },
        // computedProps: {
        //   lovPara: ({ record }) => {
        //     if (!isUndefined(record.get('tenantId'))) {
        //       return { organizationId: record.get('tenantId') };
        //     }
        //   },
        //   disabled: ({ record }) => {
        //     return isUndefined(record.get('tenantId'));
        //   },
        // },
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'employeeObject',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('员工'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        cascadeMap: { tenantId: 'tenantId', companyCode: 'companyCode' },
      },
      {
        name: 'employeeNumber',
        type: FieldType.string,
        bind: 'employeeObject.employeeNum',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNumber',
        label: intl.get(`${modelCode}.view.invoiceNumber`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoicePurpose',
        label: intl.get(`${modelCode}.view.invoicePurpose`).d('发票用途'),
        type: FieldType.string,
      },
      {
        name: 'invoiceStatus',
        label: intl.get(`${modelCode}.view.invoiceStatus`).d('发票状态'),
        type: FieldType.string,
      },
      {
        name: 'checkStatus',
        label: intl.get(`${modelCode}.view.checkStatus`).d('勾选状态'),
        type: FieldType.string,
      },
      {
        name: 'queryStatus',
        label: intl.get(`${modelCode}.view.queryStatus`).d('查询状态'),
        type: FieldType.string,
      },
      {
        name: 'competentAgencyCode',
        label: intl.get(`${modelCode}.view.competentAgencyCode`).d('主管机构代码'),
        type: FieldType.string,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('查询类型'),
        type: FieldType.number,
        lookupCode: 'HCAN.INVOICE_AUTHENTICATION_REQUEST_TYPE',
      },
      {
        name: 'submissionMonth',
        label: intl.get(`${modelCode}.view.submissionMonth`).d('提交月份'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format('yyyyMM'),
      },
      {
        name: 'invoiceDateFrom',
        label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期起'),
        type: FieldType.date,
        max: 'invoiceDateInto',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceDateInto',
        label: intl.get(`${modelCode}.view.invoiceDateInto`).d('开票日期止'),
        type: FieldType.date,
        min: 'invoiceDateFrom',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('处理日期从'),
        type: FieldType.dateTime,
        max: 'processDateTo',
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('处理日期至'),
        type: FieldType.dateTime,
        min: 'processDateFrom',
      },
    ],
  };
};
