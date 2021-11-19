/*
 * @Description:生成申请
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 15:54:22
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { AxiosRequestConfig } from 'axios';
import commonConfig from '@common/config/commonConfig';
import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, PHONE } from 'utils/regExp';

const modelCode = 'hiop.tobe-invoice';

const redInfoSerialNumberValidator = (value, name, record) => {
  if (value && name && record) {
    const validateNumber = new RegExp(/^[0-9]{16}$/);
    if (!validateNumber.test(value)) {
      return '请输入16位数字';
    }
  }
  return undefined;
};

export default (): DataSetProps => {
  // const API_PREFIX = `${commonConfig.IOP_API}-28090` || '';
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
        label: intl.get(`${modelCode}.view.businessType`).d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        required: true,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('开票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        required: true,
      },
      {
        name: 'billFlag',
        label: intl.get(`${modelCode}.view.billFlag`).d('购货清单标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
        required: true,
      },
      {
        name: 'receiptName',
        label: intl.get(`${modelCode}.view.receiptName`).d('收票方名称'),
        type: FieldType.string,
      },
      {
        name: 'quantity',
        label: intl.get(`${modelCode}.view.quantity`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'amount',
        label: intl.get(`${modelCode}.view.amount`).d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'discountAmount',
        label: intl.get(`${modelCode}.view.discountAmount `).d('折扣额'),
        type: FieldType.currency,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝字发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('amount') < 0,
        },
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝字发票号码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => record.get('amount') < 0,
        },
      },
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('专票红字信息表'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            record.get('amount') < 0 && ['0', '52'].includes(record.get('invoiceType')),
        },
        validator: (value, name, record) =>
          new Promise((reject) => reject(redInfoSerialNumberValidator(value, name, record))),
      },
      {
        name: 'electronicType',
        label: intl.get(`${modelCode}.view.electronicType`).d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get(`${modelCode}.view.electronicReceiverInfo`).d('手机邮件交付'),
        type: FieldType.string,
        computedProps: {
          pattern: ({ record }) => {
            if (record.get('electronicReceiverInfo')) {
              if (record.get('electronicReceiverInfo').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return PHONE;
              }
            }
          },
        },
      },
      {
        name: 'paperTicketReceiverName',
        label: intl.get(`${modelCode}.view.paperTicketReceiverName`).d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get(`${modelCode}.view.paperTicketReceiverAddress`).d('纸票收件地址'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverPhone',
        label: intl.get(`${modelCode}.view.paperTicketReceiverPhone`).d('纸票收件电话'),
        type: FieldType.string,
      },
    ],
  };
};
