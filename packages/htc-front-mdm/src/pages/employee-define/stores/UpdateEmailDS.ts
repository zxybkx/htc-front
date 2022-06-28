/**
 * @Description: 员工修改邮箱
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-3-5 14:10:53
 * @LastEditTime: 2022-06-20 16:12
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';

const modelCode = 'hmdm.updateEmail';

export default (email): DataSetProps => {
  return {
    paging: false,
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'email',
        label: intl.get(`${modelCode}.view.email`).d('旧邮箱'),
        type: FieldType.string,
        defaultValue: email,
        readOnly: true,
        required: true,
      },
      {
        name: 'UpdateEmail',
        label: intl.get(`${modelCode}.view.UpdateEmail`).d('新邮箱'),
        type: FieldType.string,
        pattern: EMAIL,
        required: true,
      },
    ],
  };
};
