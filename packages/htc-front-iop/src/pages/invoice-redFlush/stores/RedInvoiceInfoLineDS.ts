/**
 * @Description:红字信息表编号
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-6-15 15:44:22
 * @LastEditTime: 2021-6-25 15:44:22
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/red-invoice-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            lovCode: 'HIOP.RED_INVOICE_INFO',
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'invoicingOrderHeaderId',
    selection: false,
    fields: [
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.redInfoSerialNumber').d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
      },
    ],
  };
};
