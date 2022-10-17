/*
 * @Description:进项发票规则维护
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-01-21 15:23:14
 * @LastEditTime: 2022-10-17 18:18:34
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';

const HIVP_API = commonConfig.IVP_API || '';

/**
 * 勾选信息查询
 */
export async function getBusinessTime(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/invoice-operation/business-time-query`, {
    method: 'GET',
    query: otherParam,
  });
}
/**
 * 认证结果通知书下载
 */
export async function downLoadReport(params) {
  const { tenantId, ...otherParam } = params;
  return request(`${HIVP_API}/v1/${tenantId}/deduction-report/certified_report_download`, {
    method: 'GET',
    query: otherParam,
  });
}
