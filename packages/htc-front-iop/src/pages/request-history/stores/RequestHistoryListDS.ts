/**
 * @Description: 销项请求历史记录表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-14 14:57
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hiop.request-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/request-historys`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'applyStatisticsLogId',
    selection: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('请求id'),
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户id'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
        type: FieldType.string,
      },
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('请求报文'),
        type: FieldType.string,
      },
      {
        name: 'statisticsDate',
        label: intl.get(`${modelCode}.view.statisticsDate`).d('返回报文'),
        type: FieldType.string,
      },
      {
        name: 'taxDiscLoginPassword',
        label: intl.get(`${modelCode}.view.taxDiscLoginPassword`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_TYPE',
      },
      {
        name: 'processStatusCode',
        label: intl.get(`${modelCode}.view.processStatusCode`).d('是否成功'),
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
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('创建日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('最后更新日期'),
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
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_TYPE',
      },
      {
        name: 'processDateFrom',
        label: intl.get(`${modelCode}.view.processDateFrom`).d('请求时间从'),
        type: FieldType.dateTime,
        max: 'processDateTo',
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'processDateTo',
        label: intl.get(`${modelCode}.view.processDateTo`).d('请求时间至'),
        type: FieldType.dateTime,
        min: 'processDateFrom',
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
      },
    ],
  };
};
