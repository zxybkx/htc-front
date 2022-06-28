/**
 * @Description:账单报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-16 14:01:22
 * @LastEditTime: 2022-06-20 17:48
 * @Copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HMDM_API = commonConfig.MDM_API || '';
// const HMDM_API = `${commonConfig.MDM_API}-30455` || '';

/**
 * 客户申请-下载导入模板
 * @async
 * @function downloadTemplate
 */
export async function downloadTemplate(params) {
  return request(`${HMDM_API}/v1/apply-items/download-template`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 客户申请-下载模板信息
 * @async
 * @function downloadTemplateInfo
 */
export async function downloadTemplateInfo() {
  return request(`${HMDM_API}/v1/apply-items/download-template-info`, {
    method: 'GET',
  });
}

/**
 * 客户申请-查询上传附件
 * @async
 * @function queryUploadInfo
 */
export async function queryUploadInfo(params) {
  return request(`${HMDM_API}/v1/apply-items/query-upload-infos`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 客户申请-删除附件
 * @async
 * @function deleteFilesInfo
 */
export async function deleteFilesInfo(params) {
  return request(`${HMDM_API}/v1/apply-items/delete-files-info`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 客户申请-下载附件
 * @async
 * @function download-files
 */
export async function downloadFiles(params) {
  return request(`${HMDM_API}/v1/apply-items/download-files`, {
    query: params,
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 客户申请-导出
 * @async
 * @function export-items-infos
 */
export async function exportInfos(params) {
  return request(`${HMDM_API}/v1/apply-items/export-items-infos`, {
    query: params,
    method: 'GET',
    responseType: 'text',
  });
}

/**
 * 客户申请-提交
 * @async
 * @function save-info
 */
export async function saveInfo(params) {
  return request(`${HMDM_API}/v1/apply-items/save-info`, {
    body: params,
    method: 'POST',
  });
}

/**
 * 客户申请-审核提交
 * @async
 * @function audit-item-apply
 */
export async function auditItemApply(params) {
  return request(`${HMDM_API}/v1/audit-items/audit-item-apply`, {
    body: params,
    method: 'POST',
  });
}

/**
 * 客户申请-审核通知
 * @async
 * @function audit-notice
 */
export async function auditNotice(params) {
  return request(`${HMDM_API}/v1/audit-items/audit-notice`, {
    body: params,
    method: 'POST',
  });
}
