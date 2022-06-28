/**
 * @Description: 租户信息头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:26:22
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.apply-tenantHeader';

/**
 * 必输受控于类型
 */
const requiredBylinksType = (linksType) => {
  return linksType !== '1';
};

export default (dsProps): DataSetProps => {
  // const API_PREFIX = `${commonConfig.MDM_API}-30455` || '';
  const API_PREFIX = commonConfig.MDM_API || '';
  const { search } = dsProps;
  const typeCode = new URLSearchParams(search).get('typeCode');
  const linksType = new URLSearchParams(search).get('linksType');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/apply-items/detail/${typeCode}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ params, dataSet }) => {
        const dataSetData = dataSet?.current!.toData();
        return {
          url: `${API_PREFIX}/v1/apply-items/save-info`,
          data: [dataSetData],
          params,
          method: 'POST',
        };
      },
    },
    primaryKey: 'systemCompanyId',
    paging: false,
    fields: [
      {
        name: 'contractCustomerName',
        label: intl.get(`${modelCode}.view.contractCustomerName`).d('客户全称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'customerPhone',
        label: intl.get(`${modelCode}.view.customerPhone`).d('客户手机号'),
        type: FieldType.string,
        pattern: phoneReg,
        required: true,
      },
      {
        name: 'customerEmail',
        label: intl.get(`${modelCode}.view.customerEmail`).d('客户邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
      {
        name: 'customerAdmin',
        label: intl.get(`${modelCode}.view.customerAdmin`).d('客户管理员'),
        type: FieldType.string,
        required: requiredBylinksType(linksType),
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('立项项目编号'),
        type: FieldType.string,
        required: requiredBylinksType(linksType),
      },
      {
        name: 'contractNumber',
        label: intl.get(`${modelCode}.view.contractNumber`).d('合同号'),
        type: FieldType.string,
        required: requiredBylinksType(linksType),
      },
      {
        name: 'customerSystem',
        label: intl.get(`${modelCode}.view.customerSystem`).d('对接客户系统'),
        type: FieldType.string,
        required: requiredBylinksType(linksType),
      },
      {
        name: 'createItem',
        label: intl.get(`${modelCode}.view.createItem`).d('已创建项目'),
        type: FieldType.string,
      },
      {
        name: 'pmsContractNumber',
        label: intl.get(`${modelCode}.view.pmsContractNumber`).d('PMS合同号'),
        type: FieldType.string,
      },
      {
        name: 'deliveryName',
        label: intl.get(`${modelCode}.view.deliveryName`).d('汉得交付联系人'),
        type: FieldType.string,
        labelWidth: '110',
      },
      {
        name: 'collection',
        label: intl.get(`${modelCode}.view.collection`).d('是否已收款'),
        type: FieldType.string,
        required: requiredBylinksType(linksType),
      },
    ],
  };
};
