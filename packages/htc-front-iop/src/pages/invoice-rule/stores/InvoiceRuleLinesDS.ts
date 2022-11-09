/**
 * @Description:开票规则行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-03-05 11:00:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/rules-lines-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/rules-lines-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'rulesLinesId',
    events: {
      update: ({ record, name }) => {
        if (name === 'limitInvoiceTypeObj') {
          record.set({ defaultInvoiceTypeObj: '' });
        }
      },
    },
    fields: [
      {
        name: 'rulesLinesId',
        type: FieldType.string,
      },
      {
        name: 'rulesHeaderId',
        type: FieldType.string,
      },
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        type: FieldType.string,
      },
      {
        name: 'operationTypeCode',
        label: intl.get('hzero.common.components.dataAudit.operationType').d('操作类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.OPERATION_TYPE',
        required: true,
      },
      {
        name: 'employeeNumObj',
        label: intl.get('hiop.invoiceRule.modal.employeeNumObj').d('员工号'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        textField: 'employeeNum',
        required: true,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
        bind: 'employeeNumObj.employeeId',
      },
      {
        name: 'employeeName',
        label: intl.get('hiop.invoiceRule.modal.employeeName').d('姓名'),
        type: FieldType.string,
        bind: 'employeeNumObj.employeeName',
      },
      {
        name: 'employeeNumber',
        label: intl.get('hiop.invoiceRule.modal.employeeNumber').d('编号'),
        type: FieldType.string,
        bind: 'employeeNumObj.employeeNum',
      },
      {
        name: 'qualifiedAuditorObj',
        label: intl.get('hiop.invoiceRule.modal.qualifiedAuditorObj').d('限定审核人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
      },
      {
        name: 'qualifiedAuditorIds',
        type: FieldType.string,
        bind: 'qualifiedAuditorObj.employeeId',
        multiple: ',',
      },
      {
        name: 'qualifiedAuditorMeaning',
        type: FieldType.string,
        bind: `qualifiedAuditorObj.employeeName`,
        multiple: ',',
      },
      {
        name: 'applyBusinessCode',
        label: intl.get('hiop.invoiceRule.modal.applyBusinessCode').d('限定业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get('hiop.invoiceRule.modal.purchaseInvoiceFlag').d('默认收购发票'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: '',
        defaultValue: '',
      },
      {
        name: 'limitInvoiceTypeObj',
        label: intl.get('hiop.invoiceRule.modal.limitInvoiceTypeObj').d('限定开票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.COMPANY_INVOICE_TYPE',
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'limitInvoiceTypeCode',
        type: FieldType.string,
        bind: 'limitInvoiceTypeObj.value',
        multiple: ',',
      },
      {
        name: 'limitInvoiceTypeMeaning',
        type: FieldType.string,
        bind: 'limitInvoiceTypeObj.meaning',
        multiple: ',',
      },
      {
        name: 'defaultInvoiceTypeObj',
        label: intl.get('hiop.invoiceRule.modal.defaultInvoiceTypeObj').d('默认开票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.COMPANY_INVOICE_TYPE',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          lovPara: ({ record }) => {
            const limitInvoiceTypeCode = record.get('limitInvoiceTypeCode');
            return {
              limitInvoiceTypes: limitInvoiceTypeCode ? limitInvoiceTypeCode.join(',') : '',
            };
          },
        },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'defaultInvoiceTypeCode',
        type: FieldType.string,
        bind: 'defaultInvoiceTypeObj.value',
      },
      {
        name: 'defaultInvoiceTypeMeaning',
        type: FieldType.string,
        bind: 'defaultInvoiceTypeObj.meaning',
      },
      {
        name: 'limitExtensionCodeObj',
        label: intl.get('hiop.invoiceRule.modal.limitExtensionCodeObj').d('限定分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        cascadeMap: { companyId: 'companyId' },
        textField: 'extNumber',
        ignore: FieldIgnore.always,
      },
      {
        name: 'limitExtensionCode',
        label: intl.get('hiop.invoiceRule.modal.limitExtensionCodeObj').d('限定分机号'),
        type: FieldType.string,
        bind: 'limitExtensionCodeObj.extNumber',
      },
      {
        name: 'printFileDownloadPath',
        label: intl.get('hiop.invoiceRule.modal.printFileDownloadPath').d('打印路径'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDownloadPath',
        label: intl.get('hiop.invoiceRule.modal.invoiceDownloadPath').d('打印发票路径'),
        type: FieldType.string,
      },
      {
        name: 'listDownloadPath',
        label: intl.get('hiop.invoiceRule.modal.listDownloadPath').d('打印清单路径'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('是否启用'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
  };
};
