/**
 * @Description: Ofd电子发票识别解析历史记录
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-18 10:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-18 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hcan.ofd-invoice-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/invoice-ofd-resolver-historys`;
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
    primaryKey: 'resolverHistoryId',
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
        name: 'ofdInvoiceFile',
        label: intl.get(`${modelCode}.view.ofdInvoiceFile`).d('发票信息BASE64加密'),
        type: FieldType.string,
      },
      {
        name: 'processRemark',
        label: intl.get(`${modelCode}.view.processRemark`).d('处理消息'),
        type: FieldType.string,
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
        type: FieldType.string,
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
