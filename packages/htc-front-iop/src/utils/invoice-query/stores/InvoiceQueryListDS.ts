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
  const { companyCode, employeeNum, employeeId, taxpayerNumber } = dsProps;

  return {
    transport: {
      read: (): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/htc-enterprise-information/smart-head-up`;
        const axiosConfig: AxiosRequestConfig = {
          url,
          params: {
            tenantId,
            companyCode,
            employeeId,
            employeeNumber: employeeNum,
            taxpayerNumber,
          },
          method: 'POST',
        };
        return axiosConfig;
      },
    },
    events: {
      // beforeLoad: ({ data }) => {
      //   console.log('///', data);
      //   // const oldData = [...data];
      //   // data.splice(0, data.length);
      //   // if (oldData[0] && oldData[0].data.length > 0) {
      //   //   oldData[0].data.forEach((rec) => data.push(rec));
      //   // }
      // },
    },
    // pageSize: 10,
    paging: false,
    selection: DataSetSelection.single,
    fields: [
      {
        name: 'taxpayerName',
        label: intl.get('hiop.invoiceQuery.modal.enterpriseName').d('企业名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'depositBankName',
        label: intl.get('htc.common.modal.depositBankName').d('开户行名称'),
        type: FieldType.string,
      },
      {
        name: 'bankAccount',
        label: intl.get('htc.common.modal.bankAccount').d('银行账号'),
        type: FieldType.string,
      },
      {
        name: 'phoneNumber',
        label: intl.get('htc.common.modal.phoneNumber').d('联系电话'),
        type: FieldType.string,
      },
      {
        name: 'address',
        label: intl.get('htc.common.modal.address').d('地址'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerRiskLevel',
        label: intl.get('htc.common.modal.taxpayerRiskLevel').d('纳税人风险等级'),
        type: FieldType.string,
      },
    ],
    queryDataSet: new DataSet({
      fields: [
        {
          name: 'taxpayerRetrievedName',
          label: intl.get('hiop.invoiceQuery.modal.enterpriseName').d('企业名称'),
          type: FieldType.string,
          required: true,
          computedProps: {
            pattern: function pattern(_ref4) {
              const { record } = _ref4;
              const validateName = new RegExp(/^[\u4e00-\u9fa5]{4,}$/);
              const value = record.get('taxpayerRetrievedName');
              if (value) {
                return validateName;
              }
            },
          },
          defaultValidationMessages: {
            patternMismatch: intl
              .get('hiop.invoiceQuery.message.enterpriseName')
              .d('请输入至少4个中文字符'),
          },
        },
      ],
    }),
  };
};
