/**
 * @Description:当期已勾选发票-申请抵扣汇总
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-05-05 15:06
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hivp.checkCertification';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IVP_API || '';
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${organizationId}/invoice-operation/deduction-apply-report`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            organizationId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    paging: false,
    selection: false,
    primaryKey: 'applyDeductionSummary',
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('htc.common.view.invoiceType').d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'deductionInvoiceNum',
        label: intl.get(`${modelCode}.view.numberOfCopies`).d('份数'),
        type: FieldType.number,
      },
      {
        name: 'deductionAmount',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'deductionValidTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
      {
        name: 'nonDeductionInvoiceNum',
        label: intl.get(`${modelCode}.view.numberOfCopies`).d('份数'),
        type: FieldType.number,
      },
      {
        name: 'nonDeductionAmount',
        label: intl.get('htc.common.view.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'nonDeductionValidTaxAmount',
        label: intl.get('hivp.bill.view.EffectiveTax').d('有效税额'),
        type: FieldType.currency,
      },
    ],
  };
};

const ApplyDeductionHeader = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'tenantName',
        label: intl.get('htc.common.view.tenantName').d('租户名称'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'currentCertState',
        label: intl.get('hivp.taxRefund.view.currentCertState').d('当前认证状态'),
        type: FieldType.string,
        lookupCode: 'HIVP.CHECK_CONFIRM_STATE',
        readOnly: true,
      },
      {
        name: 'currentPeriod',
        label: intl.get('hivp.taxRefund.view.tjyf').d('当前所属期'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'queryTime',
        label: intl.get(`${modelCode}.view.queryTime`).d('报表更新时间'),
        type: FieldType.string,
        readOnly: true,
      },
    ],
  };
};
export { ApplyDeductionHeader };
