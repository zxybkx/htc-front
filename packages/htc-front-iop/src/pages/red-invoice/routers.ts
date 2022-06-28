/**
 * @Description: 专票红字路由
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2021-08-12 17:41:12
 * @LastEditTime: 2022-06-14 14:04
 * @Copyright: Copyright (c) 2021, Hand
 */
import { RoutersConfig } from 'hzero-boot/lib/typings/IRouterConfig';

const config: RoutersConfig = [
  {
    path: '/htc-front-iop/red-invoice-requisition',
    components: [
      {
        // 专用红字申请单列表
        path: '/htc-front-iop/red-invoice-requisition/list',
        component: () => import('./list/RedInvoiceRequisitionListPage'),
      },
      {
        // 新建专用红字申请单
        path: '/htc-front-iop/red-invoice-requisition/create/:companyId',
        component: () => import('./list/RedInvoiceRequisitionPage'),
      },
      {
        // 专用红字申请单详情
        path: '/htc-front-iop/red-invoice-requisition/detail/:companyId/:headerId',
        component: () => import('./list/RedInvoiceRequisitionPage'),
      },
    ],
  },
  {
    path: '/htc-front-iop/red-invoice-info',
    components: [
      {
        // 专票红字信息表列表
        path: '/htc-front-iop/red-invoice-info/list',
        component: () => import('./list/RedInvoiceInfoTableListPage'),
      },
      {
        // 专票红字信息表列表-详情
        path: '/htc-front-iop/red-invoice-info/detail/:companyId/:headerId',
        component: () => import('./detail/RedInvoiceInfoDetailPage'),
      },
      {
        // 同步请求列表
        path: '/htc-front-iop/red-invoice-info/synchronize-red-info-list',
        component: () => import('./detail/SynchronizeRedInfoPage'),
      },
    ],
  },
];

export default config;
