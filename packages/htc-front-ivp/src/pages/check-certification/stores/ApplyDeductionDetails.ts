/**
 * @Description:当期已勾选发票-申请抵扣明细
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-05-05 15:07
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  return {
    paging: false,
    selection: false,
    primaryKey: 'applyDeductionDetail',
    fields: [
      {
        name: 'count',
        label: intl.get('htc.common.orderSeq').d('序号'),
        type: FieldType.string,
      },
      {
        name: 'fpdm',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'fphm',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'kprq',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        transformResponse: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'xfnsrmc',
        label: intl.get('htc.common.view.salerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'fpje',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'yxse',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'sl',
        label: intl.get('htc.common.view.taxRate').d('税率'),
        type: FieldType.string,
      },
      {
        name: 'gxsj',
        label: intl.get(`${modelCode}.view.ConfirmOrCertificationDate`).d('确认/认证日期'),
        type: FieldType.date,
      },
      {
        name: 'fplx',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVC.INVOICE_TYPE',
      },
      {
        name: 'fpzt',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceState').d('发票状态'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_STATE',
      },
    ],
  };
};
