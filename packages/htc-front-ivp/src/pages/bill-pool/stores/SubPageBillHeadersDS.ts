/*
 * @Descripttion:票据池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2021-01-14 11:40:56
 * @LastEditTime: 2021-01-27 11:40:08
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

const modelCode = 'hivp.bills';

export default (dsParams): DataSetProps => {
  const API_PREFIX = `${commonConfig.IVP_API}` || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/bill-pool-header-infos/${dsParams.billPoolHeaderId}`;
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
    primaryKey: 'billPoolHeaderId',
    fields: [
      {
        name: 'billPoolHeaderId',
        label: intl.get(`${modelCode}.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      {
        name: 'tenantName',
        label: intl.get(`${modelCode}.view.tenantName`).d('租户名称'),
        type: FieldType.string,
        defaultValue: getCurrentTenant().tenantName,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('公司纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'billType',
        label: intl.get(`${modelCode}.view.billType`).d('票据类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.BILL_TYPE',
      },
      // {
      //   name: 'invoiceType',
      //   label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
      //   type: FieldType.string,
      //   lookupCode: 'HIVC.INVOICE_TYPE',
      // },
      {
        name: 'invoiceTypeTag',
        label: intl.get(`${modelCode}.view.invoiceTypeTag`).d('发票类型标记'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        // required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get(`${modelCode}.view.validTaxAmount`).d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'recordType',
        label: intl.get(`${modelCode}.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      // {
      //   name: 'inOutType',
      //   label: intl.get(`${modelCode}.view.inOutType`).d('进销项类型'),
      //   type: FieldType.string,
      //   lookupCode: 'HIVP.IN_OUT_TYPE',
      // },
      {
        name: 'fileUrl',
        label: intl.get(`${modelCode}.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`${modelCode}.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
    ],
  };
};
