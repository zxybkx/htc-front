/*
 * @Descripttion:开票规则行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-03-05 11:00:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.tax-info';

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
    pageSize: 5,
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
        type: FieldType.number,
      },
      {
        name: 'rulesHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyName',
        type: FieldType.string,
      },
      {
        name: 'operationTypeCode',
        label: intl.get(`${modelCode}.view.operationTypeCode`).d('操作类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.OPERATION_TYPE',
        required: true,
      },
      {
        name: 'employeeNumObj',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工号'),
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
        type: FieldType.number,
        bind: 'employeeNumObj.employeeId',
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('姓名'),
        type: FieldType.string,
        bind: 'employeeNumObj.employeeName',
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('编号'),
        type: FieldType.string,
        bind: 'employeeNumObj.employeeNum',
      },
      {
        name: 'qualifiedAuditorObj',
        label: intl.get(`${modelCode}.view.qualifiedAuditorObj`).d('限定审核人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
      },
      {
        name: 'qualifiedAuditorIds',
        type: FieldType.number,
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
        label: intl.get(`${modelCode}.view.applyBusinessCode`).d('限定业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get(`${modelCode}.view.purchaseInvoiceFlag`).d('默认收购发票'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: '',
        defaultValue: '',
      },
      {
        name: 'limitInvoiceTypeObj',
        label: intl.get(`${modelCode}.view.limitInvoiceType`).d('限定开票种类'),
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
        label: intl.get(`${modelCode}.view.defaultInvoiceType`).d('默认开票种类'),
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
        label: intl.get(`${modelCode}.view.limitExtensionCode`).d('限定分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
        cascadeMap: { companyId: 'companyId' },
        textField: 'extNumber',
        ignore: FieldIgnore.always,
      },
      {
        name: 'limitExtensionCode',
        label: intl.get(`${modelCode}.view.limitExtensionCode`).d('限定分机号'),
        type: FieldType.string,
        bind: 'limitExtensionCodeObj.extNumber',
      },
      {
        name: 'printFileDownloadPath',
        label: intl.get(`${modelCode}.view.printFileDownloadPath`).d('发票打印路径'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('是否启用'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
  };
};
