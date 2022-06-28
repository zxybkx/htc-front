/**
 * @Description:开票附加信息状态查询-操作按钮
 * @version: 1.0
 * @Author: yu.huishan@hand-china.com
 * @Date: 2021-10-12 16:19:48
 * @LastEditTime: 2021-10-12 16:19:48
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const IOP_API = commonConfig.IOP_API || '';

/**
 * 票面预览
 * @async
 * @function invoicePreviewApi
 * @param {object} param - 票面预览
 * @returns {object} fetch Promise
 */
export async function invoicePreviewApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/invoice-preview`, {
    method: 'POST',
    query: otherParams,
  });
}
/**
 * 打印文件
 * @async
 * @function invoicePrintApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function invoicePrintApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/invoice-print`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 电票上传
 * @async
 * @function electronicUploadApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function electronicUploadApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/electronic-upload`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 更新发票池
 * @async
 * @function updateInvoicePoolApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function updateInvoicePoolApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/update-invoicePool`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 推送发票池
 * @async
 * @function pushInvoicePoolApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function pushInvoicePoolApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/push-invoicePool`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 短信/邮件通知
 * @async
 * @function notifyMessageApi
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function notifyMessageApi(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/notify-Message`, {
    method: 'POST',
    query: otherParams,
  });
}
/**
 * 取消订单
 * @async
 * @function cancelOrder
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function cancelOrderApi(params) {
  const { tenantId, body, ...otherParams } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/operation-batch-cancel-order`, {
    method: 'POST',
    query: otherParams,
    body,
  });
}
