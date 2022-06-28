/**
 * @Description: 项目费用分摊
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-03-28 9:45:22
 * @LastEditTime: 2022-06-20 17:11:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const modelCode = 'hmdm.costSharing';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.MDM_API || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/cost-share-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'agreementId',
    fields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'projectNumber',
        label: intl.get(`${modelCode}.view.projectNumber`).d('立项项目编号'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'projectDate',
        label: intl.get(`${modelCode}.view.projectDate`).d('项目立项日期'),
        type: FieldType.string,
      },
      {
        name: 'deliveryDocker',
        label: intl.get(`${modelCode}.view.deliveryDocker`).d('交付对接人'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeCode',
        label: intl.get(`${modelCode}.view.expensesTypeCode`).d('费用类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.EXPENSES_TYPE_CODE',
      },
      {
        name: 'annualFee',
        label: intl.get(`${modelCode}.view.annualFee`).d('年费'),
        type: FieldType.currency,
      },
      {
        name: 'allNumber',
        label: intl.get(`${modelCode}.view.allNumber`).d('总数量'),
        type: FieldType.number,
      },
      {
        name: 'phaseQuantity',
        label: intl.get(`${modelCode}.view.phaseQuantity`).d('阶段使用数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'statisticalStartDate',
        label: intl.get(`${modelCode}.view.statisticalStartDate`).d('统计起始日'),
        type: FieldType.string,
      },
      {
        name: 'statisticalEndDate',
        label: intl.get(`${modelCode}.view.statisticalEndDate`).d('统计截止日'),
        type: FieldType.string,
      },
      {
        name: 'dockerContact',
        label: intl.get(`${modelCode}.view.dockerContact`).d('对接人联系方式'),
        type: FieldType.string,
      },
      {
        name: 'administrator',
        label: intl.get(`${modelCode}.view.administrator`).d('管理员'),
        type: FieldType.string,
      },
      {
        name: 'adminContact',
        label: intl.get(`${modelCode}.view.adminContact`).d('管理员联系方式'),
        type: FieldType.string,
      },
    ],
    queryFields: [
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
      },
      {
        name: 'projectName',
        label: intl.get(`${modelCode}.view.projectName`).d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'expensesTypeCode',
        label: intl.get(`${modelCode}.view.expensesTypeCode`).d('费用类型'),
        type: FieldType.string,
        lookupCode: 'HMDM.EXPENSES_TYPE_CODE',
      },
      {
        name: 'statisticalStartDate',
        label: intl.get(`${modelCode}.view.statisticalStartDate`).d('统计起始日'),
        type: FieldType.date,
        max: 'statisticalEndDate',
        labelWidth: '150',
      },
      {
        name: 'statisticalEndDate',
        label: intl.get(`${modelCode}.view.statisticalEndDate`).d('统计截止日'),
        type: FieldType.date,
        min: 'statisticalStartDate',
        labelWidth: '150',
      },
      {
        name: 'deliveryDocker',
        label: intl.get(`${modelCode}.view.deliveryDocker`).d('交付对接人'),
        type: FieldType.string,
      },
      {
        name: 'projectDateFrom',
        label: intl.get(`${modelCode}.view.projectDate`).d('项目立项日期从'),
        type: FieldType.date,
        labelWidth: '160',
      },
      {
        name: 'projectDateTo',
        label: intl.get(`${modelCode}.view.projectDate`).d('项目立项日期至'),
        type: FieldType.date,
        labelWidth: '160',
      },
    ],
  };
};
