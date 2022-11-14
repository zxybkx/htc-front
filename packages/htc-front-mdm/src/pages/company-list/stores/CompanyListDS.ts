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
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/company-list-infos/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      update: commonReq,
      create: commonReq,
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
        type: FieldType.string,
      },
      {
        name: 'companyInfo',
        label: intl.get('hmdm.companyList.view.companyInfo').d('公司信息'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyNameInfo',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyName',
        label: intl.get('hivp.documentType.view.companyObj').d('公司全称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyShortName',
        label: intl.get('hmdm.applyTenant.view.companyShort').d('公司简称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'bankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'competentTaxAuthoritiesInfo',
        label: intl
          .get('hmdm.companyList.view.competentTaxAuthoritiesInfo')
          .d('主管税务机关代码/名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'competentTaxAuthoritiesObject',
        label: intl.get('hcan.invoiceDetail.view.taxAuthorityCode').d('主管税务机关代码'),
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
        label: intl.get('hcan.invoiceDetail.view.taxAuthorityName').d('主管税务机关名称'),
        type: FieldType.string,
        bind: 'competentTaxAuthoritiesObject.meaning',
      },
      {
        name: 'enabledFlag',
        label: intl.get('hmdm.companyList.view.enabledFlag').d('公司状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'dateInfo',
        label: intl.get('hmdm.companyList.view.createAndEditDate').d('创建日期/修改日期'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'startDate',
        label: intl.get('hmdm.companyList.view.startDate').d('有效期从'),
        type: FieldType.date,
        defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'endDate',
        label: intl.get('hmdm.companyList.view.endDate').d('有效期至'),
        type: FieldType.date,
        min: 'startDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'creationDate',
        label: intl.get('hmdm.companyList.view.creationDate').d('新增日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get('hmdm.companyList.view.lastUpdateDate').d('修改日期'),
        type: FieldType.dateTime,
      },
    ],
    queryFields: [
      {
        name: 'companyCode',
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
        type: FieldType.number,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
  };
};
