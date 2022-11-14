/**
 * @Description:备注规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-09 10:33:24
 * @LastEditTime: 2022-06-15 14:02
 * @Copyright: Copyright (c) 2021, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (dsProps): DataSetProps => {
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
        type: FieldType.string,
        defaultValue: customerInformationId,
      },
      {
        name: 'htcDynamicRemarkRulesId',
        type: FieldType.string,
      },
      {
        name: 'remarksRulePrefix',
        label: intl.get('hiop.customerInfo.modal.remarksRulePrefix').d('动态备注规则-前缀'),
        type: FieldType.string,
        labelWidth: '150',
      },
      {
        name: 'remarksRulePrefix1',
        label: intl.get('hiop.customerInfo.modal.remarksRulePrefix').d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'remarksRulePrefix2',
        label: intl.get('hiop.customerInfo.modal.remarksRulePrefix').d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'remarksRulePrefix3',
        label: intl.get('hiop.customerInfo.modal.remarksRulePrefix').d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'remarksRulePrefix4',
        label: intl.get('hiop.customerInfo.modal.remarksRulePrefix').d('动态备注规则-前缀'),
        type: FieldType.string,
      },
      {
        name: 'enableSourceAsDynamic',
        label: intl
          .get('hiop.customerInfo.modal.enableSourceAsDynamic')
          .d('启用申请来源单号字段作为动态备注'),
        type: FieldType.boolean,
        labelWidth: '220',
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableSourceAsDynamic1',
        label: intl
          .get('hiop.customerInfo.modal.enableSourceAsDynamic1')
          .d('启用申请来源1字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableSourceAsDynamic2',
        label: intl
          .get('hiop.customerInfo.modal.enableSourceAsDynamic2')
          .d('启用申请来源2字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableSourceAsDynamic3',
        label: intl
          .get('hiop.customerInfo.modal.enableSourceAsDynamic3')
          .d('启用申请来源3字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableSourceAsDynamic4',
        label: intl
          .get('hiop.customerInfo.modal.enableSourceAsDynamic4')
          .d('启用申请来源4字段作为动态备注'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
    ],
  };
};
