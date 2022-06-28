/**
 * @Description: 员工修改手机号行DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2021-02-07 09:10:12
 * @LastEditTime: 2021-02-07 09:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import commonConfig from '@htccommon/config/commonConfig';

const modelCode = 'hmdm.employeeDefine';

export default (dsProps): DataSetProps => {
  const HMDM_API = commonConfig.MDM_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { mobile } = dsProps;
        const url = `${HMDM_API}/v1/${organizationId}/employee-infos/query-employee-company-by-mobile/${mobile}`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    selection: DataSetSelection.multiple,
    primaryKey: 'employeeDefine',
    fields: [
      {
        name: 'companyId',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.unit`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'rolesMeaning',
        label: intl.get(`${modelCode}.view.unit`).d('员工角色'),
        type: FieldType.string,
      },
    ],
  };
};
