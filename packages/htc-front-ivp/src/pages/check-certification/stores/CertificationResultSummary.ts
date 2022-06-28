/**
 * @Description:当期已勾选发票-认证报表汇总
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-05-07 14:20
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-operation/certified-result-statistic-report`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    selection: false,
    primaryKey: 'certificationResultSummary',
    fields: [
      {
        name: 'taxRate',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNum',
        label: intl.get(`${modelCode}.view.numberOfCopies`).d('份数'),
        type: FieldType.number,
      },
      {
        name: 'amount',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
    ],
  };
};
