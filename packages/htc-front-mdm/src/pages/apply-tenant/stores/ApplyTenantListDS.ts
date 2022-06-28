/**
 * @Description: 租户信息行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:26:22
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import { AxiosRequestConfig } from 'axios';

const modelCode = 'hmdm.apply-tenant-list';

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.MDM_API}-30455` || '';
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const _dataSet: any = config.dataSet;
        const uniqueCode = _dataSet.parent.current!.get('uniqueCode');
        const url = `${API_PREFIX}/v1/apply-items/query-system-company`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: { uniqueCode },
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/save-apply-company`,
          data,
          params,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/apply-items/delete-apply-company`,
          data,
          method: 'DELETE',
        };
      },
    },
    primaryKey: 'companyId',
    paging: false,
    fields: [
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyShort',
        label: intl.get(`${modelCode}.view.companyShort`).d('公司简称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyTaxNumber',
        label: intl.get(`${modelCode}.view.companyTaxNumber`).d('公司税号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'addressPhone',
        label: intl.get(`${modelCode}.view.addressPhone`).d('地址、电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'openBankAccount',
        label: intl.get(`${modelCode}.view.openBankAccount`).d('开户行及账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'competentCode',
        label: intl.get(`${modelCode}.view.competentCode`).d('主管税务机关代码'),
        type: FieldType.string,
        labelWidth: '150',
      },
      {
        name: 'companyAdmin',
        label: intl.get(`${modelCode}.view.companyAdmin`).d('公司管理员'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'adminPhone',
        label: intl.get(`${modelCode}.view.adminPhone`).d('公司管理员手机号'),
        type: FieldType.string,
        pattern: phoneReg,
        required: true,
      },
      {
        name: 'adminEmail',
        label: intl.get(`${modelCode}.view.adminEmail`).d('公司管理员邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'openFunc',
        label: intl.get(`${modelCode}.view.openFunc`).d('开通功能'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.CUSTOMER_APPLY_SERVICE',
        lovPara: { publicMode: true },
        multiple: ',',
        required: true,
      },
      {
        name: 'openStartDateObj',
        label: intl.get(`${modelCode}.view.openStartDateObj`).d('开通时间'),
        range: ['openStartDate', 'openEndDate'],
        type: FieldType.date,
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'openStartDate',
        label: intl.get(`${modelCode}.view.openStartDate`).d('开通时间起'),
        type: FieldType.date,
        bind: 'openStartDateObj.openStartDate',
      },
      {
        name: 'openEndDate',
        label: intl.get(`${modelCode}.view.openEndDate`).d('开通时间止'),
        type: FieldType.date,
        bind: 'openStartDateObj.openEndDate',
      },
      {
        name: 'dueRemind',
        label: intl.get(`${modelCode}.view.dueRemind`).d('是否发送到期提醒'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLY_COMPANY_REMIND',
        lovPara: { publicMode: true },
      },
      {
        name: 'download',
        label: intl.get(`${modelCode}.view.collection`).d('下载模板'),
        type: FieldType.string,
      },
      {
        name: 'upload',
        label: intl.get(`${modelCode}.view.collection`).d('上传'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
    ],
  };
};
