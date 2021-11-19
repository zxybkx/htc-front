/*
 * @routes -发票申请统计历史记录 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-18 16:31:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-18 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/apply-statistics-history/list',
    component: () => import('./list/ApplyStatisticsHistoryListPage'),
  },
];

export default config;
