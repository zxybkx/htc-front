/*
 * @routes -发票认证请求历史记录 :
 * @Author: shan.zhang <shan.zhang@hand-china.com>
 * @Date: 2020-09-21 10:26:45
 * @LastEditors: shan.zhang
 * @LastEditTime: 2020-09-21 16:56:45
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-chan/invoice-authentication-history/list',
    component: () => import('./list/InvoiceAuthenticationHistoryListPage'),
  },
];

export default config;
