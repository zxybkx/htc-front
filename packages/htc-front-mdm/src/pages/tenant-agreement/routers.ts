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
  {
    path: '/htc-front-mdm/tenant-agreement/createPDF',
    component: () => import('./detail/BillView'),
  },
];

export default config;
