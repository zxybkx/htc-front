/*
 * @Description:发票池-档案归档
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-14 09:10:12
 * @LastEditTime: 2020-09-29 17:20:19
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const modelCode = 'hivp.invoicesFileArchive';

export default (): DataSetProps => {
  return {
    events: {
      update: ({ record, name, value }) => {
        if (name === 'archiveMethod') {
          if (value === '0') {
            record.set('archiveDate', null);
          }
          if (value === '1') {
            record.set('archiveDate', null);
          }
        }
      },
    },
    fields: [
      {
        name: 'companyDesc',
        label: intl.get('htc.common.modal.companyName').d('所属公司'),
        type: FieldType.string,
        required: true,
        readOnly: true,
      },
      {
        name: 'companyId',
        type: FieldType.string,
        required: true,
        readOnly: true,
      },
      {
        name: 'curDate',
        label: intl.get('hivp.invoicesArchiveUpload.view.curDate').d('当前日期'),
        type: FieldType.date,
        defaultValue: moment(),
        required: true,
        readOnly: true,
      },
      {
        name: 'updateEnteredFlag',
        label: intl.get(`${modelCode}.view.updateEnteredFlag`).d('更新状态为已入账'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        labelWidth: '130',
      },
      {
        name: 'entryAccountDate',
        label: intl.get('hivp.bill.view.entryAccountDate').d('入账日期'),
        type: FieldType.date,
        defaultValue: moment(),
        required: true,
        transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'entryPeriodFlag',
        label: intl.get(`${modelCode}.view.entryPeriodFlag`).d('按入账期间归档'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        required: true,
        labelWidth: '120',
      },
      {
        name: 'curPeriodFlag',
        label: intl.get(`${modelCode}.view.curPeriodFlag`).d('按当前期间归档'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
        labelWidth: '120',
      },
      {
        name: 'archiveMethod',
        label: intl.get(`${modelCode}.view.archiveMethod`).d('归档方式'),
        type: FieldType.string,
        lookupCode: 'HTC.HIVP.ARCHIVE_METHOD',
        defaultValue: '0',
      },
      {
        name: 'archiveDate',
        label: intl.get(`${modelCode}.view.archiveDate`).d('归档期间'),
        type: FieldType.month,
        transformRequest: value => value && moment(value).format('YYYY-MM'),
        computedProps: {
          required: ({ record }) => record.get('archiveMethod') === '2',
        },
      },
    ],
  };
};
