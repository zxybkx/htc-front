/**
 * @Description:生成申请
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 15:54:22
 * @LastEditTime: 2022-06-15 10:28:22
 * @Copyright: Copyright (c) 2021, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@htccommon/config/commonConfig';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

/**
 * 专票红字信息表校验规则
 * @params {string} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const redInfoSerialNumberValidator = (value, name, record) => {
  if (value && name && record) {
    const validateNumber = new RegExp(/^\d{16}$/);
    if (!validateNumber.test(value)) {
      return Promise.resolve(
        intl.get('hiop.tobeInvoice.validate.serialNumber').d('请输入16位数字')
      );
    }
  }
  return Promise.resolve(true);
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/prepare-invoice-operation/query-create-requisition`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          method: 'get',
        };
        return axiosConfig;
      },
    },
    primaryKey: 'generateApplication',
    fields: [
      {
        name: 'businessType',
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        required: true,
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.tobeInvoice.modal.invoiceType').d('开票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        required: true,
      },
      {
        name: 'billFlag',
        label: intl.get('hiop.tobeInvoice.modal.billFlag').d('购货清单标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
        required: true,
      },
      {
        name: 'receiptName',
        label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
        type: FieldType.string,
      },
      {
        name: 'quantity',
        label: intl.get('hiop.invoiceWorkbench.modal.quantity').d('数量'),
        type: FieldType.number,
      },
      {
        name: 'amount',
        label: intl.get('hiop.invoiceWorkbench.modal.amount').d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxAmount',
        label: intl.get('hiop.invoiceWorkbench.modal.taxAmount').d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'discountAmount',
        label: intl.get('hiop.tobeInvoice.modal.discountAmount').d('折扣额'),
        type: FieldType.currency,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceCode').d('蓝字发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('amount') < 0,
        },
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.blueInvoiceNo').d('蓝字发票号码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('amount') < 0,
        },
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get('hiop.tobeInvoice.modal.redInfoSerialNumber').d('专票红字信息表'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            record.get('amount') < 0 && ['0', '52'].includes(record.get('invoiceType')),
        },
        validator: (value, name, record) => redInfoSerialNumberValidator(value, name, record),
      },
      {
        name: 'electronicType',
        label: intl.get('hiop.invoiceWorkbench.modal.electronicReceiverInfo').d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get('hiop.invoiceReq.modal.emailPhone').d('手机邮件交付'),
        type: FieldType.string,
        computedProps: {
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return phoneReg;
              }
            }
          },
        },
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get('hiop.tobeInvoice.modal.paperTicketReceiverAddress').d('纸票收件地址'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.tobeInvoice.modal.paperTicketReceiverPhone').d('纸票收件电话'),
        type: FieldType.string,
      },
    ],
  };
};
