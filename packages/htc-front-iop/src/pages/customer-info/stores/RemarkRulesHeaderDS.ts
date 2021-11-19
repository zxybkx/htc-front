/*
 * @Description:备注规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-09 10:33:24
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.remarkRules';

export default (dsProps): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28946` || '';
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { customerInformationId } = dsProps;

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/dynamic-remark-generation-ruless/select-by-customer`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            // ...config.params,
            customerInformationId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/dynamic-remark-generation-ruless/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    primaryKey: 'customerInformationId',
    fields: [
      {
        name: 'customerInformationId',
        type: FieldType.number,
        defaultValue: customerInformationId,
      },
      {
        name: 'dynamicRemarkGenerationRulesId',
        type: FieldType.number,
      },
      {
        name: 'dynamicRemarksRulePrefix',
        label: intl.get(`${modelCode}.view.dynamicRemarksRulePrefix`).d('动态备注规则-前缀'),
        type: FieldType.string,
        labelWidth: '150',
      },
      {
        name: 'dynamicRemarksRulePrefixOne',
        label: intl.get(`${modelCode}.view.dynamicRemarksRulePrefixOne`).d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'dynamicRemarksRulePrefixTwo',
        label: intl.get(`${modelCode}.view.dynamicRemarksRulePrefixTwo`).d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'dynamicRemarksRulePrefixThree',
        label: intl.get(`${modelCode}.view.dynamicRemarksRulePrefixThree`).d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'dynamicRemarksRulePrefixFour',
        label: intl.get(`${modelCode}.view.dynamicRemarksRulePrefixFour`).d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'enableApplySourceAsDynamic',
        label: intl
          .get(`${modelCode}.view.enableApplySourceAsDynamic`)
          .d('启用申请来源单号字段作为动态备注'),
        type: FieldType.boolean,
        labelWidth: '220',
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplySourceAsDynamicOne',
        label: intl
          .get(`${modelCode}.view.enableApplySourceAsDynamicOne`)
          .d('启用申请来源1字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplySourceAsDynamicTwo',
        label: intl
          .get(`${modelCode}.view.enableApplySourceAsDynamicTwo`)
          .d('启用申请来源2字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplySourceAsDynamicThree',
        label: intl
          .get(`${modelCode}.view.enableApplySourceAsDynamicThree`)
          .d('启用申请来源3字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplySourceAsDynamicFour',
        label: intl
          .get(`${modelCode}.view.enableApplySourceAsDynamicFour`)
          .d('启用申请来源4字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
    ],
  };
};
