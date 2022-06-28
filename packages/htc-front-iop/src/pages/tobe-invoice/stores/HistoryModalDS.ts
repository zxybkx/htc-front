/**
 * @Description:历史记录
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-12 16:24:22
 * @LastEditTime: 2022-06-15 10:35:22
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';

export default (dsProps): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/prepare-history-infos/queryHistory/${dsProps.prepareInvoiceId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'prepareInvoiceId',
    paging: false,
    fields: [
      {
        name: 'sourceHeadNumber',
        label: intl.get('hiop.tobeInvoice.modal.sourceHeadNumber').d('来源单据号'),
        type: FieldType.string,
      },
      {
        name: 'sourceLineNumber',
        label: intl.get('hiop.tobeInvoice.modal.sourceLineNumber').d('来源单据行号'),
        type: FieldType.string,
      },
      {
        name: 'batchNo',
        label: intl.get('hiop.redInvoiceInfo.modal.batchNo').d('批次号'),
        type: FieldType.string,
      },
    ],
  };
};
