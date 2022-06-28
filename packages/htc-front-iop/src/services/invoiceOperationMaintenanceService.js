/**
 * @Description: 开票订单运维平台服务
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-26 15:31:45
 * @LastEditTime: 2022-02-26 15:31:45
 * @Copyright: Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIOP_API = commonConfig.IOP_API || '';

/**
 * 订单查询
 * @async
 * @function updateTax
 * @params {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function updateTax(params) {
  return request(`${HIOP_API}/v1/maintenance-operation/query-order`, {
    method: 'GET',
    query: params,
  });
}
