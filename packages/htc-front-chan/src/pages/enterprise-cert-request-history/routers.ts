/*
 * @routes -企业认证请求历史记录查询 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-16 13:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-16 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/enterprise-cert-request-history/list',
    component: () => import('./list/EnterpriseCertRequestHistoryListPage'),
  },
];

export default config;
