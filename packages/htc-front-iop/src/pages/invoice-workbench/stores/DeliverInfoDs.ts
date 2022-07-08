/*
 * @Description: 发票交付
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-08 16:22:07
 * @LastEditTime: 2022-07-08 17:32:44
 * @Copyright: Copyright (c) 2020, Hand
 */
// import commonConfig from '@htccommon/config/commonConfig';
// import { AxiosRequestConfig } from 'axios';
// import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export default (): DataSetProps => {
    return {
        fields: [
            {
                name: 'invoiceInformation',
                label: intl.get('hiop.redInvoiceInfo.').d('发票信息'),
                type: FieldType.string,
                readOnly: true,
            },
            {
                name: 'postLogisticsCompany',
                label: intl.get('hiop.redInvoiceInfo.modal.redInfo').d('邮寄物流公司'),
                lookupCode: 'HTC.POST_LOGISTICS_COMPANY',
            },
            {
                name: 'postalLogisticsSingleNumber',
                label: intl.get('hiop.redInvoiceInfo.modal.redInfoSeri').d('邮寄物流单号'),
                type: FieldType.string,
            },
            {
                name: 'receiveNotificationEmail',
                label: intl.get('hiop.redInvoiceInfo.moda.taxType').d('接收通知邮箱'),
                type: FieldType.string,
            },
            {
                name: 'whetherReceiv',
                label: intl.get('hiop.redInvoiceInfo.modl.taxType').d('收票方已收'),
                type: FieldType.boolean,
            },
        ],
    };
};
