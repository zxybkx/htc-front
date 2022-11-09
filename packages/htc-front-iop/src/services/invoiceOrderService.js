/**
 * service - 开票订单工作台
 * @Author:xinyan.zhou
 * @Date: 2020-12-15
 * @LastEditeTime: 2022-3-15
 * @Copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';

const HIOP_API = commonConfig.IOP_API || '';
const HCAN_API = commonConfig.CHAN_API || '';

/**
 * 新建开票订单
 * @async
 * @function orderNew
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function orderNew(params) {
  const { tenantId, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/billing-info/new`, {
    method: 'GET',
    query: otherPrams,
  });
}

/**
 * 获取员工可用发票类型
 * @async
 * @function employeeInvoiceType
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function employeeInvoiceType(params) {
  const { tenantId, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/billing-info/employee-invoice-type`, {
    method: 'GET',
    query: otherPrams,
  });
}

/**
 * 开票订单保存
 * @async
 * @function batchSave
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchSave(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-save`, {
    method: 'POST',
    query: {
      employeeId: otherParams.curEmployeeId,
      discountSplitFlag: otherParams.discountSplitFlag,
    },
    body: [otherParams],
  });
}

/**
 * 开票订单复制
 * @async
 * @function orderCopy
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function orderCopy(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/copy`, {
    method: 'POST',
    query: { employeeId: otherParams.curEmployeeId },
    body: [otherParams],
  });
}

/**
 * 审核提交
 * @async
 * @function review
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function review(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-save?submit=true`, {
    method: 'POST',
    query: { employeeId: otherParams.curEmployeeId },
    body: [otherParams],
  });
}

/**
 * 公司详细信息
 * @async
 * @function companyDetailInfo
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function companyDetailInfo(params) {
  const { tenantId, companyCode } = params;
  return request(`${HIOP_API}/v1/${tenantId}/billing-info/company-detail-info/${companyCode}`, {
    method: 'GET',
  });
}

/**
 * 默认发票交付信息
 * @async
 * @function defaultInvoiceInfo
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function defaultInvoiceInfo(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/billing-info/default-invoice-delivery-info`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 刷新状态
 * @async
 * @function refresh
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function refresh(params) {
  const { tenantId, refreshOrderHeaderList, companyId, employeeId } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/refresh`, {
    method: 'POST',
    query: { companyId, employeeId },
    body: refreshOrderHeaderList,
  });
}

/**
 * 批量提交
 * @async
 * @function batchSubmit
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchSubmit(params) {
  const { tenantId, submitOrderHeaderList, ...otherPrams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-submit`, {
    method: 'POST',
    query: otherPrams,
    body: submitOrderHeaderList,
  });
}

/**
 * 批量取消
 * @async
 * @function batchCancelSubmitOrder
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchCancelSubmitOrder(params) {
  const { tenantId, cancelOrderHeaderList, ...otherPrams } = params;
  return request(
    `${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-cancel-submitted-order`,
    {
      method: 'POST',
      query: otherPrams,
      body: cancelOrderHeaderList,
    }
  );
}

/**
 * 批量删除
 * @async
 * @function batchRemove
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchRemove(params) {
  const { tenantId, invoicingOrderHeaderList } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-remove`, {
    method: 'DELETE',
    body: invoicingOrderHeaderList,
  });
}

/**
 * 单条删除
 * @async
 * @function lineRemove
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function lineRemove(params) {
  const { tenantId, invoicingOrderHeaderList } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-lines/batch-remove`, {
    method: 'DELETE',
    body: invoicingOrderHeaderList,
  });
}

/**
 * 导出打印文件
 * @async
 * @function batchExport
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchExport(params) {
  const { tenantId, exportOrderHeaderList, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-export-print-file`, {
    method: 'POST',
    query: otherParams,
    body: exportOrderHeaderList,
    // responseType: 'blob',
  });
}

/**
 * 导出打印文件base64数组
 * @async
 * @function batchExportNoZip
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchExportNoZip(params) {
  const { tenantId, exportOrderHeaderList, ...otherParams } = params;
  return request(
    `${HIOP_API}/v1/${tenantId}/invoicing-order-headers/batch-export-print-file-not-zip`,
    {
      method: 'POST',
      query: otherParams,
      body: exportOrderHeaderList,
    }
  );
}

/**
 * 行打印文件
 * @async
 * @function exportPrintFile
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function exportPrintFile(params) {
  const { tenantId, exportOrderHeader } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/export-print-file`, {
    method: 'POST',
    body: exportOrderHeader,
    // responseType: 'text',
  });
}

/**
 * 获取创建人数据
 * @async
 * @function employeeList
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function employeeList(params) {
  const { tenantId, companyId } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/create-employee-list`, {
    method: 'GET',
    query: { companyId },
  });
}

/**
 * 获取业务类型
 * @async
 * @function employeePurchaseMark
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function employeePurchaseMark(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/billing-info/employee-purchase-mark`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 档案查看-ofd电子发票URL转JPG
 * @async
 * @function urlTojpg
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function urlTojpg(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HCAN_API}/v1/${tenantId}/ofd-invoice-resolver/url-to-jpg`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 下载注册表文件
 * @async
 * @function getRegistry
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function getRegistry(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/print-invoice-registry`, {
    method: 'POST',
    query: otherParams,
  });
}

/**
 * 本地exe文件路径
 * @async
 * @function getFilePath
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function getFilePath(params) {
  const { tenantId, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/rules-lines-infos/print-file-download-path`, {
    method: 'POST',
    query: otherParams,
    responseType: 'text',
  });
}

/**
 * 更新打印次数
 * @async
 * @function updatePrintNum
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function updatePrintNum(params) {
  const { tenantId, exportOrderHeaderList, ...otherParams } = params;
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/update-export-print-num`, {
    method: 'POST',
    query: {
      ...otherParams,
      confirmFlag: 'Y',
    },
    body: exportOrderHeaderList,
  });
}

/**
 * 申请单发票作废
 * @async
 * @function batchInvalid
 * @params {object} params
 * @returns {object} fetch Promise
 */
export async function batchInvalid(params) {
  const {
    organizationId,
    headerCompanyCode,
    headerEmployeeNumber,
    headerReviewerId,
    submit,
    ...otherParams
  } = params;
  return request(`${HIOP_API}/v1/${organizationId}/requisition-headers/batch-invalid`, {
    method: 'POST',
    query: {
      organizationId,
      headerCompanyCode,
      headerReviewerId,
      headerEmployeeNumber,
      submit,
    },
    body: [otherParams],
  });
}
/**
 * @description: 电票=>电票下载
 * @function: paperDeliverNotice
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function electronicDownload(params) {
  const tenantId = getCurrentOrganizationId();
  return request(`${HIOP_API}/v1/${tenantId}/invoicing-order-headers/electricity-ticket-download`, {
    method: 'POST',
    body: params,
  });
}
