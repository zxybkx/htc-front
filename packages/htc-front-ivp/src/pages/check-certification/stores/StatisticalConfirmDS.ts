/*
 * @Description:勾选请求进展查看及统计确签
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-10-29 10:20:22
 * @LastEditTime: 2022-07-26 16:15:13
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-operation-infos`;
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
    },
    pageSize: 10,
    // selection: false,
    primaryKey: 'detailInfoHeaderId',
    fields: [
      {
        name: 'currentPeriod',
        label: intl.get(`${modelCode}.view.currentPeriod`).d('所属期'),
        type: FieldType.string,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('请求类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.REQUEST_TYPE',
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'requestState',
        label: intl.get(`${modelCode}.view.requestState`).d('请求状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.REQUEST_STATE',
      },
      {
        name: 'completeTime',
        label: intl.get(`${modelCode}.view.completeTime`).d('完成时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'checkConfirmState',
        label: intl.get(`${modelCode}.view.checkConfirmState`).d('完成后所属期状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
      },
      {
        name: 'batchNo',
        label: intl.get('hivp.batchCheck.view.batchCode').d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.employeeName').d('请求员工'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        // {
        //   name: 'statisticalPeriod',
        //   label: intl.get(`${modelCode}.view.statisticalPeriod`).d('认证所属期'),
        //   type: FieldType.string,
        //   readOnly: true,
        // },
        {
          name: 'companyId',
          type: FieldType.number,
        },
        {
          name: 'authenticationDateObj',
          label: intl.get(`${modelCode}.view.authenticationDateObj`).d('认证所属期'),
          type: FieldType.object,
          lovCode: 'HIVP.BUSINESS_TIME_INFO',
          cascadeMap: { companyId: 'companyId' },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'statisticalPeriod',
          type: FieldType.string,
          bind: 'authenticationDateObj.currentPeriod',
          // ignore: FieldIgnore.always,
        },
        {
          name: 'currentCertState',
          label: intl.get('hivp.taxRefund.view.currentCertState').d('当前认证状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
          readOnly: true,
        },
        {
          name: 'confirmPassword',
          label: intl.get(`${modelCode}.view.confirmPassword`).d('确认密码'),
          type: FieldType.string,
        },
      ],
    }),
  };
};

const TimeRange = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'invoiceDateFrom',
        label: intl.get(`${modelCode}.view.checkTimeFrom`).d('勾选日期从'),
        type: FieldType.date,
        required: true,
        max: 'invoiceDateTo',
      },
      {
        name: 'invoiceDateTo',
        label: intl.get(`${modelCode}.view.checkTimeTo`).d('勾选日期到'),
        type: FieldType.date,
        required: true,
        min: 'invoiceDateFrom',
      },
    ],
  };
};
export { TimeRange };
