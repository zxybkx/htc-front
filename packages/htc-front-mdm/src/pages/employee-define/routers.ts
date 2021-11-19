/*
 * @module - :
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-18 15:50:00
 * @LastEditors: jesse.chen
 * @LastEditTime: 2020-08-10 16:16:53
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-mdm/employee-define',
    components: [
      {
        // 员工信息维护
        path: '/htc-front-mdm/employee-define/list',
        component: () => import('./list/EmployeeDefinePage'),
      },
      {
        // 修改员工手机号
        path: '/htc-front-mdm/employee-define/mobile/:companyId/:mobile',
        component: () => import('./list/EmployeePhoneModifyPage'),
      },
    ],
  },
];

export default config;
