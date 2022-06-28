/**
 * @Description: 租户信息路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:17:23
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/public/htc-front-mdm/apply/invalid-result',
    component: () => import('./list/ResultPage'),
    authorized: true,
  },
  {
    path: '/public/htc-front-mdm/apply/success-result',
    component: () => import('./list/SuccessPage'),
    authorized: true,
  },
];

export default config;
