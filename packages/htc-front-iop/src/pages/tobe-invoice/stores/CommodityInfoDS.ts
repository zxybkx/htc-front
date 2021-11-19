/**
 * @Description:商品信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-22 09:56:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.tobe-invoice';

export default (urlParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { companyId, companyCode, employeeNumber } = urlParams || {};
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { invoiceInfo } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/query-good`;
        const axiosConfig: AxiosRequestConfig = {
          url,
          params: {
            companyId,
            companyCode,
            employeeNumber,
          },
          data: invoiceInfo,
          method: 'POST',
        };
        return axiosConfig;
      },
      submit: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/save-good`,
          data: data[0],
          params: {
            companyId,
            companyCode,
            employeeNumber,
          },
          method: 'POST',
        };
      },
    },
    primaryKey: 'invoiceWorkbenchId',
    events: {
      update: ({ record, name, value }) => {
        // 商品编码
        if (name === 'commodityObj') {
          record.set({
            projectName: `*${record.get('commodityServiceCateCode') || ''}*${
              record.get('commodityName') || ''
            }`,
            commodityName: value && value.commodityName,
          });
        }
        // 零税率标识(zeroTaxRateFlag)、税率（taxRate）、优惠政策标识（preferentialPolicyFlag）
        if (name === 'zeroTaxRateFlag') {
          if (['0', '1', '2'].includes(value)) {
            record.set('preferentialPolicyFlag', '1');
          } else {
            record.set('preferentialPolicyFlag', '0');
          }
        }
        if (['commodityName', 'commodityServiceCateCode'].includes(name)) {
          record.set(
            'projectName',
            `*${record.get('commodityServiceCateCode') || ''}*${record.get('commodityName') || ''}`
          );
        }
      },
    },
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('物料编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'materialDescription',
        label: intl.get(`${modelCode}.view.materialDescription`).d('物料描述'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'commodityObj',
        label: intl.get(`${modelCode}.view.commodityObj`).d('商品编码'),
        type: FieldType.object,
        lovCode: 'HIOP.GOODS_TAX_CODE',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        lovPara: { customerName: '123' },
        ignore: FieldIgnore.always,
        textField: 'commodityNumber',
      },
      {
        name: 'commodityNumber',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.string,
        bind: 'commodityObj.commodityNumber',
        required: true,
      },
      {
        name: 'commodityServiceCateCode',
        label: intl.get(`${modelCode}.view.commodityServiceCateCode`).d('商品和服务分类简称'),
        type: FieldType.string,
        labelWidth: '150',
        bind: 'commodityObj.abbreviation',
        required: true,
      },
      {
        name: 'commodityName',
        label: intl.get(`${modelCode}.view.commodityName`).d('开具名称'),
        type: FieldType.string,
        bind: 'commodityObj.commodityName',
        required: true,
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('票面项目名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
          readOnly: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) !== 0,
        },
      },
      {
        name: 'model',
        label: intl.get(`${modelCode}.view.model`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'projectUnit',
        label: intl.get(`${modelCode}.view.projectUnit`).d('开票单位'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('quantity'),
        },
      },
      {
        name: 'specialManagementVat',
        label: intl.get(`${modelCode}.view.specialManagementVat`).d('增值税特殊管理'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
