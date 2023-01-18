/**
 * @Description: 专票红字申请单列表DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-14 09:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { getTenantAgreementCompany } from '@htccommon/services/commonService';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default (): DataSetProps => {
  const HIOP_API = commonConfig.IOP_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${organizationId}/red-invoice-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'redInvoiceInfoHeaderId',
    fields: [
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.redInfoSerialNumber').d('红字信息表编码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'redInvoiceConfirmStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.confirmationSheetStatus').d('确认单状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RED_APPLY_STATUS',
      },
      {
        name: 'redInvoiceInfoHeaderId',
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.state').d('状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_INFO_STATUS',
        required: true,
      },
      {
        name: 'confirmType',
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.CONFIRM_TYPE',
      },
      {
        name: 'redInvoiceDate',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
        type: FieldType.dateTime,
        transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        required: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.TaxDiskNumber').d('金税盘编号（机器编码）'),
        type: FieldType.string,
      },
      {
        name: 'extensionNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceObj',
        label: intl.get('hiop.invoiceWorkbench.label.blueInvoice').d('蓝字发票'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceCode').d('蓝字发票代码'),
        type: FieldType.string,
        bind: 'blueInvoiceObj.invoiceCode',
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceNo').d('蓝字发票号码'),
        type: FieldType.string,
        bind: 'blueInvoiceObj.invoiceNo',
      },
      {
        name: 'invoiceAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerName').d('购方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('hiop.invoiceWorkbench.modal.buyerTaxpayerNumber').d('购方纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerTaxNo',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerTaxpayerNumber').d('销方纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'overdueStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.overdueStatus').d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: async ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const {
              companyCode,
              companyId,
              employeeNum,
              employeeName,
              mobile,
              taxpayerNumber,
            } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
            record.set('taxpayerNumber', taxpayerNumber);
            /* 设置金税盘编码默认值 */
            record.set('taxDiskNumberObj', null);
            record.set('extensionNumber', null);
            const resCop = await getTenantAgreementCompany({
              companyId: value.companyId,
              tenantId: organizationId,
            });
            const { outChannelCode } = resCop;
            if (outChannelCode !== 'DOUBLE_CHANNEL') {
              const taxDiskRes = await queryUnifyIdpValue('HIOP.TAX_DISK_NUMBER', { companyId });
              if (taxDiskRes && taxDiskRes.length > 0) {
                const taxNumberInfo = taxDiskRes[0];
                record.set('taxDiskNumberObj', taxNumberInfo);
                record.set('extensionNumber', taxNumberInfo.extNumber);
              }
            }
          }
          if (value && name === 'taxDiskNumberObj') {
            const { extNumber } = value;
            record.set('extensionNumberView', extNumber);
          }
          if (name === 'invoiceTypeCode' && !['0', '52'].includes(value)) {
            record.set('taxDiskNumberObj', null);
            record.set('extensionNumber', null);
            record.set('overdueStatus', null);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.label.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId: organizationId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
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
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'outChannelCode',
          type: FieldType.string,
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          label: intl.get('hiop.redInvoiceInfo.modal.email').d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        // {
        //   name: 'taxpayerNumber',
        //   label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
        //   type: FieldType.string,
        //   readOnly: true,
        //   ignore: FieldIgnore.always,
        //   bind: 'companyObj.taxpayerNumber',
        // },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'redInvoiceDate',
          label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
          type: FieldType.dateTime,
          range: ['redInvoiceDateFrom', 'redInvoiceDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'redInvoiceDateFrom',
          label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDateFrom').d('填开时间从'),
          type: FieldType.dateTime,
          bind: 'redInvoiceDate.redInvoiceDateFrom',
        },
        {
          name: 'redInvoiceDateTo',
          label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDateTo').d('填开时间至'),
          type: FieldType.dateTime,
          bind: 'redInvoiceDate.redInvoiceDateTo',
        },
        {
          name: 'taxDiskNumberObj',
          label: intl.get('hiop.redInvoiceInfo.modal.taxDiskNumberObj').d('金税盘编号'),
          type: FieldType.object,
          lovCode: 'HIOP.TAX_DISK_NUMBER',
          computedProps: {
            lovPara: ({ record }) => {
              return { companyId: record.get('companyId') };
            },
            required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
          },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'taxDiskNumber',
          label: intl.get('hiop.redInvoiceInfo.modal.taxDiskNumberObj').d('金税盘编号'),
          type: FieldType.string,
          bind: 'taxDiskNumberObj.taxDiskNumber',
        },
        {
          name: 'extensionNumberView',
          label: intl.get(`hiop.invoiceWorkbench.modal.extNumber`).d('分机号'),
          type: FieldType.string,
          readOnly: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'extensionNumber',
          label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
          type: FieldType.string,
          bind: 'taxDiskNumberObj.extNumber',
          readOnly: true,
          computedProps: {
            required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
          },
        },
        {
          name: 'invoiceTypeCode',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
          // defaultValue: 0,
          // required: true,
        },
        {
          name: 'overdueStatus',
          label: intl.get('hiop.redInvoiceInfo.modal.overdueStatus').d('逾期状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.LATE_STATUS',
          // defaultValue: 'N',
          computedProps: {
            required: ({ record }) => ['0', '52'].includes(record.get('invoiceTypeCode')),
          },
        },
      ],
    }),
  };
};
