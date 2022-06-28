/*
 * @Description:我的发票接口
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-16 16:06:14
 * @LastEditTime: 2021-01-28 17:58:55
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';

/**
 * 删除部分信息
 * @async
 * @function deleteInvoiceInfo
 * @returns {object} fetch Promise
 */
export async function deleteInvoiceInfo(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/my-invoice/my-invoice-delete`, {
    method: 'GET',
    query: otherParams,
  });
}
