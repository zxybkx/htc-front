/**
 * @Description: 租户协议明细头数据源
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.tenant-agreement';

export default (agreementId): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/tenant-agreementss/${agreementId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            //  tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'agreementId',
    selection: false,
    fields: [
      {
        name: 'agreementId',
        type: FieldType.string,
      },
      {
        name: 'tenantId',
        label: intl.get(`${modelCode}.view.tenantId`).d('租户ID'),
        type: FieldType.string,
        disabled: true,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
        disabled: true,
      },
      {
        name: 'customerName',
        label: intl.get(`${modelCode}.view.customerName`).d('客户全称'),
        type: FieldType.string,
        disabled: true,
      },
    ],
  };
};
