/*
 * @Description:发票抬头白名单路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-19 16:50:15
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/invoice-whitelist',
    components: [
      {
        path: '/htc-front-ivp/invoice-whitelist/list',
        component: () => import('./list/InvoiceWhitelistPage'),
      },
    ],
  },
];

export default config;
