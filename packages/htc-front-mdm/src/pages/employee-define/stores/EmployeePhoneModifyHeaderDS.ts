/**
 * @Description: 员工修改手机号头DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-2-7 09:10:12
 * @LastEditTime: 2021-02-07 21:06:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

const modelCode = 'hmdm.employeeDefine';

export default (dsProps): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'internationalTelCode',
        label: intl.get(`${modelCode}.view.internationalTelCode`).d('国际区号'),
        type: FieldType.string,
        lookupCode: 'HPFM.IDD',
        required: true,
        defaultValue: dsProps.internationalTelCode,
      },
      {
        name: 'updateMobile',
        label: intl.get(`${modelCode}.view.updateMobile`).d('联系方式'),
        type: FieldType.string,
        required: true,
        computedProps: {
          pattern: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return phoneReg;
            }
          },
          defaultValidationMessages: ({ record }) => {
            if (record.get('internationalTelCode') === '+86') {
              return { patternMismatch: '手机格式不正确' };
            }
          },
        },
        defaultValue: dsProps.mobile,
      },
      {
        name: 'updateEmail',
        label: intl.get(`${modelCode}.view.updateEmail`).d('电子邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        defaultValue: dsProps.email,
      },
    ],
  };
};
