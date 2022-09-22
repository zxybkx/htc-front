/**
 * @Description: 企业认证请求历史记录查询 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-16 13:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-16 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hcan.enterprise-cert-request-histroy';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.CHAN_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/enterprise-cert-request-historys`;
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
    primaryKey: 'enterpriseCertRequestHistoryId',
    selection: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户'),
        type: FieldType.string,
      },
      {
        name: 'inChannelCode',
        label: intl.get(`${modelCode}.view.inChannelCode`).d('通道服务'),
        type: FieldType.string,
        lookupCode: 'HMDM.IN_CHANNEL',
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
        name: 'resultQueryMeaning',
        label: intl.get(`${modelCode}.view.resultQueryMeaning`).d('请求类型'),
        type: FieldType.string,
      },
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
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
        name: 'certificationPeriod',
        label: intl.get(`${modelCode}.view.certificationPeriod`).d('认证所属期'),
        type: FieldType.string,
      },
      {
        name: 'confirmMark',
        label: intl.get(`${modelCode}.view.confirmMark`).d('确认标志'),
        type: FieldType.string,
      },
      {
        name: 'confirmPassword',
        label: intl.get(`${modelCode}.view.confirmPassword`).d('确认密码'),
        type: FieldType.string,
      },
      {
        name: 'processStatusCode',
        label: intl.get(`${modelCode}.view.processStatusCode`).d('请求状态码'),
        type: FieldType.string,
      },
      {
        name: 'successFlag',
        label: intl.get(`${modelCode}.view.successFlag`).d('是否成功'),
        type: FieldType.number,
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
        name: 'processRemark',
        label: intl.get(`${modelCode}.view.processRemark`).d('处理消息'),
        type: FieldType.string,
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
        name: 'resultQuery',
        label: intl.get(`${modelCode}.view.resultQuery`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HCAN.ENTERPRISE_CERT_REQUEST_TYPE',
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
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'certificationPeriod',
        label: intl.get(`${modelCode}.view.certificationPeriod`).d('认证所属期'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format('yyyyMM'),
      },
      {
        name: 'competentAgencyCode',
        label: intl.get(`${modelCode}.view.competentAgencyCode`).d('主管机构代码'),
        type: FieldType.string,
      },
    ],
  };
};
