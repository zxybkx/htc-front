/**
 * @Description:租户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:26:22
 * @LastEditTime: 2022-06-20 17:26:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL, PHONE } from 'utils/regExp';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.company-program';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/apply-items/query-items-details`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId: dsParams.tenantId,
            uniqueCode: dsParams.uniqueCode,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'systemCompanyId',
    paging: false,
    fields: [
      {
        name: 'contractCustomerName',
        label: intl.get(`${modelCode}.view.contractCustomerName`).d('客户全称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'customerPhone',
        label: intl.get(`${modelCode}.view.customerPhone`).d('客户手机号'),
        type: FieldType.string,
        pattern: PHONE,
        readOnly: true,
      },
      {
        name: 'customerEmail',
        label: intl.get(`${modelCode}.view.customerEmail`).d('客户邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        readOnly: true,
      },
      {
        name: 'customerAdmin',
        label: intl.get(`${modelCode}.view.customerAdmin`).d('客户管理员'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('立项项目编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'contractNumber',
        label: intl.get(`${modelCode}.view.contractNumber`).d('合同号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'customerSystem',
        label: intl.get(`${modelCode}.view.customerSystem`).d('对接客户系统'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'createItem',
        label: intl.get(`${modelCode}.view.createItem`).d('已创建项目'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'pmsContractNumber',
        label: intl.get(`${modelCode}.view.pmsContractNumber`).d('PMS合同号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'deliveryName',
        label: intl.get(`${modelCode}.view.deliveryName`).d('汉得交付联系人'),
        type: FieldType.string,
        labelWidth: '110',
        readOnly: true,
      },
      {
        name: 'collection',
        label: intl.get(`${modelCode}.view.collection`).d('是否已收款'),
        type: FieldType.string,
      },
    ],
  };
};
