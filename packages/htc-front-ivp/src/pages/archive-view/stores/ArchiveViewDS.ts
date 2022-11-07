/*
 * @Description:发票池-单据关联
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-19 15:53:46
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.invoicesArchiveUpload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/document-relation/select-relation-document`;
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
    primaryKey: 'detailId',
    fields: [
      {
        name: 'detailId',
        type: FieldType.string,
      },
      {
        name: 'systemName',
        label: intl.get(`${modelCode}.view.systemName`).d('对接系统'),
        type: FieldType.string,
      },
      {
        name: 'systemCode',
        label: intl.get(`${modelCode}.view.systemCode`).d('对接系统代码'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get(`${modelCode}.view.documentTypeMeaning`).d('单据类型'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeCode',
        label: intl.get(`${modelCode}.view.documentTypeCode`).d('单据类型代码'),
        type: FieldType.string,
      },
      {
        name: 'documentNumber',
        label: intl.get(`${modelCode}.view.documentNumber`).d('单据编号'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceId',
        label: intl.get(`${modelCode}.view.documentSourceId`).d('对接系统单据ID'),
        type: FieldType.string,
      },
      {
        name: 'documentSourceKey',
        label: intl.get(`${modelCode}.view.documentSourceKey`).d('单据关键字'),
        type: FieldType.string,
      },
      {
        name: 'documentRemark',
        label: intl.get(`${modelCode}.view.documentRemark`).d('单据描述'),
        type: FieldType.string,
      },
      {
        name: 'relationInvoiceQuantity',
        label: intl.get(`${modelCode}.view.relationInvoiceQuantity`).d('关联发票数量'),
        type: FieldType.number,
      },
    ],
  };
};
