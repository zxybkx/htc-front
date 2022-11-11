/**
 * tenantAgreement - 租户协议维护
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/project-tenant-opts`;
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
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/project-tenant-opts/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/project-tenant-opts/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'agreementId',
    fields: [
      {
        name: 'tenantObject',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: 'object' as FieldType,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
        required: true,
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
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'projectNumber',
        type: FieldType.string,
        label: intl.get('hmdm.applyTenant.view.projectNumber').d('立项项目编号'),
        required: true,
      },
      {
        name: 'associationStartDate',
        label: intl
          .get('hmdm.projectTenantMaintenance.view.associationStartDate')
          .d('关联起始时间'),
        type: FieldType.date,
        max: 'associationEndDate',
        required: true,
      },
      {
        name: 'associationEndDate',
        label: intl.get('hmdm.projectTenantMaintenance.view.associationEndDate').d('关联截至时间'),
        type: FieldType.date,
        min: 'associationStartDate',
        computedProps: {
          required: ({ record }) => record.get('termination'),
        },
      },
      {
        name: 'deliveryDocker',
        label: intl.get('hmdm.costSharing.view.deliveryDocker').d('交付对接人'),
        type: FieldType.string,
      },
      {
        name: 'dockerContact',
        label: intl.get('hmdm.costSharing.view.dockerContact').d('对接人联系方式'),
        type: FieldType.string,
      },

      {
        name: 'administrator',
        label: intl.get('hmdm.companyList.view.administrator').d('管理员'),
        type: FieldType.string,
      },
      {
        name: 'adminEmail',
        label: intl.get('hmdm.companyList.view.administratorMailbox').d('管理员邮箱'),
        type: FieldType.email,
      },
      {
        name: 'termination',
        label: intl.get('hmdm.projectTenantMaintenance.view.termination').d('是否关联截止'),
        type: FieldType.boolean,
        defaultValue: false,
        transformResponse: value => value === 0,
        transformRequest: value => (value ? 0 : 1),
      },
      {
        name: 'enabledFlag',
        label: intl.get('htc.common.modal.enabledFlag').d('启用状态'),
        type: FieldType.boolean,
        defaultValue: false,
        transformResponse: value => value !== 0,
        transformRequest: value => (value ? 1 : 0),
      },
    ],
    queryFields: [
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'associationStartDate',
        label: intl
          .get('hmdm.projectTenantMaintenance.view.associationStartDate')
          .d('关联起始时间'),
        type: FieldType.date,
        labelWidth: '150',
        range: ['associationStartDateFrom', 'associationStartDateTo'],
        ignore: FieldIgnore.always,
      },
      {
        name: 'associationStartDateFrom',
        type: FieldType.date,
        bind: 'associationStartDate.associationStartDateFrom',
      },
      {
        name: 'associationStartDateTo',
        type: FieldType.date,
        bind: 'associationStartDate.associationStartDateTo',
      },
      {
        name: 'associationEndDate',
        label: intl.get('hmdm.projectTenantMaintenance.view.associationEndDate').d('关联截至时间'),
        type: FieldType.date,
        labelWidth: '150',
        range: ['associationEndDateFrom', 'associationEndDateTo'],
        ignore: FieldIgnore.always,
      },
      {
        name: 'associationEndDateFrom',
        type: FieldType.date,
        bind: 'associationEndDate.associationEndDateFrom',
      },
      {
        name: 'associationEndDateTo',
        type: FieldType.date,
        bind: 'associationEndDate.associationEndDateTo',
      },
      {
        name: 'termination',
        label: intl.get('hmdm.projectTenantMaintenance.view.termination').d('是否关联截止'),
        type: FieldType.string,
        lookupCode: 'HPFM.ENABLED_FLAG',
        labelWidth: '150',
        transformRequest: value => {
          if (value === '0') {
            return '1';
          } else if (value === '1') {
            return '0';
          }
        },
      },
      {
        name: 'deliveryDocker',
        label: intl.get('hmdm.costSharing.view.deliveryDocker').d('交付对接人'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
        type: FieldType.string,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
  };
};
