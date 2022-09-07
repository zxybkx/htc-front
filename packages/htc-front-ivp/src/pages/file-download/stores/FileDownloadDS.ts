/*
 * @Description:发票池-档案下载
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2022-06-10 18:00:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { message } from 'choerodon-ui/pro';

const modelCode = 'hivp.invoicesFileDownload';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/archives-management/archives-download-search`;
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
    events: {
      query({ params }) {
        if (params.showInInvoiceFile === '0' && params.showOutInvoiceFile === '0') {
          message.warning(
            intl.get('hivp.bill.notice.fileType').d('请勾选查询档案类型'),
            undefined,
            undefined,
            'rightBottom'
          );
          return false;
        }
      },
    },
    pageSize: 10,
    selection: false,
    primaryKey: 'invoiceFileHeaderId',
    fields: [
      {
        name: 'invoiceFileHeaderId',
        label: intl.get('hivp.bill.view.billPoolHeaderId').d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'recordPeriod',
        label: intl.get('hivp.invoicesFileArchive.view.archiveDate').d('归档期间'),
        type: FieldType.month,
      },
      {
        name: 'recordDate',
        label: intl.get(`${modelCode}.view.recordDate`).d('归档日期'),
        type: FieldType.date,
      },
      {
        name: 'bucketName',
        label: intl.get(`${modelCode}.view.bucketName`).d('桶名'),
        type: FieldType.string,
      },
      {
        name: 'recordTotalSize',
        label: intl.get(`${modelCode}.view.recordSize`).d('档案大小(MB)'),
        type: FieldType.number,
      },
      {
        name: 'inOutType',
        label: intl.get('hivp.invoicesFileArchive.view.inOutType').d('进销项'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'type',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.ELECTRONICS_TYPE',
      },
      {
        name: 'recordFileNum',
        label: intl.get(`${modelCode}.view.recordFileNum`).d('档案文件数量'),
        type: FieldType.number,
      },
    ],
    queryFields: [
      {
        name: 'recordDate',
        label: intl.get(`${modelCode}.view.recordDate`).d('归档日期'),
        type: FieldType.month,
        required: true,
        range: ['recordDateFrom', 'recordDateTo'],
        defaultValue: {
          recordDateFrom: moment(),
          recordDateTo: moment(),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'recordDateFrom',
        label: intl.get(`${modelCode}.view.recordDateFrom`).d('归档期间从'),
        type: FieldType.month,
        bind: 'recordDate.recordDateFrom',
        transformRequest: value => value && moment(value).format('YYYY-MM'),
      },
      {
        name: 'recordDateTo',
        label: intl.get(`${modelCode}.view.recordDateTo`).d('归档期间至'),
        type: FieldType.month,
        bind: 'recordDate.recordDateTo',
        transformRequest: value => value && moment(value).format('YYYY-MM'),
      },
      {
        name: 'showInInvoiceFile',
        label: intl.get(`${modelCode}.view.showInInvoiceFile`).d('显示进项发票档案'),
        type: FieldType.boolean,
        trueValue: '1',
        falseValue: '0',
        defaultValue: '1',
        required: true,
        labelWidth: '150',
      },
      {
        name: 'showOutInvoiceFile',
        label: intl.get(`${modelCode}.view.showOutInvoiceFile`).d('显示销项发票档案'),
        type: FieldType.boolean,
        trueValue: '1',
        falseValue: '0',
        defaultValue: '0',
        required: true,
        labelWidth: '150',
      },
    ],
  };
};
