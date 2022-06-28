/**
 * @Description: 项目费用分摊路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-03-28 9:45:22
 * @LastEditTime: 2022-06-20 17:11:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/project-cost-sharing',
    components: [
      {
        path: '/htc-front-mdm/project-cost-sharing/list',
        component: () => import('./list/ProjectCostSharingPage'),
      },
      //   {
      //     path: '/htc-front-mdm/project-cost-sharing/detail/:tenantId/:agreementId',
      //     component: () => import('./detail/TenantAgreementDetailPage'),
      //   },
    ],
  },
];

export default config;
