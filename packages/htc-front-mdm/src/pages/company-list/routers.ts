/**
 * @Description: 公司列表维护路由
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-18 15:50:00
 * @LastEditors: jesse.chen
 * @LastEditTime: 2020-08-10 16:16:53
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/company',
    // component: () => import('./list/CompanyListPage'),
    // title: '公司列表维护',
    components: [
      {
        path: '/htc-front-mdm/company/list',
        component: () => import('./list/CompanyListPage'),
      },
      {
        path: '/htc-front-mdm/company/detail/:companyId',
        component: () => import('./detail/CompanyDetailPage'),
      },
    ],
  },
];

export default config;
