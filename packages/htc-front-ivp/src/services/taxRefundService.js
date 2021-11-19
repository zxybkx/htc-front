/*
 * @Description:退税勾选
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-05-21 15:23:14
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';
import moment from 'moment';

const HIVP_API = commonConfig.IVP_API;
// const HIVP_API = `${commonConfig.IVP_API}-31183`;

/**
 * 提交退税发票勾选(取消)请求
 */

export async function submitRefundCheckRequest(params) {
  const { tenantId, empInfo, taxDiskPassword, selectedList, checkFlag, authorityCode } = params;
  const contentRows = selectedList.length;
  return request(
    `${HIVP_API}/v1/${tenantId}/refund-invoice-operation/submit-refund-check-request`,
    {
      method: 'POST',
      query: {
        companyId: empInfo.companyId,
        companyCode: empInfo.companyCode,
        employeeId: empInfo.employeeId,
        employeeNumber: empInfo.employeeNum,
        taxpayerNumber: empInfo.taxpayerNumber,
        currentPeriod: moment().format('YYYYMM'),
      },
      body: {
        authorityCode,
        contentRows,
        checkFlag,
        invoiceInfos: selectedList,
        taxDiskPassword,
      },
    }
  );
}

/**
 * 退税勾选-刷新
 */
export async function refresh(params) {
  const { tenantId, empInfo, batchNoList } = params;
  return request(`${HIVP_API}/v1/${tenantId}/refund-invoice-operation/refresh-status`, {
    method: 'GET',
    query: {
      companyId: empInfo.companyId,
      companyCode: empInfo.companyCode,
      employeeId: empInfo.employeeId,
      employeeNumber: empInfo.employeeNum,
      batchNoList,
    },
  });
}

/**
 * 退税发票信息实时查询
 */
export async function refundInvoiceQuery(params) {
  const { tenantId, taxDiskPassword, queryData, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/refund-invoice-operation/refund-invoice-query`, {
    method: 'POST',
    query: otherParams,
    body: {
      taxDiskPassword,
      ...queryData,
    },
  });
}

/**
 * 实时查询进度条
 */
export async function getProgress(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/refund-invoice-operation/get-progress-bar-value`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 下载发票文件
 */
export async function downloadFile(params) {
  const { tenantId, needDownloadKey, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/refund-invoice-operation/download-refund-file`, {
    method: 'POST',
    query: otherParams,
    body: needDownloadKey,
    responseType: 'blob',
  });
}

/**
 * 批量操作勾选（取消）发票
 */
export async function batchOperationRefundInvoice(params) {
  const {
    tenantId,
    companyId,
    companyCode,
    employeeId,
    employeeNumber,
    currentPeriod,
    taxpayerNumber,
    taxDiskPassword,
    batchNo,
    ...otherParams
  } = params;
  return request(
    `${HIVP_API}/v1/${tenantId}/refund-invoice-operation/batch-operation-refund-invoice`,
    {
      method: 'POST',
      query: {
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        currentPeriod,
        taxpayerNumber,
        taxDiskPassword,
        batchNo,
      },
      body: {
        ...otherParams,
        taxDiskPassword,
      },
    }
  );
}

/**
 * 退税确认勾选-确认
 */
export async function confirmInvoice(params) {
  const { tenantId, authorityCode, taxDiskPassword, confirmMonth, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/refund-invoice-operation/confirm-invoice`, {
    method: 'POST',
    query: otherParams,
    body: {
      authorityCode,
      taxDiskPassword,
      confirmMonth,
    },
  });
}
