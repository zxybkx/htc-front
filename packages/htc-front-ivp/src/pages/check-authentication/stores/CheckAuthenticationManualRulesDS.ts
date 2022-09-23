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
          url: `${API_PREFIX}/v1/${tenantId}/rules-header-infos/save-info`,
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
        label: intl.get('htc.common.v').d('手动获取发票开票日期范围'),
        range: ['start', 'end'],
        defaultValue: { start: moment().subtract(1, 'day'), end: new Date() },
        type: FieldType.date,
        computedProps: {
          required: ({ record }) => {
            if (record.get('checkStatus') === '0') {
              return true;
            }
          },
          disabled: ({ record }) => {
            console.log(record.get('certificationStatus'));
            if (record.get('checkStatus') === '1' || !!record.get('certificationStatus')) {
              return true;
            } else {
              return false;
            }
          },
        },
      },
      {
        name: 'invoiceTickDate',
        label: intl.get('htc.common.v').d('手动获取勾选发票勾选时间范围'),
        range: ['start', 'end'],
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
      },
      {
        name: 'invoiceInDate',
        label: intl.get('htc.common.view.i').d('手动获取勾选发票入库时间范围'),
        range: ['start', 'end'],
        type: FieldType.date,
      },
      {
        name: 'deductionType',
        label: intl.get('hivp.checkRule').d('抵扣类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.CERTIFICATION_TYPE',
      },
      {
        name: 'checkStatus',
        label: intl.get('hivp.checkRule').d('勾选状态'),
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
        label: intl.get('hivp.checkRule').d('认证状态'),
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
        label: intl.get('hivp.checkRule').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNo',
        label: intl.get('hivp.checkRule').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceStyle',
        label: intl.get('hivp.checkRule').d('发票类型'),
        type: FieldType.string,
        defaultValue: ['01'],
        multiple: true,
        lookupCode: 'HIVP.CHECK_INVOICE_TYPE',
      },
      {
        name: 'invoiceStatus',
        label: intl.get('hivp.checkRule').d('发票状态'),
        type: FieldType.string,
        multiple: true,
        defaultValue: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '80'],
        lookupCode: 'HMDM.INVOICE_STATE',
      },
      {
        name: 'redTicketFlag',
        label: intl.get('hivp.checkRule').d('红票标识'),
        type: FieldType.string,
        multiple: true,
        lookupCode: 'HIVP.RED_FLAG',
      },
      {
        name: 'sellerTaxpayerNumber',
        label: intl.get('hivp.checkRule').d('销方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'certifiedQueryState',
        label: intl.get('hivp.checkRule').d('已认证查询状态'),
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
        name: 'certifiedQueryMonthObj',
        label: intl.get('hivp.checkRule').d('已认证查询月份'),
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
