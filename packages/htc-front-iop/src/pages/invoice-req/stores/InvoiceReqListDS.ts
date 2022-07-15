/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-01-15 16:48:12
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
            tenantId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 15,
    selection: DataSetSelection.multiple,
    primaryKey: 'headerId',
    fields: [
      {
        name: 'headerId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'companyName',
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        type: FieldType.string,
      },
      {
        name: 'mobile',
        type: FieldType.string,
      },
      {
        name: 'sourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
      },
      {
        name: 'sourceNumber',
        label: intl.get('hiop.invoiceReq.modal.sourceNumber').d('申请来源单号'),
        type: FieldType.string,
      },
      {
        name: 'requestStatus',
        label: intl.get('hiop.invoiceReq.modal.requisition').d('申请单'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
      },
      {
        name: 'requestNumber',
        label: intl.get('hiop.invoiceReq.modal.requestNumber').d('申请单号'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get('hiop.invoiceWorkbench.modal.creationDate').d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'requestType',
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'billFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
      },
      {
        name: 'buyerName',
        label: intl.get('hiop.invoiceReq.modal.buyerName').d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get('hiop.invoiceReq.modal.buyerTaxNo').d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'buyerAddressPhone',
        label: intl.get('hiop.invoiceReq.modal.buyerAddressPhone').d('购方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'buyerAccount',
        label: intl.get('hiop.invoiceReq.modal.buyerAccount').d('购方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'buyerType',
        label: intl.get('hiop.invoiceReq.modal.buyerType').d('购方企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
      },
      {
        name: 'totalAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.priceTaxAmount').d('合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalTaxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.totalTaxAmount').d('合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'totalIssuesAmount',
        label: intl.get('hiop.invoiceReq.modal.totalIssuesAmount').d('开具合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalIssuesTaxAmount',
        label: intl.get('hiop.invoiceReq.modal.totalIssuesTaxAmount').d('开具合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'orderNums',
        label: intl.get('hiop.invoiceReq.modal.orderNums').d('开票订单信息'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNums',
        label: intl.get('hiop.invoiceReq.modal.invoiceNums').d('发票信息'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get('hiop.invoiceReq.modal.salerTaxNo').d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerAddressPhone',
        label: intl.get('hiop.invoiceReq.modal.salerAddressPhone').d('销方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'salerAccount',
        label: intl.get('hiop.invoiceReq.modal.salerAccount').d('销方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'salerType',
        label: intl.get('hiop.invoiceReq.modal.salerType').d('销方企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
      },
      {
        name: 'sourceNumber1',
        label: intl.get('hiop.invoiceReq.modal.sourceNumber1').d('申请来源单号1'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber2',
        label: intl.get('hiop.invoiceReq.modal.sourceNumber2').d('申请来源单号2'),
        type: FieldType.string,
      },
      {
        name: 'electronicType',
        label: intl.get('hiop.invoiceWorkbench.modal.electronicReceiverInfo').d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'emailPhone',
        label: intl.get('hiop.invoiceRedFlush.modal.phoneOrEmail').d('手机/邮件'),
        type: FieldType.string,
      },
      {
        name: 'paperRecipient',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverPhone').d('纸票收件电话'),
        type: FieldType.string,
      },
      {
        name: 'paperAddress',
        label: intl
          .get('hiop.invoiceWorkbench.modal.paperTicketReceiverAddress')
          .d('纸票收件人地址'),
        type: FieldType.string,
      },
      {
        name: 'applicantId',
        label: intl.get('hiop.invoiceReq.modal.applicantId').d('申请人标识'),
        type: FieldType.number,
      },
      {
        name: 'applicantNumber',
        label: intl.get('hiop.invoiceReq.modal.applicantNumber').d('申请人编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantName',
        label: intl.get('hiop.invoiceReq.modal.applicantName').d('申请人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewerId',
        label: intl.get('hiop.invoiceReq.modal.reviewerId').d('审核人标识'),
        type: FieldType.number,
      },
      {
        name: 'reviewerNumber',
        label: intl.get('hiop.invoiceReq.modal.reviewerNumber').d('审核人编码'),
        type: FieldType.string,
      },
      {
        name: 'reviewerName',
        label: intl.get('hiop.invoiceWorkbench.modal.submitterName').d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'reviewDate',
        label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('审核时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'authEmployees',
        label: intl.get('hiop.invoiceWorkbench.modal.dataPermission').d('数据权限'),
        type: FieldType.string,
      },
      {
        name: 'reservationCode',
        label: intl.get('hiop.invoiceReq.modal.reservationCode').d('预约码'),
        type: FieldType.string,
      },
      {
        name: 'deleteFlag',
        label: intl.get('hiop.invoiceReq.modal.deleteFlagLine').d('删除标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELETE_MARK',
      },
      {
        name: 'progress',
        label: intl.get('hiop.invoiceReq.modal.progress').d('申请进展'),
        type: FieldType.string,
      },
      {
        name: 'orderQuantity',
        label: intl.get('hiop.invoiceReq.modal.orderQuantity').d('订单数量'),
        type: FieldType.number,
      },
      {
        name: 'reviewedQuantity',
        label: intl.get('hiop.invoiceReq.modal.reviewedQuantity').d('审核数量'),
        type: FieldType.number,
      },
      {
        name: 'completedQuantity',
        label: intl.get('hiop.invoiceReq.modal.completedQuantity').d('完成数量'),
        type: FieldType.number,
      },
      {
        name: 'failedQuantity',
        label: intl.get('hiop.invoiceReq.modal.failedQuantity').d('失败数量'),
        type: FieldType.number,
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const { companyCode, employeeNum, employeeName, mobile } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.modal.companyName').d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.number,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyName',
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
          // ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get('htc.common.modal.employeeDesc').d('登录员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeName',
          type: FieldType.string,
          bind: 'companyObj.employeeName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'mobile',
          type: FieldType.string,
          bind: 'companyObj.mobile',
          ignore: FieldIgnore.always,
        },
        {
          name: 'email',
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyAddressPhone',
          label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'requestDate',
          label: intl.get('hiop.invoiceReq.modal.requestDate').d('申请日期'),
          type: FieldType.dateTime,
          range: ['requestDateFrom', 'requestDateTo'],
          defaultValue: {
            requestDateFrom: moment().startOf('day'),
            requestDateTo: moment().endOf('day'),
          },
          required: true,
          ignore: FieldIgnore.always,
        },
        {
          name: 'requestDateFrom',
          type: FieldType.dateTime,
          bind: 'requestDate.requestDateFrom',
        },
        {
          name: 'requestDateTo',
          type: FieldType.dateTime,
          bind: 'requestDate.requestDateTo',
        },
        {
          name: 'reviewDate',
          label: intl.get('hiop.invoiceReq.modal.reviewDate').d('审核日期'),
          type: FieldType.dateTime,
          range: ['reviewDateFrom', 'reviewDateTo'],
          ignore: FieldIgnore.always,
        },
        {
          name: 'reviewDateFrom',
          type: FieldType.dateTime,
          bind: 'reviewDate.reviewDateFrom',
        },
        {
          name: 'reviewDateTo',
          type: FieldType.dateTime,
          bind: 'reviewDate.reviewDateTo',
        },
        {
          name: 'invoiceType',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
        },
        {
          name: 'sourceType',
          label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        },
        {
          name: 'requestType',
          label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        },
        {
          name: 'requestStatus',
          label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.APPLY_STATUS',
        },
        {
          name: 'requestNumber',
          label: intl.get('hiop.invoiceReq.modal.requestNumber').d('申请单号'),
          type: FieldType.string,
        },
        {
          name: 'sourceNumber',
          label: intl.get('hiop.invoiceReq.modal.sourceNumber').d('申请来源单号'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get('hiop.invoiceReq.modal.buyerName').d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'salerName',
          label: intl.get('hiop.invoiceWorkbench.modal.sellerName').d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'deleteFlag',
          label: intl.get('hiop.invoiceReq.modal.deleteFlag').d('显示删除/已合并单据'),
          labelWidth: '140',
          type: FieldType.boolean,
          trueValue: 'Y',
          falseValue: 'N',
          defaultValue: 'N',
        },
        {
          name: 'invoiceCode',
          label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'billingType',
          label: intl.get('hiop.invoiceWorkbench.modal.billingType').d('开票类型'),
          lookupCode: 'HIOP.INVOICE_TYPE',
          type: FieldType.string,
        },
        {
          name: 'sourceNumber1',
          label: intl.get('hiop.invoiceReq.modal.sourceNumber1').d('申请来源单号1'),
          type: FieldType.string,
        },
        {
          name: 'sourceNumber2',
          label: intl.get('hiop.invoiceReq.modal.sourceNumber2').d('申请来源单号2'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
