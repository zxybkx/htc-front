/*
 * @Description:勾选请求进展查看及统计确签
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-10-29 10:20:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.check-certification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  // const monthStart = moment(dsParams.statisticalPeriod).startOf('month');
  // const dayEnd = moment().endOf('day');
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
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('请求员工'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'statisticalPeriod',
          label: intl.get(`${modelCode}.view.statisticalPeriod`).d('认证所属期'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'currentCertState',
          label: intl.get(`${modelCode}.view.currentCertState`).d('当前认证状态'),
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
