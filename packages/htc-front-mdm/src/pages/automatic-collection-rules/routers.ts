/**
 * @page: 自动催收规则维护页面路由
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:03
 * @LastEditTime: 2022-06-20 15:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/automatic-collection-rules',
    component: () => import('./list/AutomaticCollectionRulesPage'),
  },
];

export default config;
