/**
 * @DS -查检发票历史记录查询 :
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-27 14:21:52
 * @LastEditors: jesse.chen
 * @LastEditTime: 2020-07-30 20:47:36
 * @Copyright: Copyright (c) 2020, Hand
 */

import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hcan.invoice-check-histroy';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/invoice-check-historys`;
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
    primaryKey: 'checkHistoryId',
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
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('请求时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('返回时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'processStatusCode',
        label: intl.get(`${modelCode}.view.processStatusCode`).d('返回码'),
        type: FieldType.string,
      },
      {
        name: 'processRemark',
        label: intl.get(`${modelCode}.view.processRemark`).d('返回码对应信息'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('购方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'checkCode',
        label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('开票金额'),
        type: FieldType.currency,
      },
      {
        name: 'checkChannelCode',
        label: intl.get(`${modelCode}.view.checkChannelCode`).d('查验通道'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (name === 'tenantObject' && (value === '' || value === null)) {
            record.set('tenantObject', undefined);
            record.set('tenantId', undefined);
            record.set('companyObject', undefined);
            record.set('companyId', undefined);
            record.set('employeeObject', undefined);
            record.set('employeeId', undefined);
          }
          if (name === 'companyObject' && (value === '' || value === null)) {
            record.set('companyObject', undefined);
            record.set('companyId', undefined);
            record.set('employeeObject', undefined);
            record.set('employeeId', undefined);
          }
        },
      },
      fields: [
        {
          name: 'tenantObject',
          label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
          type: 'object' as FieldType,
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
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.object,
          lovCode: 'HMDM.COMPANY_INFO_SITE',
          // lovPara: { organizationId: tenantId },
          cascadeMap: { organizationId: 'tenantId' },
          ignore: FieldIgnore.always,
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
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObject.companyId',
        },
        {
          name: 'employeeObject',
          label: intl.get(`${modelCode}.view.employeeName`).d('员工(用户)'),
          type: FieldType.object,
          lovCode: 'HMDM.EMPLOYEE_NAME_SITE',
          ignore: FieldIgnore.always,
          cascadeMap: { tenantId: 'tenantId', companyId: 'companyId' },
          // computedProps: {
          //   lovPara: ({ record }) => {
          //     if (!isUndefined(record.get('tenantId')) && !isUndefined(record.get('companyId'))) {
          //       return { tenantId: record.get('tenantId'), companyId: record.get('companyId') };
          //     }
          //   },
          //   disabled: ({ record }) => {
          //     return isUndefined(record.get('tenantId')) || isUndefined(record.get('companyId'));
          //   },
          // },
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'employeeObject.employeeId',
        },
        {
          name: 'processDateFrom',
          label: intl.get(`${modelCode}.view.processDateFrom`).d('请求时间从'),
          type: FieldType.dateTime,
          max: 'processDateTo',
          defaultValue: moment().startOf('day'),
        },
        {
          name: 'processDateTo',
          label: intl.get(`${modelCode}.view.processDateTo`).d('请求时间至'),
          type: FieldType.dateTime,
          min: 'processDateFrom',
          defaultValue: moment().endOf('day'),
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceDate',
          label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
          type: FieldType.date,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceAmount',
          label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
          type: FieldType.currency,
        },
        {
          name: 'checkCode',
          label: intl.get(`${modelCode}.view.checkCode`).d('校验码'),
          type: FieldType.string,
          pattern: /^[a-zA-Z0-9]{6}$/,
          defaultValidationMessages: {
            patternMismatch: intl.get(`${modelCode}.view.checkNumberValid`).d('只能输入6位字符'),
          },
        },
        {
          name: 'successFlag',
          label: intl.get(`${modelCode}.view.successFlag`).d('是否成功'),
          type: FieldType.string,
        },
        {
          name: 'processStatusCode',
          label: intl.get(`${modelCode}.view.processStatusCode`).d('返回码'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
