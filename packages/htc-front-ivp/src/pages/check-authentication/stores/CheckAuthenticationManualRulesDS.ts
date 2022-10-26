/**
 * @Description:勾选认证手动数据获取
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
// import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-operation-new/get-check-invoice`,
          data: data && data[0],
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    selection: false,
    primaryKey: 'rulesHeaderId',
    events: {
      update: ({ record, name }) => {
        if (name === 'certificationStatus') {
          record.set({ invoiceDate: {} });
        }
        if (name === 'checkStatus' && record.get('checkStatus') === '1') {
          record.set({ invoiceDate: {} });
        }
        if (name === 'checkStatus' && record.get('checkStatus') === '0') {
          record.set({ invoiceTickDate: {} });
        }
      },
    },
    fields: [
      {
        name: 'invoiceDate',
        label: intl.get('hivp.checkRule.manual.invoiceDate').d('手动获取发票开票日期范围'),
        range: ['invoiceDateStart', 'invoiceDateEnd'],
        defaultValue: { invoiceDateStart: moment().subtract(1, 'day'), invoiceDateEnd: new Date() },
        type: FieldType.date,
        computedProps: {
          required: ({ record }) => {
            if (record.get('checkStatus') === '0') {
              return true;
            }
          },
          disabled: ({ record }) => {
            if (record.get('checkStatus') === '1' || !!record.get('certificationStatus')) {
              return true;
            } else {
              return false;
            }
          },
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceDateStart',
        type: FieldType.date,
        bind: 'invoiceDate.invoiceDateStart',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceDateEnd',
        type: FieldType.date,
        bind: 'invoiceDate.invoiceDateEnd',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceTickDate',
        label: intl.get('hivp.checkRule.manual.invoiceTickDate').d('手动获取勾选发票勾选时间范围'),
        range: ['invoiceTickDateStart', 'invoiceTickDateEnd'],
        type: FieldType.date,
        computedProps: {
          required: ({ record }) => {
            if (record.get('checkStatus') === '1' || !!record.get('certificationStatus')) {
              return true;
            } else {
              return false;
            }
          },
          disabled: ({ record }) => {
            if (record.get('checkStatus') === '0') {
              return true;
            }
          },
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceTickDateStart',
        type: FieldType.date,
        bind: 'invoiceTickDate.invoiceTickDateStart',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceTickDateEnd',
        type: FieldType.date,
        bind: 'invoiceTickDate.invoiceTickDateEnd',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceInDate',
        label: intl.get('hivp.checkRule.manual.invoiceInDate').d('手动获取勾选发票入库时间范围'),
        range: ['invoiceInDateStart', 'invoiceInDateEnd'],
        type: FieldType.date,
        ignore: FieldIgnore.always,
      },
      {
        name: 'invoiceInDateStart',
        type: FieldType.date,
        bind: 'invoiceInDate.invoiceInDateStart',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'invoiceInDateEnd',
        type: FieldType.date,
        bind: 'invoiceInDate.invoiceInDateEnd',
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'deductionType',
        label: intl.get('hivp.checkRule.manual.deductionType').d('抵扣类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'checkStatus',
        label: intl.get('hivp.checkCertification.view.checkState').d('勾选状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_STATE',
        computedProps: {
          disabled: ({ record }) => {
            if (record.get('certificationStatus')) {
              return true;
            }
          },
        },
      },
      {
        name: 'certificationStatus',
        label: intl.get('hivp.checkCertification.view.authenticationState').d('认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_STATE',
        computedProps: {
          disabled: ({ record }) => {
            if (record.get('checkStatus')) {
              return true;
            }
          },
        },
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
        name: 'invoiceStyle',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        multiple: ',',
        lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
      },
      {
        name: 'invoiceStatus',
        label: intl.get('hivp.batchCheck.view.invoiceStatus').d('发票状态'),
        type: FieldType.string,
        multiple: ',',
        defaultValue: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '80'],
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'redTicketFlag',
        label: intl.get('hivp.checkRule.manual.redTicketFlag').d('红票标识'),
        type: FieldType.string,
        lookupCode: 'HIVP.RED_FLAG',
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('htc.common.view.salerTaxNo').d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'certifiedQueryState',
        label: intl.get('hivp.checkRule.manual.certifiedQueryState').d('已认证查询状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.QUERY_STATUS',
        computedProps: {
          required: ({ record }) => {
            if (record.get('certificationStatus')) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'employeeNumber',
        type: FieldType.string,
      },
      {
        name: 'certifiedQueryMonthObj',
        label: intl.get('hivp.checkRule.manual.certifiedQueryMonthObj').d('已认证查询月份'),
        type: FieldType.object,
        lovCode: 'HIVP.BUSINESS_TIME_INFO',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          required: ({ record }) => {
            if (record.get('certificationStatus')) {
              return true;
            } else {
              return false;
            }
          },
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'certifiedQueryMonth',
        type: FieldType.string,
        bind: 'certifiedQueryMonthObj.currentPeriod',
      },
    ],
  };
};
