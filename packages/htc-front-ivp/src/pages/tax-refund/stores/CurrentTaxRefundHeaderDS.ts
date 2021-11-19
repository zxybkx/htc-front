/*
 * @Description:当期退税勾选(取消)可确认发票
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-26 11:01:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hivp.tax-refund';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  const API_PREFIX = commonConfig.IVP_API || '';
  // const API_PREFIX = `${commonConfig.IVP_API}-31183` || '';
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data, params } = config;
        const { companyCode, employeeNumber } = data || {};
        const url = `${API_PREFIX}/v1/${tenantId}/refund-invoice-operation/query-current-refund-invoice`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            companyCode,
            employeeNumber,
            ...params,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'batchTaxRefundHeader',
    events: {
      select: ({ dataSet, record }) => {
        const invoiceAmountGross = record.get('invoiceAmountGross');
        const invoiceTheAmount = record.get('invoiceTheAmount');
        const number = dataSet.selected.length;
        const { queryDataSet } = dataSet;
        const amount = queryDataSet && queryDataSet.current!.get('amount');
        const taxAmount = queryDataSet && queryDataSet.current!.get('taxAmount');
        const curAmount = amount + invoiceAmountGross;
        const curTaxAmount = taxAmount + invoiceTheAmount;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: curAmount });
          queryDataSet.current!.set({ taxAmount: curTaxAmount });
          queryDataSet.current!.set({ number });
        }
      },
      selectAll: ({ dataSet }) => {
        let amount = 0;
        let taxAmount = 0;
        dataSet.forEach((record) => {
          amount += record.get('invoiceAmountGross');
        });
        dataSet.forEach((record) => {
          taxAmount += record.get('invoiceTheAmount');
        });
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount });
          queryDataSet.current!.set({ taxAmount });
          queryDataSet.current!.set({ number: dataSet.length });
        }
      },
      unSelect: ({ dataSet, record }) => {
        const invoiceAmountGross = record.get('invoiceAmountGross');
        const invoiceTheAmount = record.get('invoiceTheAmount');
        const number = dataSet.selected.length;
        const { queryDataSet } = dataSet;
        const amount = queryDataSet && queryDataSet.current!.get('amount');
        const taxAmount = queryDataSet && queryDataSet.current!.get('taxAmount');
        const curAmount = amount - invoiceAmountGross;
        const curTaxAmount = taxAmount - invoiceTheAmount;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: curAmount });
          queryDataSet.current!.set({ taxAmount: curTaxAmount });
          queryDataSet.current!.set({ number });
        }
      },
      unSelectAll: ({ dataSet }) => {
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: 0 });
          queryDataSet.current!.set({ taxAmount: 0 });
          queryDataSet.current!.set({ number: 0 });
        }
      },
    },
    fields: [
      {
        name: 'checkState',
        label: intl.get(`${modelCode}.view.checkState`).d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'annotation',
        label: intl.get(`${modelCode}.view.annotation`).d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
      {
        name: 'abnormalSign',
        label: intl.get(`${modelCode}.view.abnormalSign`).d('异常标记'),
        type: FieldType.string,
        lookupCode: 'HIVP.ABNORMAL_SIGN',
        multiple: ',',
      },
      {
        name: 'entryAccountState',
        label: intl.get(`${modelCode}.view.entryAccountState`).d('入账状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.ACCOUNT_STATE',
      },
      {
        name: 'receiptsState',
        label: intl.get(`${modelCode}.view.receiptsState`).d('单据关联状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.INTERFACE_DOCS_STATE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
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
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmountGross',
        label: intl.get(`${modelCode}.view.invoiceAmountGross`).d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceTheAmount',
        label: intl.get(`${modelCode}.view.invoiceTheAmount`).d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxName',
        label: intl.get(`${modelCode}.view.salerTaxName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'checkDate',
        label: intl.get(`${modelCode}.view.checkDate`).d('勾选时间'),
        type: FieldType.string,
      },
      {
        name: 'confirmState',
        label: intl.get(`${modelCode}.view.confirmState`).d('确认状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CONFIRM_STATUS',
      },
      {
        name: 'confirmDate',
        label: intl.get(`${modelCode}.view.confirmDate`).d('确认时间'),
        type: FieldType.string,
      },
      {
        name: 'authenticationMethod',
        label: intl.get(`${modelCode}.view.authenticationMethod`).d('认证方式'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_WAY',
      },
      {
        name: 'infoSource',
        label: intl.get(`${modelCode}.view.infoSource`).d('信息来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.FROM_TYPE',
      },
      {
        name: 'managementState',
        label: intl.get(`${modelCode}.view.managementState`).d('管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
      {
        name: 'batchNo',
        label: intl.get(`${modelCode}.view.batchNo`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'failReason',
        label: intl.get(`${modelCode}.view.failReason`).d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completeTime',
        label: intl.get(`${modelCode}.view.completeTime`).d('完成时间'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyDesc`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HMDM.CURRENT_EMPLOYEE',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
          // ignore: FieldIgnore.always,
        },
        {
          name: 'companyName',
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          required: true,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNumber',
          label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          required: true,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          required: true,
        },
        {
          name: 'authorityCode',
          label: intl.get(`${modelCode}.view.authorityCode`).d('主管机构代码'),
          type: FieldType.string,
        },
        {
          name: 'checkMonth',
          label: intl.get(`${modelCode}.view.checkMonth`).d('勾选月份'),
          type: FieldType.string,
          defaultValue: moment().format('YYYYMM'),
          readOnly: true,
        },
        {
          name: 'invoiceType',
          label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
          type: FieldType.string,
          lookupCode: 'HIVC.INVOICE_TYPE',
          defaultValue: '01',
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`${modelCode}.view.invoiceDateFrom`).d('开票日期从'),
          max: 'invoiceDateTo',
          type: FieldType.date,
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceDateTo`).d('开票日期至'),
          min: 'invoiceDateFrom',
          type: FieldType.date,
        },
        {
          name: 'salerTaxNo',
          label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方税号'),
          type: FieldType.string,
        },
        {
          name: 'manageState',
          label: intl.get(`${modelCode}.view.manageState`).d('管理状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
          defaultValue: '0',
        },
        {
          name: 'invoiceState',
          label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_STATE',
          defaultValue: '0',
        },
        {
          name: 'invoiceDisplayOptions',
          label: intl.get(`${modelCode}.view.invoiceDisplayOptions`).d('发票显示选项'),
          type: FieldType.string,
          transformRequest: (value) => value && value.join(','),
          // computedProps: {
          //   defaultValue: ({ record }) =>
          //     ['CURRENT_PERIOD_CHECKED', 'ABNORMAL_FLAGED', 'DISPLAY_CHECK_REQUESTING'].includes(
          //       record.get('invoiceDisplayOptions')
          //     ),
          // },
        },
        {
          name: 'number',
          label: intl.get(`${modelCode}.view.number`).d('本次勾选'),
          type: FieldType.number,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
        {
          name: 'amount',
          label: intl.get(`${modelCode}.view.amount`).d('本次勾选金额'),
          type: FieldType.currency,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
        {
          name: 'taxAmount',
          label: intl.get(`${modelCode}.view.taxAmount`).d('本次勾选税额'),
          type: FieldType.currency,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
      ],
    }),
  };
};
