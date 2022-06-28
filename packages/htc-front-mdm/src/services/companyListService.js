/**
 * @Description: 公司列表
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HMDM_API = commonConfig.MDM_API || '';
const HCAN_API = commonConfig.CHAN_API || '';
const HIOP_API = commonConfig.IOP_API || '';

/**
 * 获取租户协议
 * @async
 * @function getTenantAgreement
 * @returns {object} fetch Promise
 */
export async function getTenantAgreement(params) {
  return request(`${HMDM_API}/v1/tenant-agreementss`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取秘钥
 * @async
 * @function responseDecryptionKey
 * @returns {object} fetch Promise
 */
export async function responseDecryptionKey(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HCAN_API}/v1/${tenantId}/secret-key/response-decryption-key`, {
    method: 'GET',
    query: otherParams,
    responseType: 'text',
  });
}

/**
 * 令牌刷新
 * @async
 * @function refreshToken
 * @returns {object} fetch Promise
 */
export async function refreshToken(params) {
  return request(`${HMDM_API}/v1/check-token/generate`, {
    method: 'POST',
    query: params,
    responseType: 'text',
  });
}

/**
 * 设备在线查询
 * @async
 * @function deviceStatusQuery
 * @returns {object} fetch Promise
 */
export async function deviceStatusQuery(params) {
  const { tenantId, deviceOnlineStatus, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/htc-invoice-out-orders/site-device-status-query`, {
    method: 'POST',
    query: otherParams,
    body: deviceOnlineStatus,
  });
}
