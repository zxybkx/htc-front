/*
 * @Description: 发票交付
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-08 16:22:07
 * @LastEditTime: 2022-07-12 10:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import {
    Modal,
} from 'choerodon-ui/pro';
export default (dsParams): DataSetProps => {
    const API_PREFIX = commonConfig.IOP_API || '';
    const tenantId = getCurrentOrganizationId();
    return {
        transport: {
            submit: (config): AxiosRequestConfig => {
                config.data.forEach(item => {
                    config.data = item.invoiceInformation.split(',').map(inner => {
                        return {
                            ...item,
                            invoiceInformation: inner
                        }
                    })
                })
                const url = `${API_PREFIX}/v1/${tenantId}/invoice-delivery-infos`;
                const axiosConfig: AxiosRequestConfig = {
                    ...config,
                    url,
                    method: 'POST',
                };
                return axiosConfig;
            },
        },
        events: {
            // submit({ data }) {
            //     // console.log('//', data, Object.keys(data[0]));
            //     // let result = true;
            //     // // 判断除发票信息是否有其他字段更改
            //     // if (Object.keys(data[0]).length > 3) {
            //     //     Modal.confirm({
            //     //         title: 'Confirm',
            //     //         children: '是否确认保存？保存后无法批量修改。'
            //     //     }).then((button) => {
            //     //         result = (button === 'ok')
            //     //     });
            //     // }
            //     // console.log('result', result);

            //     // // return result;
            //     // return false;

            // }
        },
        fields: [
            {
                name: 'invoiceInformation',
                label: intl.get('hiop.redInvoiceInfo.').d('发票信息'),
                type: FieldType.string,
                defaultValue: dsParams.invoiceInformation,
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
                label: dsParams.type === 0 ?
                    intl.get('hiop.redInvoiceInfo.moda.taxType').d('重新推送邮箱')
                    : intl.get('hiop.redInvoiceInfo.moda.taxType').d('接收通知邮箱'),
                type: FieldType.string,
                required: dsParams.type === 0
            },
            {
                name: 'whetherReceiv',
                label: intl.get('hiop.redInvoiceInfo.modl.taxType').d('收票方已收'),
                type: FieldType.boolean,
            },
            {
                name: 'descr',
                label: intl.get('hiop.redInvoiceInfo.modal.electronicrRemark').d('备注说明'),
                type: FieldType.string,
            },
        ],
    };
};
