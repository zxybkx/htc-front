/*
 * @Description:批量退税勾选(取消)可确认发票行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-26 11:01:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { assign } from 'lodash';

const modelCode = 'hivp.tax-refund';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  // const API_PREFIX = `${commonConfig.IVP_API}-31183` || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const _dataSet: any = config.dataSet;
        const { queryDataSet } = _dataSet.parent;
        const parentQueryData = queryDataSet && queryDataSet.current!.toData(true);
        const { companyId, companyCode, employeeId, employeeNumber, ...otherParams } =
          parentQueryData || {};
        assign(data, otherParams);
        const url = `${API_PREFIX}/v1/${tenantId}/refund-invoice-operation/query-batch-check-log`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            companyId,
            companyCode,
            employeeId,
            employeeNumber,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'batchTaxRefundLine',
    selection: false,
    paging: false,
    fields: [
      {
        name: 'uploadDate',
        label: intl.get(`${modelCode}.view.uploadDate`).d('上传时间'),
        type: FieldType.string,
      },
      {
        name: 'checkResult',
        label: intl.get(`${modelCode}.view.checkResult`).d('勾选结果'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNum',
        label: intl.get(`${modelCode}.view.invoiceNum`).d('发票份数'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAllAmountGross',
        label: intl.get(`${modelCode}.view.invoiceAllAmountGross`).d('金额（元）'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceAllAmount',
        label: intl.get(`${modelCode}.view.invoiceAllAmount`).d('税额（元）'),
        type: FieldType.currency,
      },
    ],
  };
};
