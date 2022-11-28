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
 * @returns {object} fetch Promise
 * @param params
 */
export async function invoicePreviewApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/invoice-preview`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}
/**
 * 打印文件
 * @async
 * @function invoicePrintApi
 * @returns {object} fetch Promise
 * @param params
 */
export async function invoicePrintApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/invoice-print`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}

/**
 * 电票上传
 * @async
 * @function electronicUploadApi
 * @returns {object} fetch Promise
 * @param params
 */
export async function electronicUploadApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/electronic-upload`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}

/**
 * 更新发票池
 * @async
 * @function updateInvoicePoolApi
 * @returns {object} fetch Promise
 * @param params
 */
export async function updateInvoicePoolApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/update-invoicePool`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}

/**
 * 推送发票池
 * @async
 * @function pushInvoicePoolApi
 * @returns {object} fetch Promise
 * @param params
 */
export async function pushInvoicePoolApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/push-invoicePool`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}

/**
 * 短信/邮件通知
 * @async
 * @function notifyMessageApi
 * @returns {object} fetch Promise
 * @param params
 */
export async function notifyMessageApi(params) {
  const { tenantId, invoiceHeadIds } = params;
  return request(`${IOP_API}/v1/${tenantId}/operation/notify-Message`, {
    method: 'POST',
    body: invoiceHeadIds,
  });
}
