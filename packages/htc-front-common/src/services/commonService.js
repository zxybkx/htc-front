/**
 * @Description:通用接口
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-01-07 13:54:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '../config/commonConfig';

const { MDM_API, CHAN_API, HSSP_API } = commonConfig;

/**
 * 根据当前登录用户查询员工信息
 * @async
 * @function getCurrentEmployeeInfo
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function getCurrentEmployeeInfo(params) {
  const { tenantId, ...otherParams } = params;
  const apiCondition = process.env.EMPLOYEE_API;
  const url =
    apiCondition === 'OP'
      ? `${HSSP_API}/v2/${tenantId}/invoice/htc/company-employee`
      : `${MDM_API}/v1/${tenantId}/employee-infos/query-current-employee-info`;
  return request(url, {
    method: 'GET',
    query: {
      ...otherParams,
      defaultValueFlag: true,
    },
  });
}

/**
 * 根据当前登录用户查询员工信息-销项
 * @async
 * @function getCurrentEmployeeInfoOut
 * @param {object} param - 查询条件
 * @returns {object} fetch Promise
 */
export async function getCurrentEmployeeInfoOut(params) {
  const { tenantId, ...otherParams } = params;
  const apiCondition = process.env.EMPLOYEE_API;
  const url =
    apiCondition === 'OP'
      ? `${HSSP_API}/v2/${tenantId}/invoice/htc/company-employee`
      : `${MDM_API}/v1/${tenantId}/employee-infos/query-current-employee-company-info`;
  return request(url, {
    method: 'GET',
    query: {
      ...otherParams,
      defaultValueFlag: true,
    },
  });
}

/**
 * 获取租户协议公司信息
 * @async
 * @function getTenantAgreementCompany
 * @returns {object} fetch Promise
 */
export async function getTenantAgreementCompany(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${MDM_API}/v1/${tenantId}/agreement-company-infoss/detail-code-organization`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * ofd电子发票识别解析
 * @async
 * @function ofdInvoiceResolver
 * @returns {object} fetch Promise
 */
export async function ofdInvoiceResolver(params) {
  return request(`${CHAN_API}/v1/ofd-invoice-resolver-site/signature-info-front-end-call`, {
    method: 'GET',
    query: params,
  });
}
