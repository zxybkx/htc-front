/**
 * @Description: 发票交付
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-08 16:22:07
 * @LastEditTime: 2022-07-19 10:44:33
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (dsParams): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/invoice-delivery-infos/${config.data.params}`;
        const axiosConfig: AxiosRequestConfig = {
          url,
          method: 'GET',
        };
        return axiosConfig;
      },
      submit: ({ data, params }) => {
        let lists;
        data.forEach(item => {
          const invoiceOrderHeaderIds = item.invoiceOrderHeaderId.split(',');
          lists = item.invoiceInformation.split(',').map((inner, index) => {
            return {
              ...item,
              invoiceInformation: inner,
              invoiceOrderHeaderId: invoiceOrderHeaderIds[index],
            };
          });
        });
        return {
          url: `${API_PREFIX}/v1/${tenantId}/invoice-delivery-infos`,
          data: lists,
          params,
          method: 'POST',
        };
      },
    },
    fields: [
      {
        name: 'invoiceOrderHeaderId',
        type: FieldType.string,
        defaultValue: dsParams.invoiceOrderHeaderIds,
      },
      {
        name: 'invoiceDeliveryInfoId',
        type: FieldType.string,
      },
      {
        name: 'invoiceInformation',
        label: intl.get('hiop.invoiceReq.modal.invoiceNums').d('发票信息'),
        type: FieldType.string,
        defaultValue: dsParams.invoiceInformation,
        readOnly: true,
      },
      {
        name: 'postLogisticsCompany',
        label: intl.get('hiop.invoiceWorkbench.view.logisticsCompany').d('邮寄物流公司'),
        type: FieldType.string,
        lookupCode: 'HTC.POST_LOGISTICS_COMPANY',
      },
      {
        name: 'postalLogisticsSingleNumber',
        label: intl.get('hiop.invoiceWorkbench.view.shipmentNumber').d('邮寄物流单号'),
        type: FieldType.string,
      },
      {
        name: 'receiveNotificationEmail',
        label:
          dsParams.type === 0
            ? intl.get('hiop.invoiceWorkbench.view.rePushEmail').d('重新推送邮箱')
            : intl.get('hiop.invoiceWorkbench.view.receiveNotificationEmail').d('接收通知邮箱'),
        type: FieldType.email,
      },
      {
        name: 'whetherReceiv',
        label: intl.get('hiop.invoiceWorkbench.view.receiptReceived').d('收票方已收'),
        type: FieldType.boolean,
      },
      {
        name: 'descr',
        label: intl.get('hiop.invoiceWorkbench.view.deliverRemark').d('备注说明'),
        type: FieldType.string,
      },
    ],
  };
};
