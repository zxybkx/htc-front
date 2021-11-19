/**
 * @Description:认证（取消）详情
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2021-07-08 16:31:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@common/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { AxiosRequestConfig } from 'axios';
import intl from 'utils/intl';

const modelCode = 'hivp.check-certification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    primaryKey: 'certifivationCancelDetailTable',
    autoQuery: false,
    pageSize: 10,
    selection: false,
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data, dataSet } = config;
        let requestState;
        if (dataSet && dataSet.parent) {
          requestState = dataSet.parent.current!.get('requestState');
        }
        const { detailInfoHeaderId } = data;
        if (detailInfoHeaderId && requestState === 'COMPLETED') {
          return {
            ...config,
            url: `${API_PREFIX}/v1/${organizationId}/cert-request-lines/${detailInfoHeaderId}`,
            params: {
              ...config.params,
              organizationId,
              certRequestHeaderId: detailInfoHeaderId,
            },
            method: 'get',
          };
        } else {
          return {};
        }
      },
    },
    fields: [
      {
        name: 'number',
        label: intl.get(`${modelCode}.view.number`).d('序号'),
        type: FieldType.number,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'deductionInvoiceNum',
        label: intl.get(`${modelCode}.view.deductionInvoiceNum`).d('抵扣发票份数'),
        type: FieldType.string,
      },
      {
        name: 'deductionAmount',
        label: intl.get(`${modelCode}.view.deductionAmount`).d('抵扣总金额'),
        type: FieldType.string,
      },
      {
        name: 'deductionValidTaxAmount',
        label: intl.get(`${modelCode}.view.deductionValidTaxAmount`).d('抵扣总有效税额'),
        type: FieldType.string,
      },
      {
        name: 'nonDeductionInvoiceNum',
        label: intl.get(`${modelCode}.view.nonDeductionInvoiceNum`).d('不抵扣发票份数'),
        type: FieldType.string,
      },
      {
        name: 'nonDeductionAmount',
        label: intl.get(`${modelCode}.view.nonDeductionAmount`).d('不抵扣总金额'),
        type: FieldType.string,
      },
      {
        name: 'nonDeductionValidTaxAmount',
        label: intl.get(`${modelCode}.view.nonDeductionValidTaxAmount`).d('不抵扣总有效税额'),
        type: FieldType.string,
      },
    ],
  };
};
