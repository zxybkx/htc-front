/*
 * @Description:当期勾选(取消)可认证发票-已认证详情(实时)
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-10-19 11:07:33
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';

const modelCode = 'hivp.checkCertification';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const monthStart = dsParams.currentPeriod && moment(dsParams.currentPeriod).startOf('month');
  const monthEnd = dsParams.currentPeriod && moment(dsParams.currentPeriod).endOf('month');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-operation/certified-detail-list`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            companyId: dsParams.companyId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: '',
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        required: true,
        transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.view.buyerTaxNo').d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('htc.common.view.salerTaxNo').d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.	view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'checkState',
        label: intl.get(`${modelCode}.view.checkState`).d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'checkDate',
        label: intl.get(`${modelCode}.view.checkTime`).d('勾选时间'),
        type: FieldType.date,
      },
      {
        name: 'authenticationState',
        label: intl.get(`${modelCode}.view.authenticationState`).d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
      },
      {
        name: 'authenticationType',
        label: intl.get(`${modelCode}.view.authenticationType`).d('认证类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'infoSource',
        label: intl.get(`${modelCode}.view.infoSource`).d('信息来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.FROM_TYPE',
      },
      {
        name: 'taxBureauManageState',
        label: intl.get(`${modelCode}.view.managementState`).d('管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'authenticationDateObj') {
            const oauthenticationDate = dsParams.currentPeriod;
            const authenticationDate = record.get('authenticationDate');
            const { currentPeriod } = value;
            record.set('checkTimeFrom', moment(currentPeriod).startOf('month'));
            record.set('checkTimeTo', moment(currentPeriod).endOf('month'));
            if (authenticationDate === oauthenticationDate) {
              record.set('authenticationState', dsParams.currentCertState);
            } else {
              record.set('authenticationState', '');
            }
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.object,
          ignore: FieldIgnore.always,
          defaultValue: dsParams && dsParams.companyDesc,
          required: true,
          readOnly: true,
        },
        {
          name: 'authenticationDateObj',
          label: intl.get(`${modelCode}.view.authenticationDateObj`).d('认证所属期'),
          type: FieldType.object,
          lovCode: 'HIVP.BUSINESS_TIME_INFO',
          defaultValue: dsParams && dsParams.currentPeriod,
          lovPara: { companyId: dsParams.companyId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'authenticationDate',
          type: FieldType.string,
          bind: 'authenticationDateObj.currentPeriod',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'authenticationDateObj.companyId',
        },
        {
          name: 'authenticationState',
          label: intl.get(`${modelCode}.view.currentCertState`).d('当期认证状态'),
          type: FieldType.string,
          readOnly: true,
          lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
          defaultValue: dsParams && dsParams.currentCertState,
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxAuthorityCode',
          label: intl.get(`${modelCode}.view.taxAuthorityCode`).d('主管机构代码'),
          type: FieldType.string,
          readOnly: true,
          defaultValue: dsParams && dsParams.competentTaxAuthorities,
          ignore: FieldIgnore.always,
        },
        {
          name: 'fply',
          label: intl.get(`${modelCode}.view.fply`).d('发票用途'),
          type: FieldType.string,
          lookupCode: 'HIVP.INVOICE_CHECK_FOR',
          defaultValue: 0,
          ignore: FieldIgnore.always,
        },
        {
          name: 'salerTaxNo',
          label: intl.get('htc.common.view.salerTaxNo').d('销方纳税识别号'),
          type: FieldType.string,
        },
        {
          name: 'invoiceCode',
          label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'checkTimeFrom',
          label: intl.get(`${modelCode}.view.checkTimeFrom`).d('勾选日期从'),
          type: FieldType.date,
          defaultValue: monthStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'checkTimeTo',
          label: intl.get(`${modelCode}.view.checkTimeTo`).d('勾选日期至'),
          type: FieldType.date,
          defaultValue: monthEnd,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
      ],
    }),
  };
};
