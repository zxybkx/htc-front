/*
 * @Description: 进销发票统计报表详情
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:14:01
 * @LastEditTime: 2022-11-08 14:38:46
 * @Copyright: Copyright (c) 2020, Hand
 */

import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const modelCode = 'hivp.invoiceStatistics';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/in_out_invoice/all`;
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
    selection: false,
    fields: [
      {
        name: 'invoiceType',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('发票种类'),
        lookupCode: 'HIVP.INVIOCE_AND_BILL_TYPE',
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('发票代码'),
      },
      {
        name: 'invoiceNo',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueInvoiceAmount`).d('发票号码'),
      },
      {
        name: 'buyerName',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueTaxAmount`).d('购方名称'),
      },
      {
        name: 'sellerName',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.unInvoiceIncomeAmount`).d('销方名称'),
      },
      {
        name: 'invoiceState',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.unInvoiceIncomeTaxAmount`).d('发票状态'),
      },
      {
        name: 'invoiceDate',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeAmount`).d('开票日期'),
      },
      {
        name: 'invoiceAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeTaxAmount`).d('不含税金额'),
      },
      {
        name: 'taxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionAmount`).d('税额'),
      },
      {
        name: 'totalAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionTaxAmount`).d('价税合计'),
      },
      {
        name: 'inOutType',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.fillingDeductionTaxAmount`).d('进销项类型'),
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
          }
        },
      },
      fields: [
        {
          name: 'tenantObject',
          label: intl.get('htc.common.view.tenantName').d('租户名称'),
          type: FieldType.object,
          lovCode: 'HPFM.TENANT',
          readOnly: true,
          required: true,
          defaultValue: tenantInfo,
          ignore: FieldIgnore.always,
        },
        {
          name: 'tenantId',
          type: FieldType.string,
          bind: `tenantObject.tenantId`,
        },
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        // {
        //     name: 'companyCode',
        //     type: FieldType.string,
        //     bind: 'companyObj.companyCode',
        // },
        // {
        //     name: 'companyName',
        //     type: FieldType.string,
        //     bind: 'companyObj.companyName',
        // },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'year',
          label: intl.get(`${modelCode}.view.year`).d('所属年度'),
          type: FieldType.year,
          required: true,
        },
        {
          name: 'mouth',
          label: intl.get(`${modelCode}.view.month`).d('所属月度'),
          type: FieldType.month,
        },
      ],
    }),
  };
};
