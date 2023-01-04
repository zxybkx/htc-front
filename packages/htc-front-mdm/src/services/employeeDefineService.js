/**
 * @Description: 员工维护
 * @Author: Mawenqi <wenqi.ma@hand-china.com>
 * @Date: 2020-06-29
 * @LastEditeTime: 2020-06-29
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HMDM_API = commonConfig.MDM_API || '';

/**
 * 员工信息维护批量创建或更新
 * @async
 * @function saveAndCreateAccount
 * @returns {object} fetch Promise
 */
export async function saveAndCreateAccount(params) {
  const { organizationId, employeeInfosList } = params;
  return request(`${HMDM_API}/v1/${organizationId}/employee-infos/batch-save-create`, {
    method: 'POST',
    query: { createAccountFlag: 1 },
    body: employeeInfosList,
  });
}

/**
 * 修改员工手机号创建子账户
 * @async
 * @function saveMobileAndCreateAccount
 * @returns {object} fetch Promise
 */
export async function saveMobileAndCreateAccount(params) {
  const { organizationId } = params;
  return request(`${HMDM_API}/v1/${organizationId}/employee-infos/update-mobile-and-save`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 员工信息禁用
 * @async
 * @function batchForbiddenEmployee
 * @returns {object} fetch Promise
 */
export async function batchForbiddenEmployee(params) {
  const { organizationId, employeeInfosList } = params;
  return request(`${HMDM_API}/v1/${organizationId}/employee-infos/batch-forbidden-employee`, {
    method: 'POST',
    body: employeeInfosList,
  });
}

/**
 * 登录电局
 * @async
 * @function loginVerification
 * @returns {object} fetch Promise
 */
export async function loginVerification(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HMDM_API}/v1/${tenantId}/employee-infos/login-verification`, {
    method: 'POST',
    body: { ...otherParams },
  });
}

/**
 * 登记信息
 * @async
 * @function userRegistration
 * @returns {object} fetch Promise
 */
export async function userRegistration(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HMDM_API}/v1/${tenantId}/employee-infos/user-registration`, {
    method: 'POST',
    body: { ...otherParams },
  });
}
