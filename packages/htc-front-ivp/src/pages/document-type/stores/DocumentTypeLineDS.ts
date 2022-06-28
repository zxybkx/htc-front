/*
 * @Description:单据类型维护行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2021-03-16 17:47:51
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hivp.documentType';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  console.log('API_PREFIX', API_PREFIX);
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/document-type-liness`;
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
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/document-type-liness/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.query();
      },
    },
    pageSize: 5,
    selection: false,
    primaryKey: 'docTypeLineId',
    fields: [
      {
        name: 'docTypeLineId',
        type: FieldType.number,
      },
      {
        name: 'docTypeHeaderId',
        type: FieldType.number,
      },
      {
        name: 'orderSeq',
        label: intl.get('hzero.common.view.serialNumber').d('排序号'),
        type: FieldType.string,
      },
      {
        name: 'companyInfo',
        label: intl.get(`${modelCode}.view.companyInfo`).d('单据代码'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'systemCode',
        label: intl.get(`${modelCode}.view.systemCode`).d('系统代码'),
        type: FieldType.string,
      },
      {
        name: 'systemName',
        label: intl.get(`${modelCode}.view.systemName`).d('系统名称'),
        type: FieldType.string,
      },
      {
        name: 'documentTypeCode',
        label: intl.get(`${modelCode}.view.documentTypeCode`).d('单据类型代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get(`${modelCode}.view.documentTypeMeaning`).d('单据类型名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'salesSourceCode',
        label: intl.get(`${modelCode}.view.salesSourceCode`).d('销项来源单号'),
        type: FieldType.string,
        lookupCode: 'HIOP.ITEM_SOURCE_NUMBER',
        multiple: ',',
      },
      {
        name: 'dateInfo',
        label: intl.get(`${modelCode}.view.dateInfo`).d('有效期'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.addtDate`).d('添加时间'),
        type: FieldType.dateTime,
        defaultValue: moment(),
        readOnly: true,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('是否启用'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
      {
        name: 'endDate',
        label: intl.get(`${modelCode}.view.endDate`).d('禁用时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
    ],
  };
};
