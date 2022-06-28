/**
 * Description: 公司列表
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.company-list';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  const tenantId = getCurrentOrganizationId();

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
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/company-list-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/company-list-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      create: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/company-list-infos/batch-save`,
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
    selection: DataSetSelection.multiple,
    primaryKey: 'companyId',
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyInfo',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司信息'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyNameInfo',
        label: intl.get(`${modelCode}.view.companyNameInfo`).d('公司名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司全称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyShortName',
        label: intl.get(`${modelCode}.view.companyShortName`).d('公司简称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyAddressPhone',
        label: intl.get(`${modelCode}.view.companyAddressPhone`).d('地址、电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'bankNumber',
        label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'competentTaxAuthoritiesInfo',
        label: intl.get(`${modelCode}.view.competentTaxAuthorities`).d('主管税务机关代码/名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'competentTaxAuthoritiesObject',
        label: intl.get(`${modelCode}.view.competentTaxAuthorities`).d('主管税务机关代码'),
        type: FieldType.object,
        lovCode: 'HMDM.COMPETENT_TAX_AUTHORITIES',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
      },
      {
        name: 'competentTaxAuthorities',
        type: FieldType.string,
        bind: 'competentTaxAuthoritiesObject.value',
      },
      {
        name: 'competentTaxAuthoritiesMeaning',
        label: intl.get(`${modelCode}.view.competentTaxAuthoritiesMeaning`).d('主管税务机关名称'),
        type: FieldType.string,
        bind: 'competentTaxAuthoritiesObject.meaning',
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('公司状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'dateInfo',
        label: intl.get(`${modelCode}.view.startDate`).d('创建日期/修改日期'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.startDate`).d('有效期从'),
        type: FieldType.date,
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'endDate',
        label: intl.get(`${modelCode}.view.endDate`).d('有效期至'),
        type: FieldType.date,
        min: 'startDate',
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('新增日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get(`${modelCode}.view.lastUpdateDate`).d('修改日期'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'companyNameObject',
        label: intl.get(`${modelCode}.view.companyName`).d('公司全称'),
        type: 'object' as FieldType,
        lovCode: 'HMDM.COMPANY_NAME',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: `companyNameObject.companyId`,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('是否启用'),
        type: FieldType.number,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
  };
};
