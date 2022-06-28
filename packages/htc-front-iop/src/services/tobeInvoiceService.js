/**
 * service - 待开票数据勾选
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 15:46:22
 * @LastEditTime: 2021-11-22 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIOP_API = commonConfig.IOP_API || '';

/**
 * 合并
 * @async
 * @function invoiceMerge
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function invoiceMerge(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/merge`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * 取消合并
 * @async
 * @function cancelMerge
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function cancelMerge(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/cancel-merge`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * 拆分
 * @async
 * @function invoiceSplit
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function invoiceSplit(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/split`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * 发票保存
 * @async
 * @function invoiceSave
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function invoiceSave(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-infos/batch-save`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * 生成申请-生成申请
 * @async
 * @function createRequisition
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function createRequisition(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/create-requisition`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * 生成申请-合并生成
 * @async
 * @function mergeCreate
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function mergeCreate(params) {
  const { tenantId, selectedList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/merge-create-requisition`, {
    method: 'POST',
    query: otherPrams,
    body: selectedList,
  });
}

/**
 * -客户信息-同步保存
 * @async
 * @function synchronizeSaveCustomer
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function synchronizeSaveCustomer(params) {
  const { tenantId, recordData, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/synchronize-save-customer`, {
    method: 'POST',
    query: otherPrams,
    body: recordData,
  });
}

/**
 * -商品信息-同步保存
 * @async
 * @function synchronizeSaveGood
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function synchronizeSaveGood(params) {
  const { tenantId, recordData, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/synchronize-save-good`, {
    method: 'POST',
    query: otherPrams,
    body: recordData,
  });
}

/**
 * -撤回
 * @async
 * @function withdraw
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function withdraw(params) {
  const { tenantId, list, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/revocation-requisition`, {
    method: 'POST',
    query: otherPrams,
    body: list,
  });
}
