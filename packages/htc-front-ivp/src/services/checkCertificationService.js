/**
 * service - 勾选认证
 * @Author:shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-25
 * @LastEditeTime: 2020-09-25
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';
const MDM_API = commonConfig.MDM_API || '';
const HSSP_API = commonConfig.HSSP_API || '';

/**
 * 更新企业档案
 * @async
 * @function updateEnterpriseFile
 * @returns {object} fetch Promise
 */
export async function updateEnterpriseFile(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/enterprise-file-infos/update`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 业务时间查询
 * @async
 * @function businessTimeQuery
 * @returns {object} fetch Promise
 */
export async function businessTimeQuery(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/business-time-query`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 实时查找可认证发票
 * @async
 * @function findVerifiableInvoice
 * @returns {object} fetch Promise
 */
export async function findVerifiableInvoice(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/find-certifiable-invoice`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 发票勾选请求
 * @async
 * @function handlecheckRequest
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function handlecheckRequest(params) {
  const { tenantId, invoiceRequestParamDto, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/check-request`, {
    method: 'POST',
    query: otherParams,
    body: invoiceRequestParamDto,
  });
}

/**
 * 刷新
 * @async
 * @function refreshState
 * @returns {object} fetch Promise
 */
export async function refreshState(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/refresh`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 一键刷新
 * @async
 * @function refreshAllState
 * @returns {object} fetch Promise
 */
export async function refreshAllState(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/refresh-all`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 确认签名
 * @async
 * @function confirmSignature
 * @returns {object} fetch Promise
 */
export async function confirmSignature(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/confirm-signature`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 统计、确签校验
 * @async
 * @function judgeButton
 * @returns {object} fetch Promise
 */
export async function judgeButton(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/judge-button`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 申请取消统计
 * @async
 * @function applyStatistics
 * @returns {object} fetch Promise
 */
export async function applyStatistics(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/apply-statistics-request`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 获取主管机关代码
 * @async
 * @function getTaxAuthorityCode
 * @returns {object} fetch Promise
 */
export async function getTaxAuthorityCode(params) {
  const apiCondition = process.env.EMPLOYEE_API;
  const { tenantId, companyId } = params;
  const url =
    apiCondition === 'OP'
      ? `${HSSP_API}/v1/${tenantId}/company-list-infos/${companyId}`
      : `${MDM_API}/v1/${tenantId}/company-list-infos/${companyId}`;
  return request(url, {
    method: 'GET',
  });
}

/**
 * 实时查找已认证发票
 * @async
 * @function findCertifiedInvoice
 * @returns {object} fetch Promise
 */
export async function findCertifiedInvoice(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/find-certified-invoice`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 当期勾选(取消)可认证发票: 刷新状态
 * @async
 * @function findCertifiedInvoice
 * @returns {object} fetch Promise
 */
export async function certifiableInvoiceRefresh(params) {
  const { tenantId, data, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/refresh-state`, {
    method: 'POST',
    query: otherParams,
    body: data,
  });
}

/**
 * 下载发票文件
 */
export async function downloadFile(params) {
  const { tenantId, needDownloadKey, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/download-certified-file`, {
    method: 'POST',
    query: otherParams,
    body: { needDownloadKey },
    responseType: 'blob',
  });
}

/**
 * 刷新状态
 */
export async function refreshStatus(params) {
  const { tenantId, selectedList, empInfo } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/refresh-status`, {
    method: 'POST',
    query: {
      companyId: empInfo.companyId,
      companyCode: empInfo.companyCode,
      employeeId: empInfo.employeeId,
      employeeNumber: empInfo.employeeNum,
    },
    body: selectedList,
  });
}

/**
 * 查询是否有勾选请求中的发票
 */
export async function checkInvoiceCount(params) {
  const { tenantId } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/select-check-invoice-count`, {
    method: 'GET',
  });
}

/**
 * 获取当前可勾选发票
 */
export async function unCertifiedInvoiceQuery(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/unCertified-invoice-query`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 全部勾选/全部撤销
 */
export async function batchCheck(params) {
  const { tenantId, invoiceCheckCollects, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/partial-Check`, {
    method: 'POST',
    query: otherParams,
    body: invoiceCheckCollects,
  });
}

/**
 * 全部勾选/全部撤销
 */
export async function getTaskPassword(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/enterprise-file-infos`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询所属期
 */
export async function getCurPeriod(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/business-time-companyId-cur`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 勾选认证-下载申报抵扣统计表
 */
export async function deductionReportDownload(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/deduction-apply-report/download`, {
    method: 'GET',
    query: otherParams,
    responseType: 'text',
  });
}

/**
 * 勾选认证-下载认证结果统计表
 */
export async function statisticReportDownload(params) {
  const { tenantId, ...otherParams } = params;
  return request(
    `${HIVP_API}/v1/${tenantId}/invoice-operation/certified-result-statistic-report/download`,
    {
      method: 'GET',
      query: otherParams,
      responseType: 'text',
    }
  );
}

/**
 * 保存公司信息
 */
export async function enterpriseSave(params) {
  const { tenantId, list } = params;
  return request(`${HIVP_API}/v1/${tenantId}/enterprise-file-infos/batch-save`, {
    method: 'POST',
    body: list,
  });
}
/**
 * @description: 生成批次号
 * @function: creatBatchNumber
 */
export async function creatBatchNumber(params) {
  const { tenantId } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/create-batch-no`, {
    method: 'GET',
  });
}
/**
 * @description: 扫码枪批量识别发票保存
 * @function: batchScanGunInvoices
 * @param {*} params
 */
export async function batchScanGunInvoices(params) {
  const { tenantId, list, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/batch-check/short_program_partial-Check`, {
    method: 'POST',
    query: otherParams,
    body: list,
  });
}

/**
 * 不抵扣勾选-勾选请求
 * @async
 * @function partialCheck
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function partialCheck(params) {
  const { tenantId, selectedList, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/non-deduction-check/partial-Check`, {
    method: 'POST',
    query: otherParams,
    body: selectedList,
  });
}
