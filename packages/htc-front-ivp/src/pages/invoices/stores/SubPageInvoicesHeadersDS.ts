/*
 * @Description:发票池-头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-11-03 10:58:06
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';

// const modelCode = 'hivp.invoices';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-pool-header-infos/${dsParams.invoicePoolHeaderId}`;
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
    primaryKey: 'invoicePoolHeaderId',
    fields: [
      {
        name: 'invoicePoolHeaderId',
        label: intl.get(`hivp.bill.view.billPoolHeaderId`).d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      {
        name: 'tenantName',
        label: intl.get(`htc.common.view.tenantName`).d('租户名称'),
        type: FieldType.string,
        defaultValue: getCurrentTenant().tenantName,
      },
      {
        name: 'companyId',
        label: intl.get(`hivp.batchCheck.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get(`htc.common.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`hzero.hzeroTheme.page.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`htc.common.view.taxpayerNumber`).d('公司纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        label: intl.get(`hivp.bill.view.employeeId`).d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get(`hivp.bill.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`htc.common.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceTypeTag',
        label: intl.get(`hivp.bill.view.invoiceTypeTag`).d('发票类型标记'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get(`hivp.batchCheck.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`htc.common.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`htc.common.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`htc.common.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        // required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`htc.common.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`htc.common.view.taxAmount`).d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'totalAmount',
        label: intl.get(`htc.common.view.totalAmount`).d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get(`hivp.bill.view.EffectiveTax`).d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'salerName',
        label: intl.get(`htc.common.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get(`htc.common.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'recordType',
        label: intl.get(`htc.common.view.recordType`).d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'inOutType',
        label: intl.get(`hivp.invoicesLayoutPush.view.inOutType`).d('进销项类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'fileUrl',
        label: intl.get(`hivp.invoicesArchiveUpload.view.fileUrl`).d('文件URL'),
        type: FieldType.string,
      },
      {
        name: 'fileName',
        label: intl.get(`hivp.batchCheck.view.fileName`).d('文件名称'),
        type: FieldType.string,
      },
    ],
  };
};
