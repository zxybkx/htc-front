/*
 * @Description:批量识别
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-01-21 15:23:14
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';

/**
 * 批量识别-批次号查询
 */
export async function getBatchNum(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoices/get-batch-number`, {
    method: 'GET',
    query: otherParam,
  });
}

/**
 * 添加至发票/票据池
 */
export async function addInvoicePool(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoices/add-invoice-pool`, {
    method: 'POST',
    query: otherParam,
  });
}

/**
 * 添加至我的发票
 */
export async function addMyInvoice(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoices/add-my-invoice`, {
    method: 'POST',
    query: otherParam,
  });
}

/**
 * 发票查验
 */
export async function invoiceRecheck(params) {
  const { tenantId, companyCode, employeeNum, ...otherParams } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoices/recheck`, {
    method: 'POST',
    query: { companyCode, employeeNum },
    body: { ...otherParams },
  });
}
