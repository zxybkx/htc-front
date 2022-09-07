/*
 * @Description:发票池-单据关联
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-07-26 16:20:05
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';

const modelCode = 'hivp.invoicesDocRelated';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/document-relation/select-relation-document`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
            sourceCode: dsParams.sourceCode,
            invoicePoolHeaderId: dsParams.sourceHeaderId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      create: ({ data, params }) => {
        const { companyCode, employeeNumber } = data[0];
        return {
          url: `${API_PREFIX}/v1/${tenantId}/document-relation/add-detail`,
          data,
          params: {
            ...params,
            companyCode,
            employeeNumber,
          },
          method: 'POST',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/interface-document-detailss/batch-save`,
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
    feedback: {
      submitSuccess: resp => {
        if (resp.content && resp.content[0]) {
          if (resp.content[0].status === '1000') {
            notification.success({
              description: '',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
              placement: 'bottomRight',
            });
          } else {
            notification.error({
              description: '',
              placement: 'bottomRight',
              message: resp.content[0].message,
            });
          }
        }
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'detailId',
    fields: [
      {
        name: 'detailId',
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'invoicePoolHeaderId',
        type: FieldType.number,
      },
      {
        name: 'systemObj',
        label: intl.get('hivp.invoicesArchiveUpload.view.systemName').d('对接系统'),
        type: FieldType.object,
        lovCode: 'HIVP.SYSTEM_CODE',
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'systemCode',
        type: FieldType.string,
        bind: 'systemObj.systemCode',
      },
      {
        name: 'systemName',
        label: intl.get('hivp.invoicesArchiveUpload.view.systemName').d('对接系统'),
        type: FieldType.string,
        bind: 'systemObj.systemName',
      },
      {
        name: 'documentTypeObj',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.object,
        lovCode: 'HIVP.DOCUMENT_TYPE',
        cascadeMap: { systemCode: 'systemCode' },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCode',
        type: FieldType.string,
        bind: 'documentTypeObj.documentTypeCode',
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.string,
        bind: 'documentTypeObj.documentTypeMeaning',
      },
      {
        name: 'documentNumber',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'documentSourceId',
        label: intl.get(`hivp.invoicesArchiveUpload.view.documentSourceId`).d('对接系统单据ID'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceKey',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentSourceKey').d('单据关键字'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'documentRemark',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentRemark').d('单据描述'),
        type: FieldType.string,
      },
      {
        name: 'receiptsState',
        label: intl.get('hivp.checkCertification.view.receiptsState').d('关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
        defaultValue: '0',
      },
      {
        name: 'recordUpdateDate',
        label: intl.get(`${modelCode}.view.recordUpdateDate`).d('关联/失效日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.AssociatedEmployees`).d('关联员工'),
        type: FieldType.string,
      },
    ],
  };
};

const DocumentDS = (companyId): DataSetProps => {
  return {
    fields: [
      {
        name: 'documentObj',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号'),
        type: FieldType.object,
        lovCode: 'HIVP.RELATION_NO',
        lovPara: { companyId },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentNumber',
        type: FieldType.string,
        bind: 'documentObj.documentNumber',
      },
      {
        name: 'documentTypeCode',
        type: FieldType.string,
        bind: 'documentObj.documentTypeCode',
      },
      {
        name: 'systemCode',
        type: FieldType.string,
        bind: 'documentObj.systemCode',
      },
    ],
  };
};

export { DocumentDS };
