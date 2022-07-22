/*
 * @Description:发票池接口
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-16 16:06:14
 * @LastEditTime: 2021-01-27 11:40:48
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';

/**
 * 发票池-发票代码存在
 * @async
 * @function invoiceCheckComplete
 * @returns {object} fetch Promise
 */
export async function invoiceCheckExist(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/invoice-check-exist`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 发票池-发票查验补全
 * @async
 * @function invoiceCheckComplete
 * @returns {object} fetch Promise
 */
export async function invoiceCheckComplete(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/invoice-check`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 发票池-检查状态
 * @async
 * @function invoiceCheckState
 * @returns {object} fetch Promise
 */
export async function invoiceCheckState(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/invoice-check-status`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 发票池-状态更新
 * @async
 * @function invoiceUpdateState
 * @returns {object} fetch Promise
 */
export async function invoiceUpdateState(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/single-invoice-status-update`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 批量查验补全
 * @async
 * @function invoiceCheck
 * @returns {object} fetch Promise
 */
export async function invoiceCheck(params) {
  const { tenantId, list, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/invoice-check`, {
    method: 'POST',
    query: otherParams,
    body: list,
  });
}

/**
 * 新增查验补全
 * @async
 * @function invoiceCheck
 * @returns {object} fetch Promise
 */
export async function poolAdd(params) {
  const { tenantId, list, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-pool-main/pool-add`, {
    method: 'POST',
    query: otherParams,
    body: list,
  });
}

/**
 * 获取底账-底账获取按钮
 * @async
 * @function getOriginalAccount
 * @returns {object} fetch Promise
 */
export async function getOriginalAccount(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/original-account-get/original-account-button`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 获取底账-调度任务上次执行时间
 * @async
 * @function getOriginalAccountAutoDate
 * @returns {object} fetch Promise
 */
export async function getOriginalAccountAutoDate(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/original-account-get/original-account-auto-date`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 版式推送-推送客户
 * @async
 * @function pushToCustomer
 * @returns {object} fetch Promise
 */
export async function pushToCustomer(params) {
  const { tenantId, invoicePoolHeaderIds, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/layout-push/push-customers`, {
    method: 'POST',
    query: otherParams,
    body: invoicePoolHeaderIds,
  });
}

/**
 * 版式推送-推送收票员工
 * @async
 * @function pushToCollector
 * @returns {object} fetch Promise
 */
export async function pushToCollector(params) {
  const { tenantId, invoicePoolHeaderIds, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/layout-push/push-employees`, {
    method: 'POST',
    query: otherParams,
    body: invoicePoolHeaderIds,
  });
}

/**
 * 档案归档-更新入账状态/期间
 * @async
 * @function updateEntryAccount
 * @returns {object} fetch Promise
 */
export async function updateEntryAccount(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-management/update-entry-account`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 档案归档-批量归档档案
 * @async
 * @function batchArchiveFiles
 * @returns {object} fetch Promise
 */
export async function batchArchiveFiles(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-management/batch-archives-files`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 单据关联-关联操作
 * @async
 * @function documentRelationOperation
 * @returns {object} fetch Promise
 */
export async function documentRelationOperation(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/document-relation/relation-operation`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 单据关联-添加关联
 * @async
 * @function selectDocumentType
 * @returns {object} fetch Promise
 */
export async function selectDocumentType(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/document-relation/select-document-type`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 档案上传-批量-进度查询
 * @async
 * @function batchUploadProcessQuery
 * @returns {object} fetch Promise
 */
export async function batchUploadProcessQuery(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-update/batch-upload-process-query`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 档案上传-批量-确认档案
 * @async
 * @function confirmFile
 * @returns {object} fetch Promise
 */
export async function confirmFile(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-update/confirm-file`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 档案查看-ofd电子发票识别解析
 * @async
 * @function ofdInvoiceResolver
 * @returns {object} fetch Promise
 */
export async function ofdInvoiceResolver(params) {
  return request(
    `${HIVP_API}/v1/ofd-invoice-resolver-site/signature-info-front-end-call`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 档案查看-ofd电子发票URL转JPG
 * @async
 * @function ofdInvoiceResolver
 * @returns {object} fetch Promise
 */
export async function urlTojpg(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/ofd-invoice-resolver/url-to-jpg`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 发票档案下载
 * @async
 * @function archivesDownload
 * @returns {object} fetch Promise
 */
export async function archivesDownload(params) {
  const { tenantId, urlList, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-management/archives-download`, {
    method: 'POST',
    query: otherParams,
    body: urlList,
  });
}

/**
 * 查看档案
 * @async
 * @function confirmFile
 * @returns {object} fetch Promise
 */
export async function batchUploadAndCheck(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/archives-update/batch-upload-and-check`, {
    method: 'GET',
    query: otherParams,
  });
}
