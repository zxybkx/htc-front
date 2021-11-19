/*
 * @Description:红字信息表编号
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-6-15 15:44:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hiop.invoice-redFlush-info';

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
    primaryKey: 'redInvoiceInfoHeaderId',
    selection: false,
    fields: [
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('红字信息表编号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('金额'),
        type: FieldType.currency,
      },
    ],
  };
};
