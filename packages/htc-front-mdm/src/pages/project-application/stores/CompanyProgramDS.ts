/**
 * @Description:租户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:26:22
 * @LastEditTime: 2022-06-20 17:07:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

const modelCode = 'hmdm.apply-tenantList';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
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
    events: {
      submitSuccess: ({ dataSet }) => {
        dataSet.parent.query();
      },
    },
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
      },
      {
        name: 'adminPhone',
        label: intl.get(`${modelCode}.view.adminPhone`).d('公司管理员手机号'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'adminEmail',
        label: intl.get(`${modelCode}.view.adminEmail`).d('公司管理员邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
      },
      {
        name: 'openFunc',
        label: intl.get(`${modelCode}.view.openFunc`).d('开通功能'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.CUSTOMER_APPLY_SERVICE',
        multiple: ',',
        required: true,
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('备注'),
        type: FieldType.string,
      },
      {
        name: 'upload',
        label: intl.get(`${modelCode}.view.collection`).d('上传'),
        type: FieldType.string,
      },
      {
        name: 'download',
        label: intl.get(`${modelCode}.view.collection`).d('下载'),
        type: FieldType.string,
      },
    ],
  };
};
