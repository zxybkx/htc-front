/*
 * @Description:当期勾选(取消)可认证发票
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-29 10:24:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';

const modelCode = 'hivp.check-certification';

const validTaxAmountValidator = (value, name, record) => {
  if (value && name && record) {
    // 发票税额
    const taxAmount = record.getField('taxAmount')?.getValue() || 0;
    if (value < 0 || value > taxAmount) {
      return '有效税额必须大于0且小于发票税额';
    }
  }
  return undefined;
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  // const API_PREFIX = `${commonConfig.IVP_API}-28090` || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-operation/certifiable-invoice-query`;
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
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-pool-header-infos/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
      update: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-operation/update-valid-tax-amount`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'invoicePoolHeaderId',
    events: {
      select: ({ dataSet, record }) => {
        const invoiceAmount = record.getField('invoiceAmount')?.getValue() || 0;
        const _taxAmount = record.getField('taxAmount')?.getValue() || 0;
        const _validTaxAmount = record.getField('validTaxAmount')?.getValue() || 0;
        const number = dataSet.selected.length;
        const { queryDataSet } = dataSet;
        const amount = queryDataSet && queryDataSet.current!.get('amount');
        const taxAmount = queryDataSet && queryDataSet.current!.get('taxAmount');
        const validTaxAmount = queryDataSet && queryDataSet.current!.get('validTaxAmount');
        const curAmount = amount + invoiceAmount;
        const curTaxAmount = taxAmount + _taxAmount;
        const curValidTaxAmount = validTaxAmount + _validTaxAmount;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: curAmount });
          queryDataSet.current!.set({ taxAmount: curTaxAmount });
          queryDataSet.current!.set({ validTaxAmount: curValidTaxAmount });
          queryDataSet.current!.set({ number });
        }
      },
      selectAll: ({ dataSet }) => {
        let amount = 0;
        let taxAmount = 0;
        let validTaxAmount = 0;
        dataSet.forEach((record) => {
          amount += record.getField('invoiceAmount')?.getValue() || 0;
        });
        dataSet.forEach((record) => {
          taxAmount += record.getField('taxAmount')?.getValue() || 0;
        });
        dataSet.forEach((record) => {
          validTaxAmount += record.getField('validTaxAmount')?.getValue() || 0;
        });
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount });
          queryDataSet.current!.set({ taxAmount });
          queryDataSet.current!.set({ validTaxAmount });
          queryDataSet.current!.set({ number: dataSet.length });
        }
      },
      unSelect: ({ dataSet, record }) => {
        const invoiceAmount = record.getField('invoiceAmount')?.getValue() || 0;
        const _taxAmount = record.getField('taxAmount')?.getValue() || 0;
        const _validTaxAmount = record.getField('validTaxAmount')?.getValue() || 0;
        const number = dataSet.selected.length;
        const { queryDataSet } = dataSet;
        const amount = queryDataSet && queryDataSet.current!.get('amount');
        const taxAmount = queryDataSet && queryDataSet.current!.get('taxAmount');
        const validTaxAmount = queryDataSet && queryDataSet.current!.get('validTaxAmount');
        const curAmount = amount - invoiceAmount;
        const curTaxAmount = taxAmount - _taxAmount;
        const curValidTaxAmount = validTaxAmount - _validTaxAmount;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: curAmount });
          queryDataSet.current!.set({ taxAmount: curTaxAmount });
          queryDataSet.current!.set({ validTaxAmount: curValidTaxAmount });
          queryDataSet.current!.set({ number });
        }
      },
      unSelectAll: ({ dataSet }) => {
        const { queryDataSet } = dataSet;
        if (queryDataSet) {
          queryDataSet.current!.set({ amount: 0 });
          queryDataSet.current!.set({ taxAmount: 0 });
          queryDataSet.current!.set({ validTaxAmount: 0 });
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
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码/海关缴款书号码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        required: true,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'validTaxAmount',
        label: intl.get(`${modelCode}.view.validTaxAmount`).d('有效税额'),
        type: FieldType.currency,
        validator: (value, name, record) =>
          new Promise((reject) => reject(validTaxAmountValidator(value, name, record))),
      },
      {
        name: 'invoiceState',
        label: intl.get(`${modelCode}.view.invoiceState`).d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'isPoolFlag',
        label: intl.get(`${modelCode}.view.invoiceState`).d('是否已入池'),
        type: FieldType.string,
      },
      {
        name: 'checkDate',
        label: intl.get(`${modelCode}.view.checkDate`).d('勾选时间'),
        type: FieldType.string,
      },
      {
        name: 'authenticationState',
        label: intl.get(`${modelCode}.view.authenticationState`).d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
      },
      {
        name: 'authenticationType',
        label: intl.get(`${modelCode}.view.authenticationType`).d('认证类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'infoSource',
        label: intl.get(`${modelCode}.view.infoSource`).d('信息来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.FROM_TYPE',
      },
      {
        name: 'taxBureauManageState',
        label: intl.get(`${modelCode}.view.taxBureauManageState`).d('管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
      {
        name: 'isEntryNotConform',
        label: intl.get(`${modelCode}.view.isEntryNotConform`).d('是否录入不符项'),
        type: FieldType.string,
        lookupCode: 'HIVP.WHETHER_TO_ENTER_DISCREPANCIES',
      },
      {
        name: 'purpose',
        label: intl.get(`${modelCode}.view.purpose`).d('用途'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVOICE_CHECK_FOR',
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
        name: 'abnormalSign',
        label: intl.get(`${modelCode}.view.abnormalSign`).d('异常标记'),
        type: FieldType.string,
        lookupCode: 'HIVP.ABNORMAL_SIGN',
        multiple: ',',
      },
      {
        name: 'annotation',
        label: intl.get(`${modelCode}.view.annotation`).d('特殊标记/说明/备忘/注释'),
        type: FieldType.string,
      },
      // {
      //   name: 'buyerName',
      //   label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
      //   type: FieldType.string,
      // },
      {
        name: 'batchNumber',
        label: intl.get(`${modelCode}.view.batchNumber`).d('批次号'),
        type: FieldType.string,
      },
      {
        name: 'failedDetail',
        label: intl.get(`${modelCode}.view.failedDetail`).d('失败原因'),
        type: FieldType.string,
      },
      {
        name: 'requestTime',
        label: intl.get(`${modelCode}.view.requestTime`).d('请求时间'),
        type: FieldType.string,
      },
      {
        name: 'completedTime',
        label: intl.get(`${modelCode}.view.completedTime`).d('完成时间'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
          type: FieldType.object,
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeNumber',
          label: intl.get(`${modelCode}.view.employeeNumber`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'currentPeriod',
          label: intl.get(`${modelCode}.view.currentPeriod`).d('当前所属期'),
          type: FieldType.string,
          readOnly: true,
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'currentOperationalDeadline',
          label: intl.get(`${modelCode}.view.currentOperationalDeadline`).d('当前可操作截止时间'),
          labelWidth: '130',
          type: FieldType.dateTime,
          transformRequest: (value) => moment(value).format('YYYY-MM-DD'),
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'checkableTimeRange',
          label: intl.get(`${modelCode}.view.checkableTimeRange`).d('可勾选时间范围'),
          type: FieldType.string,
          readOnly: true,
          // ignore: FieldIgnore.always,
        },
        {
          name: 'currentCertState',
          label: intl.get(`${modelCode}.view.currentCertState`).d('当前认证状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceDisplayOptions',
          label: intl.get(`${modelCode}.view.invoiceDisplayOptions`).d('发票显示选项'),
          type: FieldType.string,
          multiple: ',',
        },
        {
          name: 'invoiceCategory',
          label: intl.get(`${modelCode}.view.invoiceCategory`).d('发票类别'),
          type: FieldType.string,
          defaultValue: '01',
          lookupCode: 'HIVC.INVOICE_CATEGORY',
          required: true,
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNumber',
          label: intl.get(`${modelCode}.view.invoiceNumber`).d('发票/缴款书号码'),
          labelWidth: '120',
          type: FieldType.string,
        },
        {
          name: 'invoiceDateFrom',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('开票日期从'),
          type: FieldType.date,
          max: 'invoiceDateTo',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('开票日期至'),
          type: FieldType.date,
          min: 'invoiceDateFrom',
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'managementState',
          label: intl.get(`${modelCode}.view.managementState`).d('管理状态'),
          type: FieldType.string,
          lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
        },
        {
          name: 'invoiceState',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票状态'),
          type: FieldType.string,
          defaultValue: '0',
          lookupCode: 'HMDM.INVOICE_STATE',
        },
        {
          name: 'invoiceType',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票类型'),
          type: FieldType.string,
          lookupCode: 'HIVC.INVOICE_TYPE',
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
        {
          name: 'validTaxAmount',
          label: intl.get(`${modelCode}.view.validTaxAmount`).d('本次勾选有效税额'),
          type: FieldType.currency,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
          labelWidth: '120',
        },
        {
          name: 'authorityCode',
          label: intl.get(`${modelCode}.view.authorityCode`).d('主管税务机关代码'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
