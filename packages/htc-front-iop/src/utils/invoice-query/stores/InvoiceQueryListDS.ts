/**
 * @Description:开票订单查询
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 17:01:22
 * @LastEditTime: 2021-01-21 15:32:35
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default (dsProps): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  const { invoiceType, companyCode, employeeNum } = dsProps;
  const isQueryAllChecked = invoiceType && ['0', '52'].includes(invoiceType);
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { isQueryAll } = config.data;
        let url = `${API_PREFIX}/v1/${tenantId}/htc-enterprise-information/enterprise-information-standard`;
        if (isQueryAll === 'Y') {
          url = `${API_PREFIX}/v1/${tenantId}/htc-enterprise-information/enterprise-information`;
        }
        const axiosConfig: AxiosRequestConfig = {
          // ...config,
          url,
          params: {
            // ...config.params,
            tenantId,
            companyCode,
            employeeNumber: employeeNum,
            enterpriseNameAndCodeDTO: { enterpriseName: config.data.enterpriseName },
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    events: {
      beforeLoad: ({ data }) => {
        const oldData = [...data];
        data.splice(0, data.length);
        if (oldData[0] && oldData[0].data.length > 0) {
          oldData[0].data.forEach((rec) => data.push(rec));
        }
      },
    },
    // pageSize: 10,
    paging: false,
    selection: DataSetSelection.single,
    fields: [
      {
        name: 'enterpriseName',
        label: intl.get('hiop.invoiceQuery.modal.enterpriseName').d('企业名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'businessAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'corporateBankAccount',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'enterpriseName',
          label: intl.get('hiop.invoiceQuery.modal.enterpriseName').d('企业名称'),
          type: FieldType.string,
          required: true,
          computedProps: {
            pattern: function pattern(_ref4) {
              const { record } = _ref4;
              const validateName = new RegExp(/^[\u4e00-\u9fa5]{3,}$/);
              const value = record.get('enterpriseName');
              if (value) {
                return validateName;
              }
            },
          },
          defaultValidationMessages: {
            patternMismatch: intl
              .get('hiop.invoiceQuery.message.enterpriseName')
              .d('请输入至少3个中文字符'),
          },
        },
        {
          name: 'isQueryAll',
          label: intl.get('hiop.invoiceQuery.modal.isQueryAll').d('查询全部信息'),
          type: FieldType.boolean,
          trueValue: 'Y',
          falseValue: 'N',
          defaultValue: 'N',
          readOnly: isQueryAllChecked,
        },
      ],
    }),
  };
};
