/**
 * @Description: 专票红字信息表列表-详情头
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-12 17:54:12
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.redInvoice';

export default (dsParams): DataSetProps => {
  const HIOP_API = `${commonConfig.IOP_API}`;
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
    primaryKey: 'redInvoiceRequisitionHeaderId',
    fields: [
      {
        name: 'redInvoiceRequisitionHeaderId',
        type: FieldType.number,
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('信息表编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'taxType',
        label: intl.get(`${modelCode}.view.taxType`).d('税种类别'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_TYPE',
        readOnly: true,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get(`${modelCode}.view.redInvoiceDate`).d('填开时间'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('信息表类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INFORMATION_TABLE_TYPE ',
        readOnly: true,
      },
      {
        name: 'infoStatusName',
        label: intl.get(`${modelCode}.view.infoStatusName`).d('信息表状态'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requisitionDescription',
        label: intl.get(`${modelCode}.view.requisitionDescription`).d('申请说明'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requisitionReason',
        label: intl.get(`${modelCode}.view.requisitionReason`).d('申请原因'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'goodsVersion',
        label: intl.get(`${modelCode}.view.goodsVersion`).d('商品编码版本号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'multiTaxFlag',
        label: intl.get(`${modelCode}.view.multiTaxFlag`).d('多税率标志'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.MULTI_TAX_MARK',
        readOnly: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('机器编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'extensionNumberObj',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_INFO_EXTENSION',
        lovPara: { companyId: dsParams.companyId, employeeId: dsParams.employeeId },
        readOnly: true,
      },
      {
        name: 'extensionNumber',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
        type: FieldType.string,
        bind: 'extensionNumberObj.extNumber',
        readOnly: true,
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HIOP.SPECIAL_VAT_INVOICE_TYPE',
        readOnly: true,
        bind: 'invoiceTypeCodeObj.value',
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sellerTaxNo',
        label: intl.get(`${modelCode}.view.sellerTaxNo`).d('销方税号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('合计金额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('合计税额'),
        type: FieldType.currency,
        readOnly: true,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方税号'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
