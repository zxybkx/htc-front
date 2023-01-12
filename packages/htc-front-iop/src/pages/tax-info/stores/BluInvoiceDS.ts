/**
 * @Description: 税控信息-蓝字发票统计信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-11 10:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2023, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  return {
    selection: false,
    paging: false,
    primaryKey: 'blueInkInvoice',
    fields: [
      {
        name: 'syzzfpzs',
        label: intl.get('hiop.taxInfo.modal.paperInvoicesNumber').d('剩余纸质发票张数'),
        type: FieldType.number,
      },
      {
        name: 'ysyfpzs',
        label: intl.get('hiop.taxInfo.modal.numberOfInvoicesUsed').d('已使用发票张数'),
        type: FieldType.number,
      },
      {
        name: 'ykjlpzs',
        label: intl.get('hiop.taxInfo.modal.numberOfBlueTicketsIssued').d('已开具蓝票张数'),
        type: FieldType.number,
      },
      {
        name: 'ysyfpsxed',
        label: intl.get('hiop.taxInfo.modal.usedInvoiceCreditLine').d('已使用发票授信额度'),
        type: FieldType.number,
      },
      {
        name: 'zsxed',
        label: intl.get('hiop.taxInfo.modal.totalCreditLine').d('总授信额度'),
        type: FieldType.number,
      },
      {
        name: 'fphjje',
        label: intl.get('hiop.taxInfo.modal.totalInvoiceAmount').d('发票合计金额'),
        type: FieldType.currency,
      },
      {
        name: 'sysxed',
        label: intl.get('hiop.taxInfo.modal.remainingCreditLine').d('剩余授信额度'),
        type: FieldType.number,
      },
      {
        name: 'fphjse',
        label: intl.get('hiop.taxRateStatistic.modal.invoiceTotalTax').d('发票合计税额'),
        type: FieldType.currency,
      },
    ],
  };
};
