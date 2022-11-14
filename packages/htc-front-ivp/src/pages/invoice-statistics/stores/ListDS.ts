/*
 * @Description: 进销发票统计报表
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-11-03 16:14:01
 * @LastEditTime: 2022-11-14 13:58:23
 * @Copyright: Copyright (c) 2020, Hand
 */

import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const modelCode = 'hivp.invoiceStatistics';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/in-out-invoice/all`;
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
      submit: ({ data, dataSet }) => {
        const { queryDataSet } = dataSet!;
        const serchData = queryDataSet && queryDataSet.current?.toData();
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-analysis-infos`,
          data: [
            {
              ...data[0],
              ...serchData,
            },
          ],
          method: 'POST',
        };
      },
    },
    // pageSize: 10,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'year',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('所属年度'),
      },
      {
        name: 'mouth',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.month`).d('所属月度'),
      },
      {
        name: 'trueInvoiceAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueInvoiceAmount`).d('实际开票金额'),
      },
      {
        name: 'trueTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.trueTaxAmount`).d('实际开票税额'),
      },
      {
        name: 'unInvoiceIncomeAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.unInvoiceIncomeAmount`).d('未开票收入金额'),
      },
      {
        name: 'unInvoiceIncomeTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.unInvoiceIncomeTaxAmount`).d('未开票收入税额'),
      },
      {
        name: 'adjustIncomeAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeAmount`).d('调整收入金额'),
      },
      {
        name: 'adjustIncomeTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.adjustIncomeTaxAmount`).d('调整收入税额'),
      },
      {
        name: 'checkDeductionAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionAmount`).d('勾选抵扣金额'),
      },
      {
        name: 'checkDeductionTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.checkDeductionTaxAmount`).d('勾选抵扣税额'),
      },
      {
        name: 'fillingDeductionTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.fillingDeductionTaxAmount`).d('填表抵扣税额'),
      },
      {
        name: 'fillingDeductionAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.fillingDeductionAmount`).d('填表抵扣金额'),
      },
      {
        name: 'inputTaxTransferAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.inputTaxTransferAmount`).d('进项税转出金额'),
      },
      {
        name: 'inputTaxTransferTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.inputTaxTransferTaxAmount`).d('进项税转出税额'),
      },
      {
        name: 'totalDeductionAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.totalDeductionAmount`).d('合计抵扣金额'),
      },
      {
        name: 'totalDeductionTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.totalDeductionTaxAmount`).d('合计抵扣税额'),
      },
      {
        name: 'inputAmountDifference',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.inputAmountDifference`).d('进项金额差额'),
      },
      {
        name: 'inputTaxAmountDifference',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.inputTaxAmountDifference`).d('进项税额差额'),
      },
      {
        name: 'taxBearingTaxRate',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.taxBearingTaxRate`).d('税负率'),
      },
      {
        name: 'chainInvoiceTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.chainInvoiceTaxAmount`).d('环比开票税额'),
      },
      {
        name: 'chainDeductionTaxAmount',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.chainDeductionTaxAmount`).d('环比抵扣税额'),
      },
      {
        name: 'chainInputAmountTaxDifference',
        type: FieldType.string,
        label: intl.get(`${modelCode}.view.chainInputAmountTaxDifference`).d('环比进税差额'),
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
          required: true,
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
          transformRequest(value) {
            return moment(value).format('YYYY');
          },
          required: true,
        },
        {
          name: 'mouth',
          label: intl.get(`${modelCode}.view.month`).d('所属月度'),
          format: 'MM',
          defaultValue: '',
          transformRequest(value) {
            return value ? moment(value).format('MM') : '';
          },
          type: FieldType.month,
        },
      ],
    }),
  };
};
