/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-01-11 10:19:26
 * @Copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIOP_API = commonConfig.IOP_API || '';

/**
 * 开票申请复制
 * @async
 * @function reqCopy
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function reqCopy(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/copy`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 开票申请发票交付下次默认
 * @async
 * @function reqNextDefault
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function reqNextDefault(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/next-default`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 开票申请保存
 * @async
 * @function batchSave
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchSave(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/batch-save`, {
    method: 'POST',
    query: { employeeId: otherParams.employeeId },
    body: [otherParams],
  });
}

/**
 * 开票申请审核提交
 * @async
 * @function reqSubmit
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function reqSubmit(params) {
  const { tenantId, requisitionHeaders, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/submit`, {
    method: 'POST',
    query: otherParams,
    body: requisitionHeaders,
  });
}

/**
 * 获取公司规则下的默认值
 * @async
 * @function getRuleDefaultValue
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function getRuleDefaultValue(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/rules-header-infos/default-value`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 取消申请
 * @async
 * @function reqCancel
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function reqCancel(params) {
  const { tenantId, requisitionHeaderList, employeeId } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/batch-cancel`, {
    method: 'PUT',
    query: { employeeId },
    body: requisitionHeaderList,
  });
}

/**
 * 删除申请
 * @async
 * @function reqDelete
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function reqDelete(params) {
  const { tenantId, requisitionHeaderList } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/batch-remove`, {
    method: 'PUT',
    body: requisitionHeaderList,
  });
}

/**
 * 权限分配保存
 * @async
 * @function permissionSave
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function permissionSave(params) {
  const { tenantId, permissionReq, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/permission-save`, {
    method: 'POST',
    query: otherParams,
    body: permissionReq,
  });
}

/**
 * 导出打印文件
 * @async
 * @function exportPrintFiles
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function exportPrintFiles(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/htc-invoice-files/export`, {
    method: 'GET',
    query: otherParams,
    // responseType: 'blob',
  });
}

/**
 * 发票打印
 * @async
 * @function exportNotZip
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function exportNotZip(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/htc-invoice-files/export-not-zip`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 获取数据
 * @async
 * @function runReport
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function runReport(params) {
  return request(`${HIOP_API}/v1/${params}/run-report/runReport`, {
    method: 'GET',
  });
}

/**
 * 合并
 * @async
 * @function batchMerage
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchMerage(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/merge-requisition`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 取消合并
 * @async
 * @function cancelMerage
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function cancelMerage(params) {
  const { tenantId, headerIds } = params;
  return request(`${HIOP_API}/v1/${tenantId}/requisition-headers/cancel-merge-requisition`, {
    method: 'POST',
    query: { headerIds },
  });
}

/**
 * 判断是否可以红冲
 * @async
 * @function judgeRedFlush
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function judgeRedFlush(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-lines/check-red-flush-lines`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 判断是否可以作废
 * @async
 * @function judgeInvoiceVoid
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function judgeInvoiceVoid(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/invoice-void`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 下载二维码
 * @async
 * @function downloadQrCode
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function downloadQrCode(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/reservation/download/qr-code`, {
    method: 'POST',
    query: otherParams,
  });
}
/**
 * 发送二维码
 * @async
 * @function SendQrCode
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function sendQrCode(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/reservation/send`, {
    method: 'POST',
    query: otherParams,
  });
}
