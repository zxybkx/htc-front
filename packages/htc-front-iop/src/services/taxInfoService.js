/**
 * @Description: 税控信息服务
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 15:31:45
 * @LastEditTime: 2021-06-15 17:01:49
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIOP_API = commonConfig.IOP_API || '';

/**
 * 更新税控信息
 * @async
 * @function updateTax
 * @params {object} params
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
 * @params {object} params
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
 * 批量更新库存发票
 * @async
 * @function batch-update-invoice
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchUpdateInvoice(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/tax-line-infos/batch-update-invoice`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 设备在线查询
 * @async
 * @function deviceStatusQuery
 * @params {object} params
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
 * @params {object} params
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
 * @function getAgreementCompanyInfo
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function getAgreementCompanyInfo(params) {
  const { tenantId, companyCode } = params;
  return request(`${HIOP_API}/v1/${tenantId}/agreement-company-infoss/getAgreementCompanyInfos`, {
    method: 'GET',
    query: { companyCode },
  });
}

/**
 * 获取人脸识别二维码
 * @async
 * @function avoidLogin
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function faceRecognitionQRcode(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/tax-header-infos/get-face-recognition-qr-code`, {
    method: 'POST',
    query: otherParams,
  });
}
