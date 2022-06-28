/**
 * @Description: 数据权限分配路由
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-11-23 14:35:44
 * @LastEditTime: 2020-12-28 15:22:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/permission-assign/:sourceType/:companyId/:headerIds',
    component: () => import('./list/PermissionAssignPage'),
    authorized: true,
    title: '数据权限分配',
  },
];

export default config;
