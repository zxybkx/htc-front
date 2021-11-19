/*
 * @Description:退税勾选路由
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-03-24 14:20:06
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/tax-refund',
    components: [
      {
        path: '/htc-front-ivp/tax-refund/list',
        component: () => import('./list/TaxRefundListPage'),
      },
      {
        path: '/htc-front-ivp/tax-refund/texRefundConfirm/:companyId',
        component: () => import('./detail/TaxRefundConfirmPage'),
      },
    ],
  },
];

export default config;
