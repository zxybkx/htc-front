/**
 * service - 待开票数据勾选
 * @Author:xinyan.zhou
 * @Date: 2021-06-21
 * @LastEditeTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';

const HIOP_API = commonConfig.IOP_API;
/**
 * 合并
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
 * 保存
 */
export async function invoiceSave(params) {
  const { tenantId, selectedList } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-infos/batch-save`, {
    method: 'POST',
    body: selectedList,
  });
}

/**
 * 生成申请-生成申请
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
 */
export async function withdraw(params) {
  const { tenantId, list, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/prepare-invoice-operation/revocation-requisition`, {
    method: 'POST',
    query: otherPrams,
    body: list,
  });
}
