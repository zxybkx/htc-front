/**
 * @Description: 分月季年统计表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-08-09 10:40
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-points/query-rate`;
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
    selection: false,
    primaryKey: 'statisticsTable',
    fields: [
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
        name: 'ydkpxe',
        label: intl.get('hiop.statisticsTable.view.ydkpxe').d('月度开票限额'),
        type: FieldType.currency,
      },
      {
        name: 'ydljykje',
        label: intl.get('hiop.statisticsTable.view.ydljykje').d('月度累计已开金额'),
        type: FieldType.currency,
      },
      {
        name: 'jdkpxe',
        label: intl.get('hiop.statisticsTable.view.jdkpxe').d('季度开票限额'),
        type: FieldType.currency,
      },
      {
        name: 'jdljykje',
        label: intl.get('hiop.statisticsTable.view.jdljykje').d('季度累计已开金额'),
        type: FieldType.currency,
      },
      {
        name: 'ndkpxe',
        label: intl.get('hiop.statisticsTable.view.ndkpxe').d('年度开票限额'),
        type: FieldType.currency,
      },
      {
        name: 'ndljykje',
        label: intl.get('hiop.statisticsTable.view.ndljykje').d('年度累计已开金额'),
        type: FieldType.currency,
      },
    ],
    queryFields: [
      {
        name: 'tenantObject',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        readOnly: true,
        required: true,
        defaultValue: tenantInfo,
        ignore: FieldIgnore.always,
      },
      {
        name: 'tenantId',
        type: FieldType.number,
        bind: `tenantObject.tenantId`,
      },
      {
        name: 'companyObj',
        label: intl.get('htc.common.label.companyName').d('所属公司'),
        type: FieldType.object,
        lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: 'companyObj.companyId',
      },
      {
        name: 'companyCode',
        type: FieldType.string,
        bind: 'companyObj.companyCode',
        ignore: FieldIgnore.always,
      },
      {
        name: 'employeeId',
        type: FieldType.number,
        bind: 'companyObj.employeeId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'currentTime',
        label: intl.get('hiop.statisticsTable.view.currentTime').d('当前时间'),
        type: FieldType.dateTime,
        readOnly: true,
        defaultValue: moment(),
      },
    ],
  };
};
