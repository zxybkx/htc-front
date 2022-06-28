/**
 * @Description: 账单推送历史记录路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-13 17:22:22
 * @LastEditTime: 2022-06-21 13:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/bill-push-history',
    components: [
      {
        path: '/htc-front-chan/bill-push-history/list',
        component: () => import('./list/BillPushHistoryPage'),
      },
      {
        path: '/htc-front-chan/bill-push-history/bill-view-page',
        component: () => import('./detail/BillViewPage'),
      },
    ],
  },
];

export default config;
