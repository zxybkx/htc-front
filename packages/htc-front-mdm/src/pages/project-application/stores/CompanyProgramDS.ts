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
        label: intl.get('htc.common.modal.companyCode').d('公司代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyName',
        label: intl.get('htc.common.view.companyName').d('公司名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyShort',
        label: intl.get('hmdm.applyTenant.view.companyShort').d('公司简称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'companyTaxNumber',
        label: intl.get('hivp.bill.view.taxpayerNumber').d('公司税号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'addressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'openBankAccount',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'competentCode',
        label: intl.get('hcan.invoiceDetail.view.taxAuthorityCode').d('主管税务机关代码'),
        type: FieldType.string,
        labelWidth: '150',
      },
      {
        name: 'companyAdmin',
        label: intl.get('hmdm.applyTenant.view.companyAdmin').d('公司管理员'),
        type: FieldType.string,
      },
      {
        name: 'adminPhone',
        label: intl.get('hmdm.applyTenant.view.adminPhone').d('公司管理员手机号'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'adminEmail',
        label: intl.get('hmdm.applyTenant.view.adminEmail').d('公司管理员邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
      },
      {
        name: 'openFunc',
        label: intl.get('hmdm.applyTenant.view.openFunc').d('开通功能'),
        type: FieldType.string,
        lookupCode: 'HTC.HMDM.CUSTOMER_APPLY_SERVICE',
        multiple: ',',
        required: true,
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.model.remark').d('备注'),
        type: FieldType.string,
      },
      {
        name: 'upload',
        label: intl.get('hmdm.applyTenant.view.upload').d('上传'),
        type: FieldType.string,
      },
      {
        name: 'download',
        label: intl.get('hmdm.applyTenant.modal.view.download').d('下载'),
        type: FieldType.string,
      },
    ],
  };
};
