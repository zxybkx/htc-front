/**
 * @Description:发票池-批量上传详情
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-29
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
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
        const url = `${API_PREFIX}/v1/${tenantId}/archives-update/query-invoice-upload-file`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'detailId',
    fields: [
      {
        name: 'invoiceUploadFileId',
        type: FieldType.string,
      },
      {
        name: 'invoicePoolHeaderId',
        label: intl.get('hivp.bill.view.billPoolHeaderId').d('记录ID'),
        type: FieldType.string,
      },
      {
        name: 'uploadFileName',
        label: intl.get(`${modelCode}.view.uploadFileName`).d('上传文件名称'),
        type: FieldType.string,
      },
      {
        name: 'identifyState',
        label: intl.get(`${modelCode}.view.identifyState`).d('识别状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_RECOGNITION_STATE',
      },
      {
        name: 'dataCheckState',
        label: intl.get(`${modelCode}.view.dataCheckState`).d('数据校验状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.DATA_CHECK_STATE',
      },
      {
        name: 'uploadStatus',
        label: intl.get(`${modelCode}.view.uploadStatus`).d('档案上传状态'),
        type: FieldType.string,
      },
      {
        name: 'fileType',
        label: intl.get(`${modelCode}.view.fileType`).d('文件类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'existFileName',
        label: intl.get(`${modelCode}.view.existFileName`).d('已有档案文件名'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVIOCE_AND_BILL_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
      },
    ],
    queryFields: [
      {
        name: 'uploadFileName',
        label: intl.get(`${modelCode}.view.uploadFileName`).d('上传文件名称'),
        labelWidth: '90',
        type: FieldType.string,
      },
      {
        name: 'dataCheckState',
        label: intl.get(`${modelCode}.view.dataCheckState`).d('数据校验状态'),
        labelWidth: '90',
        type: FieldType.string,
        lookupCode: 'HIVP.DATA_CHECK_STATE',
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
    ],
  };
};
