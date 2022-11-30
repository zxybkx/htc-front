/**
 * @Description:发票池-批量上传
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-19 15:54:08
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hivp.invoicesArchiveUpload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/archives-update/query-upload-archives`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/archives-update/delete-invoice-upload-file`,
          data,
          method: 'DELETE',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'invoiceUploadFileId',
    fields: [
      {
        name: 'batchNo',
        label: intl.get('hivp.checkCertification.view.batchNo').d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
      {
        name: 'dataStatus',
        label: intl.get(`${modelCode}.view.dataStatus`).d('数据状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIVP.DATA_STATUS',
      },
      {
        name: 'statusDescription',
        label: intl.get('hiop.invoiceWorkbench.modal.exceptionDesc').d('状态描述'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get('hivp.checkCertification.view.requestTime').d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'lastUpdateDate',
        label: intl.get('hivp.checkCertification.view.completeTime').d('完成时间'),
        type: FieldType.string,
      },
    ],
  };
};
