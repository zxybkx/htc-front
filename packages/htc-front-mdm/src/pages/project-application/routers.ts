/**
 * @Description: 项目申请管理路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-14 9:45:22
 * @LastEditTime: 2022-06-20 16:51:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/project-application',
    components: [
      {
        path: '/htc-front-mdm/project-application/list',
        component: () => import('./list/ProjectApplicationPage'),
      },
      // 租户明细
      {
        path: '/htc-front-mdm/project-application/tenant-detail/:tenantId/:uniqueCode',
        component: () => import('./detail/TenantApplyDetailPage'),
      },
    ],
  },
  {
    path: '/public/htc-front-mdm/apply/items-tenant',
    component: () => import('../apply-tenant/list/ApplyTenantPage'),
    authorized: true,
  },
];

export default config;
