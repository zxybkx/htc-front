/**
 * @Description: 专票红字信息表列表-详情头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-12 17:54:12
 * @LastEditTime: 2022-06-14 14:04
 * @Copyright: Copyright (c) 2021, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (dsParams): DataSetProps => {
  const HIOP_API = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${tenantId}/red-invoice-infos/${dsParams.headerId}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          ...config.params,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    primaryKey: 'redInvoiceApplyHeaderId',
    fields: [
      {
        name: 'redInvoiceApplyHeaderId',
        type: FieldType.string,
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.redInfoSerialNumber').d('信息表编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxType',
        label: intl.get('hiop.redInvoiceInfo.modal.taxType').d('税种类别'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_TYPE',
        readOnly: true,
      },
      {
        name: 'applicantType',
        label: intl.get('hiop.redInvoiceInfo.modal.sourceOfApplication').d('申请来源'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.APPLICANT_FOR_RED_REQUISITION',
        readOnly: true,
      },
      {
        name: 'redInvoiceConfirmStatus',
        label: intl
          .get('hiop.invoiceReq.modal.redInvoiceConfirmationStatus')
          .d('红字发票确认单状态'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RED_APPLY_STATUS',
        readOnly: true,
      },
      {
        name: 'redMarkReason',
        label: intl.get('hiop.invoiceWorkbench.modal.redMarkReason').d('红冲原因'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.REDREASON',
        readOnly: true,
      },
      {
        name: 'issueRedInvoiceFlag',
        label: intl.get('hiop.redInvoiceInfo.modal.issueRedInvoiceFlag').d('是否开具红字发票'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RED_INVOICE_FLAG',
        readOnly: true,
      },
      {
        name: 'redInvoiceConfirmationNo',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceConfirmationNo').d('红字确认单编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'redInvoiceNo',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceNo').d('红字发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceSource',
        label: intl.get('hivp.myInvoice.view.sourceCode').d('发票来源'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RED_INVOICE_SOURCE',
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.redInvoiceInfo.modal.blueNumber').d('蓝票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceDate',
        label: intl.get('hiop.redInvoiceInfo.modal.blueInvoiceDate').d('蓝字开票日期'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueExcludeTaxAmount',
        label: intl.get('hiop.redInvoiceInfo.modal.blueExcludeTaxAmount').d('蓝字合计不含税金额'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueTotalTaxAmount',
        label: intl.get('hiop.redInvoiceInfo.modal.blueTotalTaxAmount').d('蓝字合计税额'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get('hiop.redInvoiceInfo.modal.redInvoiceDate').d('填开时间'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'overdueStatus',
        label: intl.get('hiop.redInvoiceInfo.modal.overdueStatus').d('信息表类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INFORMATION_TABLE_TYPE ',
        readOnly: true,
      },
      {
        name: 'infoStatusName',
        label: intl.get('hiop.redInvoiceInfo.modal.infoStatusName').d('信息表状态'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requisitionDescription',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionDescription').d('申请说明'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requisitionReason',
        label: intl.get('hiop.redInvoiceInfo.modal.requisitionReason').d('申请原因'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'goodsVersion',
        label: intl.get('hiop.redInvoiceInfo.modal.goodsVersion').d('商品编码版本号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'multiTaxFlag',
        label: intl.get('hiop.redInvoiceInfo.modal.multiTaxFlag').d('多税率标志'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.MULTI_TAX_MARK',
        readOnly: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get('hiop.redInvoiceInfo.modal.taxDiskNumber').d('机器编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'extensionNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_INFO_EXTENSION',
        lovPara: { companyId: dsParams.companyId, employeeId: dsParams.employeeId },
        readOnly: true,
      },
      {
        name: 'extensionNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.string,
        bind: 'extensionNumberObj.extNumber',
        readOnly: true,
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        readOnly: true,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.redInvoiceInfo.modal.blueInvoiceCode').d('蓝票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.redInvoiceInfo.modal.blueInvoiceNo').d('蓝票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceDate').d('开票日期'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerTaxNo',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceAmount',
        label: intl.get('hiop.redInvoiceInfo.modal.invoiceAmount').d('合计金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTaxAmount').d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceWorkbench.modal.name').d('名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
