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
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
      },
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
        name: 'creationDate',
        label: intl.get('hmdm.automaticCollection.view.creationDate').d('创建日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'sendTime',
        label: intl.get('hmdm.automaticCollection.view.sendTime').d('发送时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'collectionStatus',
        label: intl.get('hmdm.automaticCollection.view.collectionStatus').d('催收状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.DUNNING_STATUS',
      },
      {
        name: 'receiver',
        label: intl.get('hmdm.automaticCollection.view.receiver').d('接收人'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiverEmail',
        label: intl.get('hmdm.automaticCollection.view.receiverEmail').d('接收人电子邮箱'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'receiverPhone',
        label: intl.get('hmdm.automaticCollection.view.receiverPhone').d('接收人电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'agreementStartDate',
        label: intl.get('hmdm.automaticCollection.view.agreementStartDate').d('协议起始日'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'agreementEndDate',
        label: intl.get('hmdm.automaticCollection.view.agreementEndDate').d('协议到期日'),
        type: FieldType.date,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'fileUrl',
        label: intl.get('hmdm.automaticCollection.view.fileUrl').d('提醒内容'),
        type: FieldType.string,
      },
      {
        name: 'remindMode',
        label: intl.get('hmdm.automaticCollection.view.remindMode').d('提醒模式'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.REMIND_MODE',
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
        name: 'persons',
        label: intl.get('hmdm.automaticCollection.view.persons').d('负责人'),
        type: FieldType.string,
        required: true,
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
          name: 'tenantName',
          label: intl.get('htc.common.view.tenantName').d('租户名称'),
          type: FieldType.string,
          bind: `tenantObject.tenantName`,
        },
        {
          name: 'companyNameObject',
          label: intl.get('htc.common.view.companyName').d('公司名称'),
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
          label: intl.get('hmdm.automaticCollection.view.persons').d('负责人'),
        },
        {
          name: 'agreementStart',
          label: intl.get('hmdm.automaticCollection.view.agreementStartDate').d('协议起始日'),
          type: FieldType.date,
          range: ['agreementStartDateStart', 'agreementStartDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'agreementStartDateStart',
          type: FieldType.date,
          labelWidth: '120',
          bind: 'agreementStart.agreementStartDateStart',
        },
        {
          name: 'agreementStartDateEnd',
          type: FieldType.date,
          bind: 'agreementStart.agreementStartDateEnd',
        },
        {
          name: 'agreementEndDate',
          label: intl.get('hmdm.automaticCollection.view.agreementEndDate').d('协议到期日'),
          type: FieldType.date,
          range: ['agreementEndDateStart', 'agreementEndDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'agreementEndDateStart',
          type: FieldType.date,
          bind: 'agreementEndDate.agreementEndDateStart',
        },
        {
          name: 'agreementEndDateEnd',
          type: FieldType.date,
          bind: 'agreementEndDate.agreementEndDateEnd',
        },
        {
          name: 'createDate',
          label: intl.get('hmdm.automaticCollection.view.creationDate').d('创建日期'),
          type: FieldType.date,
          range: ['createDateStart', 'createDateEnd'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'createDateStart',
          type: FieldType.date,
          bind: 'createDate.createDateStart',
        },
        {
          name: 'createDateEnd',
          type: FieldType.date,
          bind: 'createDate.createDateEnd',
        },
        {
          name: 'SendTime',
          label: intl.get('hmdm.automaticCollection.view.SendTime').d('发送日期'),
          type: FieldType.date,
          range: ['startSendTime', 'endSendTime'],
          labelWidth: '130',
          ignore: FieldIgnore.always,
        },
        {
          name: 'startSendTime',
          type: FieldType.date,
          bind: 'SendTime.startSendTime',
        },
        {
          name: 'endSendTime',
          type: FieldType.date,
          bind: 'SendTime.endSendTime',
        },
        {
          name: 'collectionStatus',
          label: intl.get('hmdm.automaticCollection.view.collectionStatus').d('催收状态'),
          type: FieldType.string,
          lookupCode: 'HTC.HMDM.DUNNING_STATUS',
        },
        {
          name: 'remindMode',
          label: intl.get('hmdm.automaticCollection.view.remindMode').d('提醒模式'),
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
