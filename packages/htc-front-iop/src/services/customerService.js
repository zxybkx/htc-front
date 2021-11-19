/*
 * @Description: 客户信息维护
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-05-19 13:50:20
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@common/config/commonConfig';

const HIOP_API = commonConfig.IOP_API;

/**
 * 客户保存
 * @async
 * @function batchSave
 * @returns {object} fetch Promise
 */
export async function batchSave(params) {
  const { tenantId, checkDataSameFlag, data } = params;
  return request(`${HIOP_API}/v1/${tenantId}/customer-informations/batch-save`, {
    method: 'POST',
    query: { checkDataSameFlag },
    body: [data],
  });
}

/**
 * 商品分配
 * @async
 * @function assignCommodity
 * @returns {object} fetch Promise
 */
export async function assignCommodity(params) {
  const { tenantId, goodsMappingList, customerInformationList } = params;
  return request(`${HIOP_API}/v1/${tenantId}/goods-mapping-main/goods-distribution`, {
    method: 'POST',
    body: { goodsMappingList, customerInformationList },
  });
}
