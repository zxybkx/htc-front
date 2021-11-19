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
        component: () => import('./detail/RedInvoiceInfoDetail'),
      },
      {
        // 同步请求列表
        path: '/htc-front-iop/red-invoice-info/SynchronizeRedInfoList',
        component: () => import('./detail/SynchronizeRedInfoPage'),
      },
    ],
  },
];

export default config;
