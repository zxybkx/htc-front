/**
 * @Description:商品映射
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:15:42
 * @LastEditTime: 2022-06-15 14:02
 * @Copyright: Copyright (c) 2021, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/customer-informations-main`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            repeatFlag: 1,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'customerInformationId',
    fields: [
      {
        name: 'customerCode',
        type: FieldType.string,
        label: intl.get('hiop.customerInfo.modal.customerCode').d('客户代码'),
      },
      {
        name: 'customerName',
        type: FieldType.string,
        label: intl.get('hiop.customerInfo.modal.customerName').d('客户名称'),
      },
      {
        name: 'customerTaxpayerNumber',
        type: FieldType.string,
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'customerCode',
          label: intl.get('hiop.customerInfo.modal.customerCode').d('客户代码'),
          type: FieldType.string,
        },
        {
          name: 'customerName',
          label: intl.get('hiop.customerInfo.modal.customerName').d('客户名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
