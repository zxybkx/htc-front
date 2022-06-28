/*
 * @Description:勾选认证路由
 * @version: 1.0
 * @Author: shan.zhang@hand-china.com
 * @Date: 2020-09-23 14:26:15
 * @LastEditTime: 2020-09-29 09:29:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-ivp/check-certification',
    components: [
      {
        path: '/htc-front-ivp/check-certification/list',
        component: () => import('./list/CheckCertificationListPage'),
      },
      {
        //  已认证详情
        path: '/htc-front-ivp/check-certification/certifiableInvoice/detail',
        component: () => import('./detail/CertifiedDetailPage'),
      },
      {
        //  申请抵扣统计
        path: '/htc-front-ivp/check-certification/applyDeduction',
        component: () => import('./detail/ApplyDeductionReport'),
      },
      {
        //  认证结果统计
        path: '/htc-front-ivp/check-certification/certificationResults',
        component: () => import('./detail/CertificationResultsReport'),
      },
    ],
  },
];

export default config;
