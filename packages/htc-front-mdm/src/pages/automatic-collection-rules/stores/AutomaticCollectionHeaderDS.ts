/**
 * stores - 自动催收规则维护头
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:04
 * @LastEditeTime: 2022-06-20 15:12
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import { phoneReg } from '@htccommon/utils/utils';
import { EMAIL } from 'utils/regExp';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/auto-con-infos/get-configure-header`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/auto-con-infos/save-configure-header`,
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
    primaryKey: 'collectionRulesHeader',
    fields: [
      {
        name: 'tenantObject',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        computedProps: {
          readOnly: ({ record }) => record.get('ruleScope') === 'PLATFORM',
          required: ({ record }) => record.get('ruleScope') === 'TENANT',
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        label: intl.get('htc.common.modal.tenantId').d('租户ID'),
        type: FieldType.string,
        bind: `tenantObject.tenantId`,
        readOnly: true,
      },
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
        bind: `tenantObject.tenantName`,
      },
      {
        name: 'ruleScope',
        label: intl.get('hmdm.automaticCollection.view.ruleScope').d('规则适用范围'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.RULE_SCOPE',
        required: true,
      },
      {
        name: 'sendType',
        label: intl.get('hmdm.automaticCollection.view.sendType').d('发送类型'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.SEND_TYPE',
        required: true,
      },
      {
        name: 'remind',
        label: intl.get('hmdm.automaticCollection.view.remind').d('提醒频率'),
        type: FieldType.number,
      },
      {
        name: 'persons',
        label: intl.get('hmdm.automaticCollection.view.persons').d('负责人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'personPhone',
        label: intl.get('hmdm.automaticCollection.view.personPhone').d('负责人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        required: true,
      },
      {
        name: 'personEmail',
        label: intl.get('hmdm.automaticCollection.view.personEmail').d('负责人邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'receiver',
        label: intl.get('hmdm.automaticCollection.view.receiver').d('接收人'),
        type: FieldType.string,
      },
      {
        name: 'receiverPhone',
        label: intl.get('hmdm.automaticCollection.view.receiverPhone').d('接收人电话'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'receiverEmail',
        label: intl.get('hmdm.automaticCollection.view.recipientEmail').d('接收人邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
      },
      {
        name: 'flag',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('是否启用'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'tenantObject',
          label: intl.get('htc.common.view.tenantName').d('租户名称'),
          type: FieldType.object,
          lovCode: 'HPFM.TENANT',
          ignore: FieldIgnore.always,
        },
        {
          name: 'tenantId',
          type: FieldType.string,
          bind: `tenantObject.tenantId`,
        },
        {
          name: 'personCharge',
          label: intl.get('hmdm.automaticCollection.view.persons').d('负责人'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
