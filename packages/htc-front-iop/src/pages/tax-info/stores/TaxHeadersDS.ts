/*
 * @Descripttion:税控主信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-03-24 10:58:00
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.tax-info';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/tax-header-infos`;
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
    pageSize: 5,
    selection: false,
    primaryKey: 'taxHeaderId',
    fields: [
      {
        name: 'taxHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'productType',
        label: intl.get(`${modelCode}.view.productType`).d('产品/设备类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.PRODUCT_TYPE',
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('金税盘编号'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerName',
        label: intl.get(`${modelCode}.view.taxpayerName`).d('纳税人名称'),
        type: FieldType.string,
      },
      {
        name: 'taxAuthorityCode',
        label: intl.get(`${modelCode}.view.taxAuthorityCode`).d('主管税务机关代码'),
        type: FieldType.string,
      },
      {
        name: 'taxAuthorityName',
        label: intl.get(`${modelCode}.view.taxAuthorityName`).d('主管税务机关名称'),
        type: FieldType.string,
      },
      {
        name: 'issueAreaNumber',
        label: intl.get(`${modelCode}.view.issueAreaNumber`).d('发行地区编号'),
        type: FieldType.string,
      },
      {
        name: 'curDate',
        label: intl.get(`${modelCode}.view.curDate`).d('当前时钟'),
        type: FieldType.dateTime,
      },
      {
        name: 'startDate',
        label: intl.get(`${modelCode}.view.startDate`).d('启用时间'),
        type: FieldType.date,
      },
      {
        name: 'programVersionNumber',
        label: intl.get(`${modelCode}.view.programVersionNumber`).d('底层程序版本号'),
        type: FieldType.string,
      },
      {
        name: 'companyType',
        label: intl.get(`${modelCode}.view.companyType`).d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.COMPANY_TYPE',
      },
      {
        name: 'taxDiskSize',
        label: intl.get(`${modelCode}.view.taxDiskSize`).d('金税盘容量'),
        type: FieldType.string,
      },
      {
        name: 'taxDiskType',
        label: intl.get(`${modelCode}.view.taxDiskType`).d('金税盘类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_DISK_TYPE',
      },
      {
        name: 'authorizeExpirationDate',
        label: intl.get(`${modelCode}.view.authorizeExpirationDate`).d('授权截止日期'),
        type: FieldType.dateTime,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('信息更新时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'extension',
        label: intl.get(`${modelCode}.view.extension`).d('其他扩展信息'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            record.set({
              taxpayerNumber: value.taxpayerNumber,
              // taxpayerName: value.companyName,
            });
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('公司名称'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          required: true,
          ignore: FieldIgnore.always,
        },
        // {
        //   name: 'taxpayerName',
        //   label: intl.get(`${modelCode}.view.taxpayerName`).d('纳税人名称'),
        //   type: FieldType.string,
        //   readOnly: true,
        //   required: true,
        //   ignore: FieldIgnore.always,
        // },
      ],
    }),
  };
};
