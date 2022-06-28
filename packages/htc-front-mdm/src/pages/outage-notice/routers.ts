/**
 * @@Description: 停机信息维护路由
 * @Author: huishan.yu<huishan.yu@hand-china.com>
 * @Date: 2021-09-17 10:16:53
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-17 10:16:53
 * @Copyright: Copyright (c) 2021, Hand
 */

import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/outage-notice',
    components: [
      {
        path: '/htc-front-mdm/outage-notice/detail',
        component: () => import('./detail/OutageNoticePage'),
      },
    ],
  },
];

export default config;
