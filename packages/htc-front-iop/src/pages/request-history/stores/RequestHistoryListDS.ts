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

const modelCode = 'hiop.request-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';

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
        name: 'requestId',
        label: intl.get(`${modelCode}.view.requestId`).d('请求id'),
        type: FieldType.number,
      },
      {
        name: 'tenantId',
        label: intl.get(`${modelCode}.view.tenantId`).d('租户id'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
        type: FieldType.string,
      },
      {
        name: 'requestJson',
        label: intl.get(`${modelCode}.view.requestJson`).d('请求报文'),
        type: FieldType.string,
      },
      {
        name: 'responseJson',
        label: intl.get(`${modelCode}.view.responseJson`).d('返回报文'),
        type: FieldType.string,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_TYPE',
      },
      {
        name: 'successFlag',
        label: intl.get(`${modelCode}.view.successFlag`).d('是否成功'),
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
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.lastUpdateDate`).d('最后更新日期'),
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
        // required: true,
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
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.REQUEST_TYPE',
      },
      {
        name: 'requestHistoryDateFrom',
        label: intl.get(`${modelCode}.view.requestHistoryDateFrom`).d('请求时间从'),
        type: FieldType.dateTime,
        max: 'requestHistoryDateTo',
        defaultValue: moment().startOf('day'),
      },
      {
        name: 'requestHistoryDateTo',
        label: intl.get(`${modelCode}.view.requestHistoryDateTo`).d('请求时间至'),
        type: FieldType.dateTime,
        min: 'requestHistoryDateFrom',
        defaultValue: moment().endOf('day'),
      },
      {
        name: 'requestJson',
        label: intl.get(`${modelCode}.view.requestJson`).d('请求报文'),
        type: FieldType.string,
      },
      {
        name: 'responseJson',
        label: intl.get(`${modelCode}.view.responseJson`).d('响应报文'),
        type: FieldType.string,
      },
      {
        name: 'successFlag',
        label: intl.get(`${modelCode}.view.successFlag`).d('是否成功'),
        type: FieldType.string,
        lookupCode: 'HIOT.SUCCESS_FLAG',
      },
    ],
  };
};
