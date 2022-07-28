/**
 * stores - 自动催收规则维护头
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:04
 * @LastEditeTime: 2022-06-20 15:05
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import { phoneReg } from '@htccommon/utils/utils';
import { EMAIL } from 'utils/regExp';

const modelCode = 'hmdm.automatic-collection-manage-detail';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  const tenantId = getCurrentOrganizationId();
  const commonReq: any = ({ data, params }) => {
    return {
      url: `${API_PREFIX}/v1/${tenantId}/company-list-infos/batch-save`,
      data,
      params,
      method: 'POST',
    };
  };
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/company-list-infos`;
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
      update: ({ data, params }) => {
        return commonReq({ data, params });
      },
      create: ({ data, params }) => {
        return commonReq({ data, params });
      },
    },
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    pageSize: 10,
    primaryKey: 'companyId',
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'tenantId',
        label: intl.get(`${modelCode}.view.tenantId`).d('创建日期'),
        type: FieldType.date,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('自动发送时间'),
        type: FieldType.date,
      },
      {
        name: 'companyShortName',
        label: intl.get(`${modelCode}.view.companyShortName`).d('催收状态'),
        type: FieldType.string,
        lookupCode: '',
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('租户联系人'),
        type: FieldType.string,
      },
      {
        name: 'companyAddressPhone',
        label: intl.get(`${modelCode}.view.companyAddressPhone`).d('联系人电子邮箱'),
        type: FieldType.string,
      },
      {
        name: 'bankNumber',
        label: intl.get(`${modelCode}.view.bankNumber`).d('联系人电话'),
        type: FieldType.string,
      },
      {
        name: 'competentTaxAuthoritiesInfo',
        label: intl.get(`${modelCode}.view.competentTaxAuthorities`).d('协议起始日'),
        type: FieldType.date,
      },
      {
        name: 'xydqr',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('协议到期日'),
        type: FieldType.date,
      },
      {
        name: 'zhhznr',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('租户汇总提醒内容'),
        type: FieldType.string,
      },
      {
        name: 'txms',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('提醒模式'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('是否发送管理员'),
        type: FieldType.boolean,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
      },
      {
        name: 'phone',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('发送人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        computedProps: {
          readOnly: ({ record }) => record.get('enabledFlag') === 1,
          required: ({ record }) => !record.get('email'),
        },
      },
      {
        name: 'email',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('发送人邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        computedProps: {
          readOnly: ({ record }) => record.get('enabledFlag') === 1,
          required: ({ record }) => !record.get('phone'),
        },
      },
      {
        name: 'csr',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('催收人'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'tenantObject',
          label: intl.get(`${modelCode}.view.tenantObject`).d('租户名称'),
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
          name: 'cszt',
          label: intl.get(`${modelCode}.view.fslx`).d('催收状态'),
          type: FieldType.string,
          lookupCode: '',
        },
        {
          name: 'xyjsrc',
          label: intl.get(`${modelCode}.view.fslx`).d('协议结束日从'),
          type: FieldType.date,
          labelWidth: '120',
        },
        {
          name: 'xyjsrd',
          label: intl.get(`${modelCode}.view.fslx`).d('协议结束日到'),
          type: FieldType.date,
          labelWidth: '120',
        },
        {
          name: 'cjrqc',
          label: intl.get(`${modelCode}.view.fslx`).d('创建日期从'),
          type: FieldType.date,
          labelWidth: '120',
        },
        {
          name: 'cjrqd',
          label: intl.get(`${modelCode}.view.fslx`).d('创建日期到'),
          type: FieldType.date,
        },
        {
          name: 'fsrqc',
          label: intl.get(`${modelCode}.view.fslx`).d('发送日期从'),
          type: FieldType.date,
        },
        {
          name: 'fsrqd',
          label: intl.get(`${modelCode}.view.fslx`).d('发送日期到'),
          type: FieldType.date,
        },
      ],
    }),
  };
};
