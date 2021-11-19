/*
 * @Description:红字发票
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2020-12-23 11:11:51
 * @Copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';

const HIOP_API = `${commonConfig.IOP_API}`;
// const HRPT_API = `${commonConfig.RPT_API}`;

/**
 * 新建红字发票申请单（头）
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function createRedInvoiceReq(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/createHeader`, {
    method: 'POST',
    query: otherParams,
    // body: { ...otherParams, companyCode },
  });
}

/**
 * 新建红字发票申请单（行）
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function createRedInvoiceReqLines(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/red-invoice-requisitions/createLineList`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 生成红字发票申请单
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function createRedInvoice(params) {
  const {
    companyCode,
    employeeNumber,
    invoiceCode,
    invoiceNo,
    organizationId,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/createRedInvoice`, {
    method: 'POST',
    query: { companyCode, employeeNumber, invoiceCode, invoiceNo },
    body: { ...otherParams, companyCode },
  });
}

/**
 * 保存红字发票申请单
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function saveRedInvoice(params) {
  const { companyCode, employeeNumber, organizationId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/saveRedInvoice`, {
    method: 'POST',
    query: { companyCode, employeeNumber },
    body: { ...otherParams, companyCode },
  });
}

/**
 * 删除红字发票申请单行
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function deleteRedInvoiceLines(params) {
  const { companyCode, employeeNumber, organizationId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/saveRedInvoice`, {
    method: 'POST',
    query: { companyCode, employeeNumber },
    body: { ...otherParams },
  });
}

/**
 * 红字申请单刷新状态
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceReqUpdateStatus(params) {
  const {
    companyCode,
    employeeNumber,
    organizationId,
    requisitionHeaderIds,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/refresh`, {
    method: 'POST',
    query: { companyCode, employeeNumber, requisitionHeaderIds },
    body: { ...otherParams },
  });
}

/**
 * 红字申请单上传局端
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceReqUpload(params) {
  const {
    companyCode,
    employeeNumber,
    organizationId,
    requisitionHeaderIds,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/upload`, {
    method: 'POST',
    query: { companyCode, employeeNumber, requisitionHeaderIds },
    body: { ...otherParams },
  });
}

/**
 * 红字发票信息表删除/取消
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceInfoDeleteOrCancel(params) {
  const {
    companyCode,
    employeeNumber,
    organizationId,
    requisitionHeaderIds,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/cancel`, {
    method: 'POST',
    query: { companyCode, employeeNumber, requisitionHeaderIds },
    body: { ...otherParams },
  });
}

/**
 * 红字发票信息表同步
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceInfoSynchronize(params) {
  const { companyCode, employeeNumber, organizationId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-infos/synchronize`, {
    method: 'GET',
    query: { companyCode, employeeNumber, ...otherParams },
  });
}

/**
 * 生成红冲订单
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceCreateRedOrder(params) {
  const {
    companyCode,
    employeeNumber,
    organizationId,
    redInvoiceInfoHeaderIds,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-infos/create-order`, {
    method: 'GET',
    query: { companyCode, employeeNumber, redInvoiceInfoHeaderIds, ...otherParams },
  });
}

/**
 * 生成红冲申请单
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceCreateRequisition(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-infos/create-requisition`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 红字发票申请单明细（头）
 * @async
 * @function reqCopy
 * @returns {object} fetch Promise
 */
export async function redInvoiceReqHeader(params) {
  const { organizationId, redInvoiceRequisitionHeaderId } = params;
  return request(
    `${HIOP_API}/v1/${organizationId}/red-invoice-requisitions/${redInvoiceRequisitionHeaderId}`,
    {
      method: 'GET',
      query: {},
    }
  );
}

/**
 * 打印下载PDF文件
 */
export async function downloadPrintPdfFiles(params) {
  const { organizationId, companyCode, employeeNumber, ids } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-infos/download`, {
    method: 'GET',
    query: { companyCode, employeeNumber, ids },
    responseType: 'blob',
  });
}

/**
 * 同步请求列表-同步
 */
export async function synchronize(params) {
  const { organizationId, companyCode, employeeNumber, redInvoiceSynchronizeDto } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisition-operation/synchronize`, {
    method: 'POST',
    query: { companyCode, employeeNumber },
    body: redInvoiceSynchronizeDto,
  });
}

/**
 * 同步请求列表-刷新状态
 */
export async function refresh(params) {
  const { organizationId, companyCode, employeeNumber, data } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisition-operation/refresh`, {
    method: 'POST',
    query: { companyCode, employeeNumber },
    body: data,
  });
}

/**
 * 同步请求列表-一键刷新
 */
export async function allRefresh(params) {
  const { organizationId, companyCode, employeeNumber } = params;
  return request(`${HIOP_API}/v1/${organizationId}/red-invoice-requisition-operation/allRefresh`, {
    method: 'GET',
    query: { companyCode, employeeNumber },
  });
}

/**
 * 获取机器编码
 */
export async function taxInfos(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/tax-header-infos`, {
    method: 'GET',
    query: otherParams,
  });
}
