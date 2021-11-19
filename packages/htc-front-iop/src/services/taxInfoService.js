/*
 * @Description: 税控信息服务
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 15:31:45
 * @LastEditTime: 2021-06-15 17:01:49
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';

const HIOP_API = commonConfig.IOP_API;

/**
 * 更新税控信息
 * @async
 * @function updateTax
 * @returns {object} fetch Promise
 */
export async function updateTax(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/tax-header-infos/update-tax`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 更新库存发票信息
 * @async
 * @function updateInvoice
 * @returns {object} fetch Promise
 */
export async function updateInvoice(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/tax-line-infos/update-invoice`, {
    method: 'GET',
    query: otherParams,
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
  return request(`${HIOP_API}/v1/${tenantId}/htc-invoice-out-orders/device-status-query`, {
    method: 'POST',
    query: otherParams,
    body: deviceOnlineStatus,
  });
}

/**
 * 发票申领
 * @async
 * @function avoidLogin
 * @returns {object} fetch Promise
 */
export async function avoidLogin(params) {
  const { tenantId, companyCode } = params;
  return request(`${HIOP_API}/v1/${tenantId}/agreement-company-infoss/login`, {
    method: 'POST',
    query: { companyCode },
    // body: otherParams,
  });
}

/**
 * 获取航信企业授权码
 * @async
 * @function avoidLogin
 * @returns {object} fetch Promise
 */
export async function getAgreementCompanyInfo(params) {
  const { tenantId, companyCode } = params;
  return request(`${HIOP_API}/v1/${tenantId}/agreement-company-infoss/getAgreementCompanyInfos`, {
    method: 'GET',
    query: { companyCode },
  });
}
