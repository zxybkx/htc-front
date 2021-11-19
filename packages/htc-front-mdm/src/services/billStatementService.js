/**
 * @Description:账单报表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-14 16:05:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';

const HMDM_API = commonConfig.MDM_API;

/**
 * 生成账单
 * @async
 * @function billInfomationDownload
 * @returns {object} fetch Promise
 */
export async function billInfomationDownload(params) {
  return request(`${HMDM_API}/v1/billing-informations/download`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发送邮件
 * @async
 * @function billInfomationDownload
 * @returns {object} fetch Promise
 */
export async function sendEmail(params) {
  return request(`${HMDM_API}/v1/billing-informations/send-email`, {
    method: 'POST',
    body: params,
  });
}
