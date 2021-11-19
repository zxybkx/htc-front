/**
 * @Description:账单推送历史记录
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-13 17:22:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'chan.bill-push-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/billing-history`;
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
    primaryKey: 'basicInfoQueryHistoryId',
    selection: false,
    fields: [
      {
        name: 'billNumber',
        label: intl.get(`${modelCode}.view.billNumber`).d('账单编号'),
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('账单类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILLING_TYPE',
      },
      {
        name: 'billCreateTime',
        label: intl.get(`${modelCode}.view.billCreateTime`).d('账单生成时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'receiver',
        label: intl.get(`${modelCode}.view.receiver`).d('账单接收人'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('账单接收邮箱'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('发送时间'),
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
        name: 'tenantName',
        type: FieldType.string,
        bind: `tenantObject.tenantName`,
      },
      {
        name: 'companyObject',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司名称'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_INFO_SITE',
        cascadeMap: { organizationId: 'tenantId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObject.companyCode',
      },
      {
        name: 'companyName',
        type: FieldType.string,
        bind: 'companyObject.companyName',
      },
      {
        name: 'sendDateStart',
        label: intl.get(`${modelCode}.view.sendDateStart`).d('发送时间从'),
        type: FieldType.date,
        max: 'sendDateEnd',
      },
      {
        name: 'sendDateEnd',
        label: intl.get(`${modelCode}.view.sendDateEnd`).d('发送时间至'),
        type: FieldType.date,
        min: 'sendDateStart',
      },
      {
        name: 'receiver',
        label: intl.get(`${modelCode}.view.receiver`).d('接收人'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('接收邮箱'),
        type: FieldType.string,
      },
      {
        name: 'billNumber',
        label: intl.get(`${modelCode}.view.billNumber`).d('账单编号'),
        type: FieldType.string,
      },
    ],
  };
};
