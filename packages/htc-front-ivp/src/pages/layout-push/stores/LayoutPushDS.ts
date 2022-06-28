/*
 * @Description:发票池-底账头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-10-20 14:23:52
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { phoneReg } from '@htccommon/utils/utils';

const modelCode = 'hivp.invoicesLayoutPush';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/layout-push/layout-push`;
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
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'invoicePoolHeaderId',
    fields: [
      {
        name: 'invoicePoolHeaderId',
        label: intl.get('hivp.bill.view.billPoolHeaderId').d('记录ID'),
        type: FieldType.number,
      },
      {
        name: 'inOutType',
        label: intl.get(`${modelCode}.view.inOutType`).d('进销项类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.IN_OUT_TYPE',
      },
      {
        name: 'buyerTell',
        label: intl.get(`${modelCode}.view.buyerTell`).d('开票手机号'),
        type: FieldType.string,
      },
      {
        name: 'buyerMail',
        label: intl.get(`${modelCode}.view.buyerMail`).d('开票邮箱'),
        type: FieldType.string,
      },
      {
        name: 'ticketCollectorDesc',
        label: intl.get('hivp.batchCheck.view.collectionStaff').d('收票员工'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceLovTag',
        label: intl.get('hivp.bill.view.invoiceTypeTag').d('发票类型标记'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerName',
        label: intl.get('htc.common.view.buyerName').d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalAmount',
        label: intl.get('htc.common.view.totalAmount').d('价税合计'),
        type: FieldType.currency,
      },
      {
        name: 'annotation',
        label: intl.get('hivp.checkCertification.view.annotation').d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
      {
        name: 'recordType',
        label: intl.get('htc.common.view.recordType').d('档案类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.DOCS_TYPE',
      },
      {
        name: 'additionalTell',
        label: intl.get(`${modelCode}.view.additionalTell`).d('附加手机号'),
        type: FieldType.string,
        pattern: phoneReg,
        defaultValidationMessages: {
          patternMismatch: intl.get('hzero.common.validation.phone').d('手机格式不正确'), // 正则不匹配的报错信息
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'employeeEmail',
        label: intl.get(`${modelCode}.view.employeeEmail`).d('附加邮件地址'),
        type: FieldType.email,
        ignore: FieldIgnore.always,
      },
    ],
  };
};
