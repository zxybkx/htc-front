/*
 * @Description:手工发票查验
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-01-25 14:08:25
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const IVP_API = commonConfig.IVP_API || '';

/**
 * 发票查验
 * @async
 * @function handleInvoiceCheckApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function handleInvoiceCheckApi(params) {
  const { tenantId, companyCode, employeeNumber, ...otherParams } = params;
  return request(`${IVP_API}/v1/${tenantId}/invoice-check/invoice-check-within`, {
    method: 'POST',
    query: { companyCode, employeeNumber },
    body: { ...otherParams },
  });
}

/**
 * 添加至发票池
 * @async
 * @function addToInvoicePool
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function addToInvoicePool(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IVP_API}/v1/${tenantId}/invoice-pool-main/add-pool-by-invoice-id`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询发票头信息
 * @async
 * @function getInvoiceInfo
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function getInvoiceInfo(params) {
  const { tenantId, invoiceHeaderId } = params;
  return request(`${IVP_API}/v1/${tenantId}/invoice-header-infos/${invoiceHeaderId}`, {
    method: 'GET',
  });
}
