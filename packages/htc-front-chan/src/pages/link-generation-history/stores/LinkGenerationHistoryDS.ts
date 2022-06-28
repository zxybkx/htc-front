/**
 * @Description: 全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-09-24 10:06:17
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hmdm.link-generation-history';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  // const API_PREFIX = `${commonConfig.MDM_API}-30455` || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/apply-items/query-links-info`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
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
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('过期状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_STATUS',
      },
      {
        name: 'linksType',
        label: intl.get(`${modelCode}.view.linksType`).d('用途'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_TYPE',
      },
      {
        name: 'linksAccountStart',
        label: intl.get(`${modelCode}.view.linksAccountStart`).d('开通日期起'),
        type: FieldType.string,
      },
      {
        name: 'linksAccountEnd',
        label: intl.get(`${modelCode}.view.linksAccountEnd`).d('开通日期至'),
        type: FieldType.string,
      },
      {
        name: 'linksCode',
        label: intl.get(`${modelCode}.view.linksCode`).d('链接'),
        type: FieldType.string,
      },
      {
        name: 'phone',
        label: intl.get(`${modelCode}.view.phone`).d('推送手机号'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('推送邮箱'),
        type: FieldType.string,
      },
      {
        name: 'systemTenantName',
        label: intl.get(`${modelCode}.view.systemTenantName`).d('已建租户'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('已建公司'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('推送时间'),
        type: FieldType.string,
      },
      {
        name: 'createdByName',
        label: intl.get(`${modelCode}.view.createdByName`).d('推送操作人'),
        type: FieldType.string,
      },
      {
        name: 'failureDate',
        label: intl.get(`${modelCode}.view.failureDate`).d('失效时间'),
        type: FieldType.string,
      },
      {
        name: 'customerSubmit',
        label: intl.get(`${modelCode}.view.customerSubmit`).d('是否客户提交'),
        lookupCode: 'HTC.HIOP.APPLY_CUSTOMER_SUBMIT',
        type: FieldType.string,
      },
    ],
    queryFields: [
      {
        name: 'linksCreateDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('链接生成时间'),
        range: ['linksCreateDateTo', 'linksCreateDateEnd'],
        type: FieldType.date,
        ignore: FieldIgnore.always,
      },
      {
        name: 'linksCreateDateTo',
        label: intl.get(`${modelCode}.view.linksCreateDateTo`).d('链接生成时间起'),
        type: FieldType.date,
        bind: 'linksCreateDate.linksCreateDateTo',
      },
      {
        name: 'linksCreateDateEnd',
        label: intl.get(`${modelCode}.view.linksCreateDateEnd`).d('链接生成时间止'),
        type: FieldType.date,
        bind: 'linksCreateDate.linksCreateDateEnd',
      },
      {
        name: 'createdByName',
        label: intl.get(`${modelCode}.view.createdByName`).d('操作人'),
        type: FieldType.string,
      },
      {
        name: 'phone',
        label: intl.get(`${modelCode}.view.phone`).d('推送手机号'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('推送邮箱'),
        type: FieldType.string,
      },
      {
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('链接过期状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_STATUS',
      },
      {
        name: 'linksType',
        label: intl.get(`${modelCode}.view.linksType`).d('链接过期环境'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_LINK_TYPE',
      },
      {
        name: 'linksCode',
        label: intl.get(`${modelCode}.view.linksCode`).d('链接'),
        type: FieldType.string,
      },
    ],
  };
};
