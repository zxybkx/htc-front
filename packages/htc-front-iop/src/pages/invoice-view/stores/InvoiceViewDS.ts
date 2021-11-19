/*
 * @Description:发票预览
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-08 14:03:42
 * @LastEditTime: 2021-01-08 14:34:16
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.invoice-view';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { invoiceSourceType } = dsParams;
        const url =
          dsParams.sourceType === 'REQUEST'
            ? `${API_PREFIX}/v1/${tenantId}/requisition-headers/show-invoice`
            : `${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/${dsParams.headerId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          params: {
            sourceType: invoiceSourceType,
          },
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderHeaderId',
    selection: false,
    paging: false,
    fields: [
      {
        name: 'invoicingOrderHeaderId',
        type: FieldType.number,
      },
      {
        name: 'downloadFileType',
        label: intl.get(`${modelCode}.view.downloadFileType`).d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'downloadUrl',
        label: intl.get(`${modelCode}.view.downloadUrl`).d('发票地址'),
        type: FieldType.string,
      },
    ],
  };
};
