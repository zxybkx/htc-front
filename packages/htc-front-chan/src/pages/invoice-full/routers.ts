/**
 * @Description: 发票全票面信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-24 15:48:54
 * @LastEditTime: 2020-07-27 10:45:05
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-full',
    components: [
      {
        path: '/htc-front-chan/invoice-full/list',
        component: () => import('./list/InvoiceFullListPage'),
      },
      {
        path: '/htc-front-chan/invoice-full/detail/:invoiceHeaderId/:invoiceType',
        component: () => import('./detail/InvoiceFullDetailPage'),
      },
    ],
  },
];

export default config;
