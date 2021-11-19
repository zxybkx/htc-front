/*
 * @Descripttion:税控信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-23 14:35:44
 * @LastEditTime: 2020-11-23 17:52:50
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/tax-info',
    component: () => import('./list/TaxInfoListPage'),
  },
];

export default config;
