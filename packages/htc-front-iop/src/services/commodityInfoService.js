/**
 * @Description:商品信息服务
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 15:31:45
 * @LastEditTime: 2020-12-11 10:29:55
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIOP_API = commonConfig.IOP_API || '';

/**
 * 初始化商品信息列表
 * @async
 * @function initCommodity
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function initCommodity(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/commodity-list-infos/init-commodity`, {
    method: 'GET',
    query: otherParams,
  });
}
