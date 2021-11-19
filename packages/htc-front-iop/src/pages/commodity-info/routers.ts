/*
 * @Descripttion:商品路由
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 14:59:50
 * @LastEditTime: 2020-11-23 17:53:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/commodity-info',
    component: () => import('./list/CommodityInfoListPage'),
  },
];

export default config;
