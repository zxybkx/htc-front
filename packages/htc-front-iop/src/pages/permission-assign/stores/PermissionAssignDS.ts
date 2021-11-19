/*
 * @Descripttion:发票头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 11:54:42
 * @LastEditTime: 2021-03-08 13:57:25
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.permisssion-assign';

export default (companyId): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers/permission`;
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
      // submit: ({ data, params }) => {
      //   return {
      //     url: `${API_PREFIX}/v1/${tenantId}/requisition-headers/permission-save`,
      //     data,
      //     params,
      //     method: 'POST',
      //   };
      // },
    },
    paging: false,
    selection: false,
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
        defaultValue: companyId,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('所属公司'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('登录员工'),
        type: FieldType.string,
      },
      {
        name: 'creationName',
        label: intl.get(`${modelCode}.view.creationName`).d('创建人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'auditName',
        label: intl.get(`${modelCode}.view.auditName`).d('审核人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'issuerame',
        label: intl.get(`${modelCode}.view.issuerame`).d('开票人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'payeeName',
        label: intl.get(`${modelCode}.view.payeeName`).d('收款人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewer',
        label: intl.get(`${modelCode}.view.reviewer`).d('复核'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'whiteList',
        label: intl.get(`${modelCode}.view.whiteList`).d('白名单'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoicePermissions',
        label: intl.get(`${modelCode}.view.assign`).d('分配'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        // ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
      },
      {
        name: 'assignId',
        type: FieldType.number,
        bind: 'invoicePermissions.employeeId',
        multiple: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'assignName',
        type: FieldType.string,
        bind: 'invoicePermissions.employeeName',
        multiple: true,
        ignore: FieldIgnore.always,
      },
    ],
  };
};
