/*
 * @Description:发票入池规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-19 17:20:15
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hivp.invoiceWhitelist';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-white-lists/whitelist-header-search`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'get',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/htc-invoice-white-list-headers/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    primaryKey: 'invoiceWhiteListHeaderId',
    paging: false,
    fields: [
      {
        name: 'employeeWhiteList',
        label: intl.get(`${modelCode}.view.employeeWhiteList`).d('员工纳入白名单'),
        type: FieldType.string,
        labelWidth: '120',
        lookupCode: 'HIVP.INVOICE_WHITE_LIST',
      },
      {
        name: 'timeRange',
        label: intl.get(`${modelCode}.view.timeRange`).d('限制入池时间'),
        type: FieldType.number,
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyName',
          type: FieldType.string,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
