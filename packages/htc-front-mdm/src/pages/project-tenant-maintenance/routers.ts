import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/project-tenant-maintenance',
    components: [
      {
        path: '/htc-front-mdm/project-tenant-maintenance/list',
        component: () => import('./list/ProjectTenantMaintenancePage'),
      },
    ],
  },
];

export default config;
