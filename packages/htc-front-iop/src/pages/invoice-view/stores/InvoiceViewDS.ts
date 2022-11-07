/**
 * @Description:发票预览
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-08 14:03:42
 * @LastEditTime: 2021-01-08 14:34:16
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

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
        type: FieldType.string,
      },
      {
        name: 'downloadFileType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceType').d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'downloadUrl',
        label: intl.get('hiop.invoiceView.modal.downloadUrl').d('发票地址'),
        type: FieldType.string,
      },
    ],
  };
};
