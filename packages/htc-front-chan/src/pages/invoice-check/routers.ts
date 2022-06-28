/**
 * @Descripttion:手工发票查验
 * @version:1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 11:17:52
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-check',
    components: [
      {
        path: '/htc-front-chan/invoice-check/query',
        component: () => import('./list/InvoiceCheckQueryPage'),
      },
      {
        path: '/htc-front-chan/invoice-check/detail/:invoiceHeaderId/:invoiceType',
        component: () => import('./detail/InvoiceCheckDetailPage'),
      },
    ],
  },
];

export default config;
