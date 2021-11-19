import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/bill-push-history',
    components: [
      {
        path: '/htc-front-chan/bill-push-history/list',
        component: () => import('./list/BillPushHistoryPage'),
      },
      {
        path: '/htc-front-chan/bill-push-history/billViewPage',
        component: () => import('./detail/billViewPage'),
      },
    ],
  },
];

export default config;
