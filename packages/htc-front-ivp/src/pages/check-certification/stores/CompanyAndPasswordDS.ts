/**
 * @Description: 公司和税盘密码行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-11-08 16:02:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      submit: ({ data, params }) => {
        const { companyCode, taxDiskPassword } = data[0];
        return {
          url: `${API_PREFIX}/v1/${tenantId}/enterprise-file-infos/update-password`,
          params: {
            ...params,
            companyCode,
            taxDiskPassword,
          },
          method: 'POST',
        };
      },
    },
    primaryKey: 'companyId',
    selection: false,
    paging: false,
    fields: [
      {
        name: 'companyId',
        type: FieldType.number,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyName',
        label: intl.get('hzero.hzeroTheme.page.companyName').d('公司'),
        type: FieldType.string,
        readOnly: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'taxDiskPassword',
        label: intl.get(`${modelCode}.view.taxDiskPassword`).d('税盘密码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'inChannelCode',
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
    ],
  };
};
