/*
 * @routes -业务时间、单票、企业档案信息查询历史记录 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-17 13:56:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-17 13:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/basic-info-query-history/list',
    component: () => import('./list/BasicInfoQueryHistoryListPage'),
  },
];

export default config;
