/*
 * @Description:进项发票规则维护

 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-01-21 15:23:14
 * @LastEditTime: 2022-09-23 16:56:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';

/**
 * 批量识别-批次号查询
 */
export async function getBusinessTime(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation-new/business-time-query`, {
    method: 'GET',
    query: otherParam,
  });
}
