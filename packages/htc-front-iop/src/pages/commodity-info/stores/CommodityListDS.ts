/*
 * @Descripttion:开票商品信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-01-26 14:44:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, DataSetSelection, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.commodity-info';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/commodity-list-infos`;
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
          url: `${API_PREFIX}/v1/${tenantId}/commodity-list-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/commodity-list-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'commodityId',
    events: {
      update: ({ record, name, value }) => {
        // 优惠政策标识
        if (name === 'zeroTaxRateFlag') {
          if (['0', '1', '2'].includes(value)) {
            record.set('preferentialPolicyFlag', '1');
          } else {
            record.set('preferentialPolicyFlag', '0');
          }
        }
        if (name === 'taxRate') {
          if (!value || Number(value) !== 0) {
            record.set('zeroTaxRateFlag', '');
          }
        }
      },
    },
    fields: [
      {
        name: 'commodityId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'sourceCode',
        label: intl.get(`${modelCode}.view.sourceCode`).d('来源'),
        type: FieldType.string,
        lookupCode: 'HIOP.COMMODITY_INFO_FROM',
        required: true,
        defaultValue: 'MANUAL',
      },
      {
        name: 'originSpId',
        label: intl.get(`${modelCode}.view.originSpId`).d('初始记录ID'),
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('项目编码（自行编码）'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'model',
        label: intl.get(`${modelCode}.view.model`).d('型号'),
        type: FieldType.string,
      },
      {
        name: 'projectUnit',
        label: intl.get(`${modelCode}.view.projectUnit`).d('项目单位'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'projectUnitPrice',
        label: intl.get(`${modelCode}.view.projectUnitPrice`).d('项目单价'),
        type: FieldType.currency,
        defaultValue: 0,
        min: 0,
        // required: true,
      },
      {
        name: 'commodityObj',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.object,
        lovCode: 'HIOP.GOODS_TAX_CODE',
        cascadeMap: { companyId: 'companyId' },
        lovPara: { companyCode: 'CZSP', customerName: '123' },
        ignore: FieldIgnore.always,
        textField: 'commodityNumber',
        required: true,
      },
      {
        name: 'commodityNumber',
        label: intl.get(`${modelCode}.view.commodityNumber`).d('商品编码'),
        type: FieldType.string,
        bind: 'commodityObj.commodityNumber',
        required: true,
      },
      {
        name: 'commodityName',
        label: intl.get(`${modelCode}.view.commodityName`).d('商品名称'),
        type: FieldType.string,
        bind: 'commodityObj.commodityName',
      },
      {
        name: 'commodityServiceCateCode',
        label: intl.get(`${modelCode}.view.commodityServiceCateCode`).d('商品和服务分类简称'),
        type: FieldType.string,
        bind: 'commodityObj.abbreviation',
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        // dynamicProps: {
        //   required: ({ record }) => record.get('taxRate') &&Number(record.get('taxRate')) === 0,
        // },
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
        name: 'specialManagementVat',
        label: intl.get(`${modelCode}.view.specialManagementVat`).d('增值税特殊管理'),
        type: FieldType.string,
        bind: 'commodityObj.specialVatManagement',
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_RATE',
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            record.set({
              taxpayerNumber: value.taxpayerNumber,
              // taxpayerName: value.companyName,
            });
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('公司名称'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
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
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          required: true,
          ignore: FieldIgnore.always,
        },
        // {
        //   name: 'companyName',
        //   label: intl.get(`${modelCode}.view.companyName`).d('纳税人名称'),
        //   type: FieldType.string,
        //   readOnly: true,
        //   required: true,
        //   ignore: FieldIgnore.always,
        // },
        {
          name: 'projectName',
          label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
          type: FieldType.string,
        },
        {
          name: 'commodityName',
          label: intl.get(`${modelCode}.view.commodityName`).d('商品名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
