/**
 * @page: 自动催收管理页面路由
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-04-06 10:58
 * @LastEditTime: 2022-06-20 10:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/automatic-collection-manage',
    components: [
      {
        path: '/htc-front-mdm/automatic-collection-manage/list',
        component: () => import('./list/AutomaticCollectionManagePage'),
      },
      {
        path: '/htc-front-mdm/automatic-collection-manage/remind-detail',
        component: () => import('./detail/RemindDetailPage'),
      },
    ],
  },
];

export default config;
