/*
 * @Description:客户信息维护路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-8 10:06:23
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/customer-info',
    components: [
      // 客户信息维护
      {
        path: '/htc-front-iop/customer-info/list',
        component: () => import('./list/CustomerInfoPage'),
      },
      // 分配商品映射
      {
        path: '/htc-front-iop/customer-info/assign-commodity',
        component: () => import('./list/AssignCommodityListPage'),
      },
    ],
  },
];
export default config;
