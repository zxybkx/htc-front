/*
 * @Description:接口单据明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2020-09-17 10:01:01
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.interface-doc';

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IVP_API}-28651` || '';
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/interface-document-detailss`;
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
      submit: ({ data, params }) => {
        // const { companyCode } = data[0];
        return {
          url: `${API_PREFIX}/v1/${tenantId}/document-relation/add-document-number`,
          data,
          params,
          method: 'POST',
        };
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
        name: 'docTypeLineId',
        type: FieldType.number,
      },
      {
        name: 'docTypeHeaderId',
        type: FieldType.number,
      },
      {
        name: 'orderSeq',
        label: intl.get(`${modelCode}.view.orderSeq`).d('排序号'),
        type: FieldType.string,
      },
      {
        name: 'companyObj',
        label: intl.get(`${modelCode}.view.companyObj`).d('公司全称'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_NAME',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: 'companyObj.companyId',
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObj.companyCode',
      },
      {
        name: 'companyDescription',
        label: intl.get(`${modelCode}.view.companyDescription`).d('公司'),
        type: FieldType.string,
        required: true,
        bind: 'companyObj.companyName',
      },
      {
        name: 'documentNumber',
        label: intl.get(`${modelCode}.view.documentNumber`).d('单据编号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'documentSourceId',
        label: intl.get(`${modelCode}.view.documentSourceId`).d('对接系统单据ID'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceKey',
        label: intl.get(`${modelCode}.view.documentSourceKey`).d('单据关键字'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'documentRemark',
        label: intl.get(`${modelCode}.view.documentRemark`).d('单据描述'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'relationStateCode',
        label: intl.get(`${modelCode}.view.relationStateCode`).d('关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
        defaultValue: '0',
      },
      {
        name: 'relationInvoiceQuantity',
        label: intl.get(`${modelCode}.view.relationInvoiceQuantity`).d('关联发票数量'),
        type: FieldType.number,
      },
      {
        name: 'sourceTypeCode',
        label: intl.get(`${modelCode}.view.sourceTypeCode`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_FROM_TYPE',
      },
      {
        name: 'recordCreateDate',
        label: intl.get(`${modelCode}.view.recordCreateDate`).d('记录新增时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'recordUpdateDate',
        label: intl.get(`${modelCode}.view.recordUpdateDate`).d('记录更新时间'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'systemCode',
        label: intl.get(`${modelCode}.view.systemCode`).d('系统代码'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        readOnly: true,
        required: true,
      },
      {
        name: 'systemName',
        label: intl.get(`${modelCode}.view.systemName`).d('系统名称'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        readOnly: true,
        required: true,
      },
      {
        name: 'documentTypeCode',
        label: intl.get(`${modelCode}.view.documentTypeCode`).d('单据类型代码'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        readOnly: true,
        required: true,
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get(`${modelCode}.view.documentTypeMeaning`).d('单据类型名称'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
        readOnly: true,
        required: true,
      },
      {
        name: 'companyObj',
        label: intl.get(`${modelCode}.view.company`).d('所属公司'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPANY_NAME',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: 'companyObj.companyId',
      },
      {
        name: 'documentNumber',
        label: intl.get(`${modelCode}.view.documentNumber`).d('单据编号'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceKey',
        label: intl.get(`${modelCode}.view.documentSourceKey`).d('单据关键字'),
        type: FieldType.string,
      },
      {
        name: 'sourceTypeCode',
        label: intl.get(`${modelCode}.view.sourceTypeCode`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_FROM_TYPE',
      },
      {
        name: 'documentRemark',
        label: intl.get(`${modelCode}.view.documentRemark`).d('单据描述'),
        type: FieldType.string,
      },
      {
        name: 'relationStateCode',
        label: intl.get(`${modelCode}.view.relationStateCode`).d('关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
        defaultValue: '0',
        multiple: ',',
      },
    ],
  };
};
