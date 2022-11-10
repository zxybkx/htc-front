/**
 * @Description:公司协议信息-租户协议公司
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-07 10:19:48
 * @LastEditTime: 2020-11-26 11:10:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import commonConfig from '@htccommon/config/commonConfig';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/agreement-company-infoss/detail-code`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
            companyId: dsParams.companyId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'agreementCompanyId',
    selection: false,
    fields: [
      {
        name: 'agreementCompanyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('hmdm.companyList.view.companyCode').d('注册公司代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'companyName',
        label: intl.get('hmdm.companyList.view.companyName').d('注册公司名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'administrator',
        label: intl.get('hmdm.companyList.view.administrator').d('管理员'),
        labelWidth: '150',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'administratorMailbox',
        label: intl.get('hmdm.companyList.view.administratorMailbox').d('管理员邮箱'),
        type: FieldType.email,
        readOnly: true,
      },
      {
        name: 'administratorPhone',
        label: intl.get('hmdm.companyList.view.administratorPhone').d('管理员电话'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'checkChannelCode',
        label: intl.get('hmdm.companyList.view.checkChannelCode').d('查验通道'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HMDM.CHECK_CHANNEL',
      },
      {
        name: 'authorizationStartDate',
        label: intl.get('hmdm.companyList.view.authorizationStartDate').d('授权起始日'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'authorizationEndDate',
        label: intl.get('hmdm.companyList.view.authorizationEndDate').d('授权到期日'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'inChannelCode',
        label: intl.get('hmdm.companyList.view.inChannelCode').d('进项通道'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HMDM.IN_CHANNEL',
      },
      {
        name: 'outChannelCode',
        label: intl.get('hmdm.companyList.view.outChannelCode').d('销项通道'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HMDM.OUT_CHANNEL',
      },
      {
        name: 'authorizationTypeCode',
        label: intl.get('hmdm.companyList.view.authorizationTypeCode').d('授权类型'),
        type: FieldType.string,
        readOnly: true,
        lookupCode: 'HMDM.AUTHORIZATION_TYPE',
      },
      {
        name: 'authorizationCode',
        label: intl.get('hmdm.companyList.view.authorizationCode').d('企业授权码'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
