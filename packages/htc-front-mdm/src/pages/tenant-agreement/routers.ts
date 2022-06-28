/**
 * @Description: 租户协议维护
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-09
 * @LastEditeTime: 2020-07-09
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/tenant-agreement',
    components: [
      {
        path: '/htc-front-mdm/tenant-agreement/list',
        component: () => import('./list/TenantAgreementPage'),
      },
      {
        path: '/htc-front-mdm/tenant-agreement/detail/:tenantId/:agreementId',
        component: () => import('./detail/TenantAgreementDetailPage'),
      },
    ],
  },
];

export default config;
