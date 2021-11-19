/*
 * @routes -查检发票历史记录查询 :
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-27 14:32:45
 * @LastEditors: jesse.chen
 * @LastEditTime: 2020-07-27 17:22:08
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-check-history',
    components: [
      {
        path: '/htc-front-chan/invoice-check-history/list',
        component: () => import('./list/InvoiceCheckHistoryListPage'),
      },
      {
        path: '/htc-front-chan/invoice-check-history/detail/:invoiceHeaderId/:invoiceType',
        component: () => import('./detail/InvoiceCheckHistoryDetailPage'),
      },
    ],
  },
];

export default config;
