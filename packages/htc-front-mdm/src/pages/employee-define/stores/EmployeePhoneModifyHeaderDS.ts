/*
 * @Descripttion: 员工修改手机号头DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-2-7 09:10:12
 * @LastEditTime: 2021-02-07 21:06:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';

const modelCode = 'hmdm.employeeDefine';

export default (): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'updateMobile',
        label: intl.get(`${modelCode}.view.infoTableSerialNumber`).d('修改手机号'),
        type: FieldType.string,
        labelWidth: '100',
        pattern: PHONE,
      },
    ],
  };
};
