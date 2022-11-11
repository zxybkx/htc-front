/**
 * @Description: 租户协议维护
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import commonConfig from '@htccommon/config/commonConfig';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/tenant-agreementss`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            // tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/tenant-agreementss/batch-delete`,
          data,
          method: 'DELETE',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/tenant-agreementss/batch-saveOrUpdate`,
          data,
          params,
          method: 'POST',
        };
      },
      create: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/tenant-agreementss/batch-saveOrUpdate`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'agreementId',
    fields: [
      {
        name: 'agreementId',
        type: FieldType.string,
      },
      {
        name: 'tenantObject',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        bind: `tenantObject.tenantName`,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'enableDate',
        label: intl.get('hmdm.tenantAgreement.view.enableDate').d('启用日期'),
        type: FieldType.date,
        required: true,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'customerName',
        label: intl.get('hmdm.applyTenant.view.contractCustomerName').d('客户全称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'tenantContacts',
        label: intl.get('hmdm.applyTenant.view.tenantContacts').d('租户联系人'),
        type: FieldType.string,
      },
      {
        name: 'email',
        label: intl.get('hmdm.employeeInfo.view.email').d('电子邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
      },
      {
        name: 'contactPhone',
        label: intl.get('hmdm.tenantAgreement.view.phone').d('联系电话'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'startDate',
        label: intl.get('hmdm.automaticCollection.view.agreementStartDate').d('协议起始日'),
        type: FieldType.date,
        required: true,
        // defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        max: 'endDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'endDate',
        label: intl.get('hmdm.automaticCollection.view.agreementEndDate').d('协议到期日'),
        type: FieldType.date,
        required: true,
        // defaultValue: moment().format(DEFAULT_DATE_FORMAT),
        min: 'startDate',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'billDay',
        label: intl.get('hmdm.tenantAgreement.view.billDay').d('账单日'),
        type: FieldType.string,
        lookupCode: 'HMDM.BILL_DAY',
      },
      {
        name: 'billingCycle',
        label: intl.get('hmdm.tenantAgreement.view.billingCycle').d('账单周期'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.BILLING_CYCLE',
      },
      {
        name: 'billingModelCode',
        label: intl.get('hmdm.tenantAgreement.view.billingModelCode').d('账单模式'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.BILLING_MODEL',
      },
      {
        name: 'invoiceModelCode',
        label: intl.get('hmdm.tenantAgreement.view.invoiceModelCode').d('开票模式'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.INVOICE_MODEL',
      },
      {
        name: 'settlementModelCode',
        label: intl.get('hmdm.tenantAgreement.view.settlementModelCode').d('结算模式'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.SETTLEMENT_MODEL',
      },
      {
        name: 'contractNo',
        label: intl.get('hmdm.applyTenant.view.pmsContractNumber').d('PMS合同号'),
        type: FieldType.string,
      },
      {
        name: 'parentProjectNumber',
        label: intl.get('hmdm.tenantAgreement.view.parentProjectNumber').d('父项目编码'),
        type: FieldType.string,
      },
      {
        name: 'childrenProjectNumber',
        label: intl.get('hmdm.tenantAgreement.view.childrenProjectNumber').d('子项目编码'),
        type: FieldType.string,
      },
      {
        name: 'agreementNumber',
        label: intl.get('hmdm.tenantAgreement.view.agreementNumber').d('协议编号'),
        type: FieldType.string,
      },
      {
        name: 'collectionBalance',
        label: intl.get('hmdm.tenantAgreement.view.receicingBalance').d('收款余额'),
        type: FieldType.currency,
      },
      {
        name: 'effectiveStatusCode',
        label: intl.get('hmdm.tenantAgreement.view.effectiveStatusCode').d('生效状态'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HMDM.EFFECTIVE_STATUS',
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.model.remark').d('备注'),
        type: FieldType.string,
      },
    ],
    queryFields: [
      {
        name: 'enableDateFrom',
        label: intl.get('hmdm.tenantAgreement.view.enableDateFrom').d('启用日期从'),
        type: FieldType.date,
        max: 'enableDateTo',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'enableDateTo',
        label: intl.get('hmdm.tenantAgreement.view.enableDateTo').d('启用日期至'),
        type: FieldType.date,
        min: 'enableDateFrom',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: 'object' as FieldType,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: `tenantName.tenantId`,
      },
    ],
  };
};
