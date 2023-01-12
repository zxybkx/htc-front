/**
 * @Description: 专票红字信息表列表-详情行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-13 10:25:12
 * @LastEditTime: 2022-06-14 14:04
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  return {
    paging: false,
    selection: false,
    primaryKey: 'redInvoiceApplyLineId',
    fields: [
      {
        name: 'goodsName',
        label: intl.get('hiop.redInvoiceInfo.modal.goodsName').d('货物或应税劳务、服务名称'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
      },
      {
        name: 'num',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'detailAmount',
        label: intl.get('hiop.redInvoiceInfo.modal.detailAmount').d('金额（不含税）'),
        type: FieldType.currency,
      },
      {
        name: 'taxRate',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'goodsCode',
        label: intl.get('hiop.invoiceWorkbench.modal.commodityNumber').d('商品编码'),
        type: FieldType.string,
      },
      {
        name: 'selfCode',
        label: intl.get('hiop.customerInfo.modal.projectObj').d('自行编码'),
        type: FieldType.string,
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.preferentialPolicyFlag').d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.zeroTaxRateFlag').d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
      },

      {
        name: 'taxPreferPolicyTypeCode',
        label: intl.get('hiop.redInvoiceInfo.modal.taxPreferPolicyTypeCode').d('税收优惠政策'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.TAX_PREFER_POLICY_TYPE_CODE',
      },
      {
        name: 'specialTaxationMethod',
        label: intl.get('hiop.redInvoiceInfo.modal.specialTaxationMethod').d('特定征税方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.SPECIAL_TAXATION_METHOD',
      },
    ],
  };
};
