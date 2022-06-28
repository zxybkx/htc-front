/**
 * @Description:自动催收管理
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-11 10:56
 * @LastEditTime: 2022-06-20 17:48
 * @Copyright: Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HMDM_API = commonConfig.MDM_API || '';

/**
 * 生成催收提醒
 * @async
 * @function create-new-auto
 * @returns {object} fetch Promise
 */
export async function createNewAuto(params) {
  return request(`${HMDM_API}/v1/auto-con-infos/create-new-auto`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发送催收提醒
 * @async
 * @function send-collection
 * @returns {object} fetch Promise
 */
export async function sendCollection(params) {
  return request(`${HMDM_API}/v1/auto-con-infos/send-collection`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存
 * @async
 * @function batch-save
 * @returns {object} fetch Promise
 */
export async function batchSave(params) {
  return request(`${HMDM_API}/v1/auto-con-infos/batch-save`, {
    method: 'POST',
    body: params,
  });
}
