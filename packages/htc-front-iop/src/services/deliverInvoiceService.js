/*
 * @Description: 发票交付
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-07-12 14:18:17
 * @LastEditTime: 2022-07-13 17:43:38
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
const HIOP_API = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();
/**
 * @description: 纸票交付=>发送交付通知
 * @function: paperDeliverNotice
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function paperDeliverNotice(params) {
    return request(`${HIOP_API}/v1/${tenantId}/invoice-delivery-infos/sendDeliveryNotice`, {
        method: 'POST',
        body: params,
    });
}
/**
 * @description: 电票交付=>重新推送
 * @function: electronicRePush
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function electronicRePush(params) {
    return request(`${HIOP_API}/v1/${tenantId}/invoice-delivery-infos/toPush`, {
        method: 'POST',
        body: params,
    });
}
