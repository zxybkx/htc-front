/*
 * @Description:商品映射
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:15:42
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.assign-commodity';

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
        label: intl.get(`${modelCode}.view.customerCode`).d('客户代码'),
      },
      {
        name: 'customerName',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.customerName`).d('客户名称'),
      },
      {
        name: 'customerTaxpayerNumber',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.customerTaxpayerNumber`).d('纳税识别号'),
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'customerCode',
          label: intl.get(`${modelCode}.view.customerCode`).d('客户代码'),
          type: FieldType.string,
        },
        {
          name: 'customerName',
          label: intl.get(`${modelCode}.view.customerName`).d('客户名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
