/**
 * stores - 自动催收规则维护头
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:04
 * @LastEditeTime: 2022-06-20 15:05
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
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hmdm.automatic-collection-manage-list';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/auto-con-infos/get-all-info`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: { ...config.params, enabledFlag: 1 },
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/auto-con-infos/batch-save`,
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
    primaryKey: 'autoInfoId',
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'sendTime',
        label: intl.get(`${modelCode}.view.sendTime`).d('发送时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'collectionStatus',
        label: intl.get(`${modelCode}.view.collectionStatus`).d('催收状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.DUNNING_STATUS',
      },
      {
        name: 'receiver',
        label: intl.get(`${modelCode}.view.receiver`).d('接收人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiverEmail',
        label: intl.get(`${modelCode}.view.receiverEmail`).d('接收人电子邮箱'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiverPhone',
        label: intl.get(`${modelCode}.view.receiverPhone`).d('接收人电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'agreementStartDate',
        label: intl.get(`${modelCode}.view.agreementStartDate`).d('协议起始日'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'agreementEndDate',
        label: intl.get('hiop.invoiceRule.modal.agreementEndDate').d('协议到期日'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'fileUrl',
        label: intl.get('hiop.invoiceRule.modal.remind').d('提醒内容'),
        type: FieldType.string,
      },
      {
        name: 'remindMode',
        label: intl.get('hiop.invoiceRule.modal.remindMode').d('提醒模式'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.REMIND_MODE',
      },
      {
        name: 'personPhone',
        label: intl.get('hiop.invoiceRule.modal.personPhone').d('负责人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        required: true,
      },
      {
        name: 'personEmail',
        label: intl.get('hiop.invoiceRule.modal.personEmail').d('负责人邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'persons',
        label: intl.get('hiop.invoiceRule.modal.persons').d('负责人'),
        type: FieldType.string,
        required: true,
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
          name: 'tenantName',
          label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
          type: FieldType.string,
          bind: `tenantObject.tenantName`,
        },
        {
          name: 'companyNameObject',
          label: intl.get(`${modelCode}.view.companyNameObject`).d('公司名称'),
          type: FieldType.object,
          lovCode: 'HMDM.COMPANY_INFO_SITE',
          cascadeMap: { organizationId: 'tenantId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: `companyNameObject.companyCode`,
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: `companyNameObject.companyName`,
        },
        // {
        //   name: 'agreementCompanyId',
        //   type: FieldType.number,
        //   bind: `companyNameObject.agreementCompanyId`,
        // },
        {
          name: 'persons',
          type: FieldType.string,
          label: intl.get(`${modelCode}.view.persons`).d('负责人'),
        },
        {
          name: 'agreementStart',
          label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('协议起始日从到'),
          type: FieldType.date,
          range: ['agreementStartDateStart', 'agreementStartDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'agreementStartDateStart',
          label: intl.get(`${modelCode}.view.agreementStartDateStart`).d('协议起始日从'),
          type: FieldType.date,
          labelWidth: '120',
          bind: 'agreementStart.agreementStartDateStart',
        },
        {
          name: 'agreementStartDateEnd',
          label: intl.get(`${modelCode}.view.agreementStartDateEnd`).d('协议起始日到'),
          type: FieldType.date,
          bind: 'agreementStart.agreementStartDateEnd',
        },
        {
          name: 'agreementEndDate',
          label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('协议到期日从到'),
          type: FieldType.date,
          range: ['agreementEndDateStart', 'agreementEndDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'agreementEndDateStart',
          label: intl.get(`${modelCode}.view.fslx`).d('协议到期日从'),
          type: FieldType.date,
          bind: 'agreementEndDate.agreementEndDateStart',
        },
        {
          name: 'agreementEndDateEnd',
          label: intl.get(`${modelCode}.view.agreementEndDateEnd`).d('协议到期日到'),
          type: FieldType.date,
          bind: 'agreementEndDate.agreementEndDateEnd',
        },
        {
          name: 'createDate',
          label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('创建日期从到'),
          type: FieldType.date,
          range: ['createDateStart', 'createDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'createDateStart',
          label: intl.get(`${modelCode}.view.createDateStart`).d('创建日期从'),
          type: FieldType.date,
          bind: 'createDate.createDateStart',
        },
        {
          name: 'createDateEnd',
          label: intl.get(`${modelCode}.view.createDateEnd`).d('创建日期到'),
          type: FieldType.date,
          bind: 'createDate.createDateEnd',
        },
        {
          name: 'SendTime',
          label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('发送日期从到'),
          type: FieldType.date,
          range: ['startSendTime', 'endSendTime'],
          labelWidth: '130',
          ignore: FieldIgnore.always,
        },
        {
          name: 'startSendTime',
          label: intl.get(`${modelCode}.view.startSendTime`).d('发送日期从'),
          type: FieldType.date,
          bind: 'SendTime.startSendTime',
        },
        {
          name: 'endSendTime',
          label: intl.get(`${modelCode}.view.endSendTime`).d('发送日期到'),
          type: FieldType.date,
          bind: 'SendTime.endSendTime',
        },
        {
          name: 'collectionStatus',
          label: intl.get(`${modelCode}.view.collectionStatus`).d('催收状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HMDM.DUNNING_STATUS',
        },
        {
          name: 'remindMode',
          label: intl.get(`${modelCode}.view.remindMode`).d('提醒模式'),
          type: FieldType.string,
          lookupCode: 'HTC.HMDM.REMIND_MODE',
        },
        // {
        //   name: 'enabledFlag',
        //   type: FieldType.number,
        //   defaultValue: 1,
        // },
      ],
    }),
  };
};
