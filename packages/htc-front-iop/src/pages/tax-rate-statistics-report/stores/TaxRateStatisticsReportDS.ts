/**
 * @Description:分税率统计报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-20
 * @LastEditTime: 2020-06-15 10:18
 * @Copyright: Copyright (c) 2022, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const tenantInfo = getCurrentTenant();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoicing-order-points/query-rate`;
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
    primaryKey: 'taxRateStatisticList',
    fields: [
      {
        name: 'taxRateMeaning',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'blueAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.blueAmount').d('蓝字发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'blueWasteAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.blueWasteAmount').d('蓝废发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'redAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.redAmount').d('红字发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'redWasteAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.redWasteAmount').d('红废发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'actualSalesAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.actualSalesAmount').d('实际销售金额'),
        type: FieldType.currency,
      },
      {
        name: 'blueTaxAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.blueTaxAmount').d('蓝字发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'blueWasteTaxAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.blueWasteTaxAmount').d('蓝废发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'redTaxAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.redTaxAmount').d('红字发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'redWasteTaxAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.redWasteTaxAmount').d('红废发票税额'),
        type: FieldType.currency,
      },
      {
        name: 'actualSalesTaxAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.actualSalesTaxAmount').d('实际销项税额'),
        type: FieldType.currency,
      },
      {
        name: 'totalAmountValue',
        label: intl.get('hiop.taxRateStatistic.view.totalAmount').d('实际价税合计'),
        type: FieldType.currency,
      },
    ],
    queryDataSet: new DataSet({
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
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          labelWidth: '120',
          readOnly: true,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'orderInvoiceDate',
          label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
          type: FieldType.dateTime,
          range: ['orderInvoiceDateTo', 'orderInvoiceDateFrom'],
          defaultValue: {
            orderInvoiceDateTo: moment().startOf('month'),
            orderInvoiceDateFrom: moment(),
          },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'orderInvoiceDateTo',
          type: FieldType.dateTime,
          bind: 'orderInvoiceDate.orderInvoiceDateTo',
        },
        {
          name: 'orderInvoiceDateFrom',
          type: FieldType.dateTime,
          bind: 'orderInvoiceDate.orderInvoiceDateFrom',
        },
        {
          name: 'invoiceTypeObj',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
          type: FieldType.object,
          lovCode: 'HIOP.RULE_INVOICE_TYPE',
          lovPara: { requestType: 'INVOICE_REQUEST' },
          cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
          ignore: FieldIgnore.always,
        },
        {
          name: 'invoiceVariety',
          type: FieldType.string,
          bind: 'invoiceTypeObj.value',
        },
        {
          name: 'invoiceTypeMeaning',
          type: FieldType.string,
          bind: 'invoiceTypeObj.meaning',
        },
        {
          name: 'extNumberObj',
          label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
          type: FieldType.object,
          lovCode: 'HIOP.COMPANY_TAX_CONTROL_INFO',
          cascadeMap: { companyId: 'companyId' },
          computedProps: {
            readOnly: ({ record }) => !record.get('companyObj'),
          },
          ignore: FieldIgnore.always,
        },
        {
          name: 'extNumber',
          type: FieldType.string,
          bind: 'extNumberObj.extNumber',
        },
        {
          name: 'orderCreationDate',
          label: intl.get('hiop.taxRateStatistic.modal.orderCreationDate').d('订单创建日期'),
          type: FieldType.dateTime,
          range: ['orderCreationDateTo', 'orderCreationDateFrom'],
          labelWidth: '110',
          ignore: FieldIgnore.always,
        },
        {
          name: 'orderCreationDateTo',
          type: FieldType.dateTime,
          bind: 'orderCreationDate.orderCreationDateTo',
        },
        {
          name: 'submitDateTo',
          type: FieldType.dateTime,
          bind: 'orderCreationDate.orderCreationDateFrom',
        },
        {
          name: 'applyCreationDate',
          label: intl.get('hiop.taxRateStatistic.modal.applyCreationDate').d('申请单创建日期'),
          type: FieldType.dateTime,
          range: ['applyCreationDateTo', 'applyCreationDateFrom'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'applyCreationDateTo',
          type: FieldType.dateTime,
          bind: 'applyCreationDate.applyCreationDateTo',
        },
        {
          name: 'applyCreationDateFrom',
          type: FieldType.dateTime,
          bind: 'applyCreationDate.applyCreationDateFrom',
        },
        {
          name: 'prepareCreationDate',
          label: intl.get('hiop.taxRateStatistic.modal.prepareCreationDate').d('待开票创建日期'),
          type: FieldType.dateTime,
          range: ['prepareCreationDateTo', 'prepareCreationDateFrom'],
          labelWidth: '120',
          ignore: FieldIgnore.always,
        },
        {
          name: 'prepareCreationDateTo',
          type: FieldType.dateTime,
          bind: 'prepareCreationDate.prepareCreationDateTo',
        },
        {
          name: 'submitDateTo',
          type: FieldType.dateTime,
          bind: 'prepareCreationDate.prepareCreationDateFrom',
        },
      ],
    }),
  };
};
