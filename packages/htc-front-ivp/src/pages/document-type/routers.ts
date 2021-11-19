/*
 * @Descripttion:接口单据类型
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-16 15:58:13
 * @LastEditTime: 2020-09-16 16:06:30
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/document-type',
    components: [
      {
        path: '/htc-front-ivp/document-type/list',
        component: () => import('./list/DocumentTypePage'),
      },
      {
        path: '/htc-front-ivp/document-type/interface-doc',
        component: () => import('./list/InterfaceDocPage'),
      },
    ],
  },
];

export default config;
