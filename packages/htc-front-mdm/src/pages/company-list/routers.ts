import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/company',
    // component: () => import('./list/CompanyListPage'),
    // title: '公司列表维护',
    components: [
      {
        path: '/htc-front-mdm/company/list',
        component: () => import('./list/CompanyListPage'),
      },
      {
        path: '/htc-front-mdm/company/detail/:companyId',
        component: () => import('./detail/CompanyDetailPage'),
      },
    ],
  },
];

export default config;
