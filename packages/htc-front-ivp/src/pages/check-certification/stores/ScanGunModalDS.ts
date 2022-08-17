/*
 * @Description: 扫码枪弹窗
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-08-16 17:08:51
 * @LastEditTime: 2022-08-17 17:20:05
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  return {
    primaryKey: 'scanGun',
    paging: false,
    fields: [
      {
        name: 'invoiceType',
        type: FieldType.string,
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        lookupCode: 'HIVP.INVOICE_TYPE',
        transformResponse(value) {
          return value === '20' ? '08' : value;
        },
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
      },
      {
        name: 'invoiceNo',
        type: FieldType.string,
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        required: true,
      },
      {
        name: 'invoiceDate',
        type: FieldType.string,
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        required: true,
      },
      {
        name: 'invoiceAmount',
        type: FieldType.string,
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        required: true,
      },
    ],
  };
};
