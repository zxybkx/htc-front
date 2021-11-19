import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/bill-statement',
    components: [
      {
        path: '/htc-front-mdm/bill-statement/list',
        component: () => import('./list/BillStatementPage'),
      },
      {
        path: '/htc-front-mdm/bill-statement/billViewPage',
        component: () => import('./detail/billViewPage'),
      },
    ],
  },
];

export default config;
