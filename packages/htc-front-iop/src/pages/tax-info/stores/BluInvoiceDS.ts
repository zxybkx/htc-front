/**
 * @Description: 税控信息-蓝字发票统计信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-11 10:10
 * @LastEditTime:
 * @Copyright: Copyright (c) 2023, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/tax-line-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 5,
    selection: false,
    primaryKey: 'blueInkInvoice',
    fields: [
      {
        name: 'invoiceType',
        label: intl.get('hiop.taxInfo.modal.paperInvoicesNumber').d('剩余纸质发票张数'),
        type: FieldType.number,
      },
      {
        name: 'lockDate',
        label: intl.get('hiop.taxInfo.modal.numberOfInvoicesUsed').d('已使用发票张数'),
        type: FieldType.number,
      },
      {
        name: 'singleInvoiceLimit',
        label: intl.get('hiop.taxInfo.modal.numberOfBlueTicketsIssued').d('已开具蓝票张数'),
        type: FieldType.number,
      },
      {
        name: 'uploadExpirationDate',
        label: intl.get('hiop.taxInfo.modal.usedInvoiceCreditLine').d('已使用发票授信额度'),
        type: FieldType.number,
      },
      {
        name: 'offLineTimeLimit',
        label: intl.get('hiop.taxInfo.modal.totalCreditLine').d('总授信额度'),
        type: FieldType.number,
      },
      {
        name: 'offLineAmountLimit',
        label: intl.get('hiop.taxInfo.modal.totalInvoiceAmount').d('发票合计金额'),
        type: FieldType.currency,
      },
      {
        name: 'offLineRemainingAmount',
        label: intl.get('hiop.taxInfo.modal.remainingCreditLine').d('剩余授信额度'),
        type: FieldType.number,
      },
      {
        name: 'offLineExtension',
        label: intl.get('hiop.taxRateStatistic.modal.invoiceTotalTax').d('发票合计税额'),
        type: FieldType.currency,
      },
    ],
  };
};
