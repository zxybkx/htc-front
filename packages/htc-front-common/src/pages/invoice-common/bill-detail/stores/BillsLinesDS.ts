/**
 * @Description:票据池-行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-13 16:07:22
 * @LastEditTime: 2021-01-28 10:44:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.bill';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/bill-pool-line-infos`;
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
    primaryKey: 'billPoolLineId',
    fields: [
      {
        name: 'billPoolLineId',
        label: intl.get(`${modelCode}.view.billPoolLineId`).d('记录行ID'),
        type: FieldType.number,
      },
      {
        name: 'billPoolHeaderId',
        label: intl.get(`${modelCode}.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'goodsName',
        label: intl.get(`${modelCode}.view.goodsName`).d('货物或应税劳务、服务名称'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get('htc.common.view.specificationModel').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get('htc.common.view.unit').d('单位'),
        type: FieldType.string,
      },
      {
        name: 'quantity',
        label: intl.get('htc.common.view.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('不含税单价'),
        type: FieldType.currency,
      },

      {
        name: 'amount',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxRate',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get('htc.common.view.taxAmount').d('税额'),
        type: FieldType.string,
      },
    ],
  };
};
