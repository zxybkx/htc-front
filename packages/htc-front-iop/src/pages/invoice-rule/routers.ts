/*
 * @Descripttion:
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:24:32
 * @LastEditTime: 2020-11-24 10:47:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/invoice-rule',
    component: () => import('./list/InvoiceRuleListPage'),
  },
];

export default config;
