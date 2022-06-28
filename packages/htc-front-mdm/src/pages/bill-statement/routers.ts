/**
 * @Description: 账单报表路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-07 13:44:22
 * @LastEditTime: 2022-06-20 15:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/bill-statement',
    components: [
      {
        path: '/htc-front-mdm/bill-statement/list',
        component: () => import('./list/BillStatementPage'),
      },
      {
        path: '/htc-front-mdm/bill-statement/bill-view-page',
        component: () => import('./detail/BillViewPage'),
      },
    ],
  },
];

export default config;
