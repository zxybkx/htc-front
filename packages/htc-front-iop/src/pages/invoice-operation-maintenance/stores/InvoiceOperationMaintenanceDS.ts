/**
 * @Description - 开票订单运维平台页面
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-25
 * @LastEditTime: 2022-02-25
 * @Copyright: Copyright (c) 2022, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import commonConfig from '@htccommon/config/commonConfig';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/maintenance-operation/query-list`;
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
      create: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/maintenance-operation/update-order`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'maintenanceHistoryId',
    fields: [
      {
        name: 'sourceType',
        label: intl.get('hiop.invoiceOptMain.modal.sourceType').d('数据来源'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP_MAINTENANCE_ORDER_SOURCE',
      },
      {
        name: 'tenantId',
        label: intl.get('htc.common.modal.tenantId').d('租户ID'),
        type: FieldType.string,
      },
      {
        name: 'tenantName',
        label: intl.get('htc.common.modal.tenantName').d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.modal.companyName').d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'invoicingOrderHeaderId',
        label: intl.get('hiop.invoiceOptMain.modal.orderId').d('订单ID'),
        type: FieldType.string,
      },
      {
        name: 'orderNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.orderNumber').d('订单号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'updateFieldObj',
        label: intl.get('hiop.invoiceOptMain.modal.updateField').d('修改字段'),
        type: FieldType.object,
        lovCode: 'HIOP.ORDER_FILED',
        required: true,
        cascadeMap: { organizationId: 'tenantId', companyId: 'companyId' },
        computedProps: {
          readOnly: ({ record }) =>
            !record.get('invoicingOrderHeaderId') || !record.get('orderNumber'),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'updateField',
        label: intl.get('hiop.invoiceOptMain.modal.updateField').d('修改字段'),
        type: FieldType.string,
        bind: 'updateFieldObj.value',
      },
      {
        name: 'updateFieldDescription',
        label: intl.get('hiop.invoiceOptMain.modal.updateFieldDescription').d('修改字段描述'),
        type: FieldType.string,
        bind: 'updateFieldObj.meaning',
      },
      {
        name: 'beforeValue',
        label: intl.get('hiop.invoiceOptMain.modal.beforeValue').d('修改前值'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'afterValue',
        label: intl.get('hiop.invoiceOptMain.modal.afterValue').d('修改后值'),
        type: FieldType.string,
      },
      {
        name: 'maintenanceDate',
        label: intl.get('hiop.invoiceOptMain.modal.maintenanceDate').d('操作时间'),
        type: FieldType.string,
      },
      {
        name: 'maintenanceOperator',
        label: intl.get('hiop.invoiceOptMain.modal.maintenanceOperator').d('操作修改人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'maintenanceAccount',
        label: intl.get('hiop.invoiceOptMain.modal.maintenanceAccount').d('操作账号'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'tenantObj',
          label: intl.get('htc.common.modal.tenantName').d('租户名称'),
          type: FieldType.object,
          lovCode: 'HPFM.TENANT',
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'tenantName',
          type: FieldType.string,
          bind: `tenantObj.tenantName`,
        },
        {
          name: 'tenantId',
          type: FieldType.string,
          bind: `tenantObj.tenantId`,
        },
        {
          name: 'companyNameObject',
          label: intl.get('htc.common.modal.CompanyName').d('公司名称'),
          type: FieldType.object,
          lovCode: 'HMDM.COMPANY_INFO_SITE',
          cascadeMap: { organizationId: 'tenantId' },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: `companyNameObject.companyId`,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: `companyNameObject.companyCode`,
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: `companyNameObject.companyName`,
        },
        {
          name: 'maintenanceDate',
          label: intl.get('hiop.invoiceOptMain.modal.maintenanceDate').d('操作变更时间'),
          type: FieldType.date,
          range: ['maintenanceDateFrom', 'maintenanceDateTo'],
          ignore: FieldIgnore.always,
          labelWidth: '120',
        },
        {
          name: 'maintenanceDateFrom',
          type: FieldType.date,
          bind: 'maintenanceDate.maintenanceDateFrom',
        },
        {
          name: 'maintenanceDateTo',
          type: FieldType.date,
          bind: 'maintenanceDate.maintenanceDateTo',
        },
        {
          name: 'orderNumber',
          label: intl.get('hiop.invoiceReq.modal.orderNumber').d('订单号'),
          type: FieldType.string,
        },
        {
          name: 'invoicingOrderHeaderId',
          label: intl.get('hiop.invoiceOptMain.modal.orderId').d('订单ID'),
          type: FieldType.string,
        },
        {
          name: 'sourceType',
          label: intl.get('hiop.invoiceOptMain.modal.sourceType').d('数据来源'),
          type: FieldType.string,
          lookupCode: 'HTC.HIOP_MAINTENANCE_ORDER_SOURCE',
        },
      ],
    }),
  };
};
