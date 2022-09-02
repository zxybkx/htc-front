/*
 * @Description:退税勾选确认
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-30 14:36:45
 * @LastEditTime: 2022-07-26 17:25:35
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';

const modelCode = 'hivp.taxRefund.confirm';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { data } = config;
        const { companyId, companyCode, employeeId, employeeNumber } = data;
        const url = `${API_PREFIX}/v1/${tenantId}/refund-invoice-operation/current-query-confirm-invoice`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            companyId,
            companyCode,
            employeeId,
            employeeNumber,
            ...config.params,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    primaryKey: 'taxRefundConfirm',
    selection: false,
    fields: [
      {
        name: 'confirmFlag',
        label: intl.get('hivp.checkCertification.view.confirmFlag').d('确认标志'),
        type: FieldType.string,
        lookupCode: 'HIVP.CONFIRM_STATUS',
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        required: true,
        transformResponse: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('hiop.invoiceReq.modal.buyerTaxNo').d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxName',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('hiop.invoiceReq.modal.salerTaxNo').d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceAmountGross',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'invoiceTheAmount',
        label: intl.get('hivp.checkCertification.view.taxAmount').d('发票税额'),
        type: FieldType.string,
      },
      {
        name: 'validTaxAmount',
        label: intl.get('hivp.taxRefund.view.validTaxAmount').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceState',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'checkState',
        label: intl.get('hivp.checkCertification.view.checkState').d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
      },
      {
        name: 'checkDate',
        label: intl.get('hivp.checkCertification.view.checkTime').d('勾选时间'),
        type: FieldType.date,
      },
      {
        name: 'confirmState',
        label: intl.get('hivp.checkCertification.view.confirmState').d('确认状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CONFIRM_STATUS',
      },
      {
        name: 'qrsj',
        label: intl.get('hivp.checkCertification.view.confirmDate').d('确认时间'),
        type: FieldType.string,
      },
      {
        name: 'authenticationMethod',
        label: intl.get('hivp.checkCertification.view.authenticationMethod').d('认证方式'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_WAY',
      },
      {
        name: 'infoSource',
        label: intl.get('hivp.checkCertification.view.infoSource').d('信息来源'),
        type: FieldType.string,
        lookupCode: 'HIVP.FROM_TYPE',
      },
      {
        name: 'managementState',
        label: intl.get('hivp.checkCertification.view.managementState').d('管理状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.SAT_MANAGEMENT_STATE',
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'companyDesc',
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
          readOnly: true,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.string,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
        },
        {
          name: 'employeeId',
          type: FieldType.string,
        },
        {
          name: 'employeeNumber',
          type: FieldType.string,
        },
        {
          name: 'confirmMonthObj',
          label: intl.get('hivp.taxRefund.view.confirmMonth').d('确认月份'),
          type: FieldType.object,
          lovCode: 'HIVP.REFUND_CONFIRM_MONTH',
          cascadeMap: { companyCode: 'companyCode' },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'confirmMonth',
          label: intl.get('hivp.taxRefund.view.confirmMonth').d('确认月份'),
          type: FieldType.string,
          bind: 'confirmMonthObj.confirmMonth',
        },
        {
          name: 'checkMonth',
          label: intl.get('hivp.taxRefund.view.checkMonth').d('当前月份'),
          type: FieldType.string,
          defaultValue: moment().format('YYYYMM'),
          readOnly: true,
          required: true,
        },
        {
          name: 'authorityCode',
          label: intl.get('hivp.checkCertification.view.taxAuthorityCode').d('主管机构代码'),
          type: FieldType.string,
        },
        {
          name: 'taxDiskPassword',
          label: intl.get(`${modelCode}.view.taxDiskPassword`).d('税盘密码'),
          type: FieldType.string,
        },
        {
          name: 'confirmFlag',
          label: intl.get('hivp.checkCertification.view.confirmFlag').d('确认标志'),
          type: FieldType.string,
          lookupCode: 'HIVP.CONFIRM_STATUS',
          required: true,
        },
        {
          name: 'salerTaxNo',
          label: intl.get('hiop.invoiceReq.modal.salerTaxNo').d('销方纳税识别号'),
          type: FieldType.string,
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
          name: 'invoiceDateFrom',
          label: intl.get('hivp.checkCertification.view.checkTimeFrom').d('勾选日期从'),
          type: FieldType.date,
          max: 'invoiceDateTo',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'invoiceDateTo',
          label: intl.get('hivp.checkCertification.view.checkTimeTo').d('勾选日期至'),
          type: FieldType.date,
          min: 'invoiceDateFrom',
          transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        {
          name: 'number',
          label: intl.get('hivp.taxRefund.view.number').d('本次确认'),
          type: FieldType.number,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
        {
          name: 'amount',
          label: intl.get('hivp.taxRefund.view.amount').d('本次确认金额'),
          type: FieldType.currency,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
        {
          name: 'taxAmount',
          label: intl.get('hivp.taxRefund.view.taxAmount').d('本次确认税额'),
          type: FieldType.currency,
          ignore: FieldIgnore.always,
          readOnly: true,
          defaultValue: 0,
        },
      ],
    }),
  };
};
