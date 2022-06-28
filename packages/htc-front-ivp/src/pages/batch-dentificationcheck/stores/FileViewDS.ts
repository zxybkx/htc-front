import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export default (): DataSetProps => {
  return {
    pageSize: 10,
    selection: false,
    primaryKey: 'detailId',
    fields: [
      {
        name: 'invoiceCode',
        label: intl.get('htc.common.view.invoiceCode').d('发票代码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNumber',
        label: intl.get('htc.common.view.invoiceNo').d('发票号码'),
        type: FieldType.string,
      },
      {
        name: 'invoiceDate',
        label: intl.get('htc.common.view.invoiceDate').d('开票日期'),
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'amount',
        label: intl.get('htc.common.view.invoiceAmount').d('发票金额'),
        type: FieldType.currency,
      },
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
        lookupCode: 'HIVP.INVIOCE_AND_BILL_TYPE',
      },
      {
        name: 'recordType',
        label: intl.get('htc.common.view.recordType').d('档案类型'),
        type: FieldType.string,
      },
    ],
  };
};
