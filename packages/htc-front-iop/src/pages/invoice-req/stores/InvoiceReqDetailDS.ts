/*
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-02-01 14:07:01
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { reqNextDefault } from '@src/services/invoiceReqService';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL, PHONE } from 'utils/regExp';

const modelCode = 'hiop.invoice-req';
const API_PREFIX = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();

// const ReceiptNameDS = (companyId): DataSetProps => {
//   return {
//     // paging: false,
//     transport: {
//       read: ({ data }) => ({
//         url: `${API_PREFIX}/v1/${tenantId}/requisition-headers/receipt-lov`,
//         method: 'GET',
//         params: { ...data, companyId },
//       }),
//     },
//   };
// };

// 收票方5项信息必输验证规则
const receiptRequiredRule = (record, name) => {
  const requestType = record.get('requestType');
  const invoiceType = record.get('invoiceType');
  const receiptType = record.get('receiptType');
  if (
    ['SALES_INVOICE', 'PURCHASE_INVOICE'].includes(requestType) &&
    ['0', '52'].includes(invoiceType)
  ) {
    return true;
  } else if (['2', '41', '51'].includes(invoiceType)) {
    if (requestType === 'PURCHASE_INVOICE') {
      if (name !== 'receiptAccount') {
        return true;
      }
    } else if (requestType === 'SALES_INVOICE') {
      if (name === 'receiptName') {
        return true;
      }
      if (name === 'receiptTaxNo' && ['01', '02'].includes(receiptType)) {
        return true;
      }
    }
  }
  return false;
};

const headerReadOnlyRule = (record) => {
  return (
    !(['N', 'Q'].includes(record.get('requestStatus')) && record.get('deleteFlag') === 'N') ||
    record.get('sourceType') === '8' ||
    record.get('readonly')
  );
};

export default (dsParams): DataSetProps => {
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers/${dsParams.headerId}`;
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
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/requisition-headers/batch-save?employeeId=${data[0].employeeId}`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'headerId',
    events: {
      update: ({ record, name, value, oldValue }) => {
        // 收票方
        if (name === 'receiptObj') {
          const receiptName = value && (value.enterpriseName || value.receiptName);
          const receiptTaxNo = value && value.taxpayerNumber;
          const receiptAddressPhone = value && (value.businessAddressPhone || value.addressPhone);
          const receiptAccount = value && (value.corporateBankAccount || value.accountNumber);
          // 赋值
          record.set({
            receiptName,
            receiptTaxNo,
            receiptAddressPhone,
            receiptAccount,
          });
          if (value !== oldValue && receiptName) {
            // 下次默认
            reqNextDefault({ tenantId, receiptName }).then((res) => {
              if (res && res.nextDefaultFlag === 1) {
                record.set({
                  paperRecipient: res.paperRecipient,
                  paperPhone: res.paperPhone,
                  nextDefaultFlag: res.nextDefaultFlag,
                  paperAddress: res.paperAddress,
                  // electronicType: res.electronicType,
                  emailPhone: res.emailPhone,
                });
              } else {
                record.set({
                  paperRecipient: '',
                  paperPhone: '',
                  nextDefaultFlag: 0,
                  paperAddress: '',
                  // electronicType: '',
                  emailPhone: '',
                });
              }
            });
          }
        }
        // 发票种类标记
        if (name === 'invoiceTypeObj' && value) {
          const invoiceTypeTag = (value && value.tag) || '';
          const electronicType = invoiceTypeTag === 'E' ? '1' : '';
          record.set({
            paperRecipient: '',
            paperPhone: '',
            paperAddress: '',
            electronicType,
            emailPhone: '',
          });
        }
      },
    },
    fields: [
      {
        name: 'readonly',
        type: FieldType.boolean,
      },
      {
        name: 'headerId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司名称'),
        type: FieldType.string,
      },
      {
        name: 'taxpayerNumber',
        label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
        // required: true,
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.number,
        // ignore: FieldIgnore.always,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'mobile',
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'companyType',
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'requestTypeObj',
        label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_BUSINESS_TYPE',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.value',
      },
      {
        name: 'requestTypeMeaning',
        label: intl.get(`${modelCode}.view.requestTypeMeaning`).d('业务类型'),
        type: FieldType.string,
        bind: 'requestTypeObj.meaning',
      },
      {
        name: 'receiptObj',
        label: intl.get(`${modelCode}.view.receiptObj`).d('收票方名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'receiptName',
        label: intl.get(`${modelCode}.view.receiptName`).d('收票方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        textField: 'receiptName',
        valueField: 'taxpayerNumber',
        lookupAxiosConfig: () => ({
          url: `${API_PREFIX}/v1/${tenantId}/requisition-headers/receipt-lov?companyId=${dsParams.companyId}`,
          method: 'GET',
        }),
        // lookupAxiosConfig: () => ({
        //   url: `${API_PREFIX}/v1/${tenantId}/customer-informations-main/customer-info-list?companyId=${dsParams.companyId}`,
        //   method: 'GET',
        // }),
      },
      {
        name: 'receiptTaxNo',
        label: intl.get(`${modelCode}.view.receiptTaxNo`).d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'receiptType',
        label: intl.get(`${modelCode}.view.receiptType`).d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        defaultValue: '01',
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'receiptAddressPhone',
        label: intl.get(`${modelCode}.view.receiptAddressPhone`).d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'receiptAccount',
        label: intl.get(`${modelCode}.view.receiptAccount`).d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'paperRecipient',
        label: intl.get(`${modelCode}.view.paperRecipient`).d('纸票收件人'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
        },
      },
      {
        name: 'paperPhone',
        label: intl.get(`${modelCode}.view.paperPhone`).d('纸票收件人电话'),
        type: FieldType.string,
        pattern: PHONE,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
        },
      },
      {
        name: 'nextDefaultFlag',
        label: intl.get(`${modelCode}.view.nextDefaultFlag`).d('下次默认'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'paperAddress',
        label: intl.get(`${modelCode}.view.paperAddress`).d('纸票收件人地址'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
        },
      },
      {
        name: 'electronicType',
        label: intl.get(`${modelCode}.view.electronicType`).d('交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
        readOnly: true,
      },
      // {
      //   name: 'electronicType',
      //   // label: intl.get(`${modelCode}.view.electronicType`).d('不交付'),
      //   type: FieldType.string,
      //   lookupCode: 'HIOP.DELIVERY_WAY',
      //   readOnly: true,
      //   computedProps: {
      //     disabled: ({ record }) => record.get('invoiceTypeTag') !== 'E',
      //   },
      // },
      {
        name: 'emailPhone',
        label: intl.get(`${modelCode}.view.emailPhone`).d('手机邮件交付'),
        type: FieldType.string,
        computedProps: {
          // required: ({ record }) =>{
          //   return record.get('electronicType') === '1' || record.get('invoiceTypeTag') === 'E'
          // },
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'E',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'E',
          pattern: ({ record }) => {
            if (record.get('emailPhone')) {
              if (record.get('emailPhone').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return PHONE;
              }
            }
          },
        },
      },
      {
        name: 'billingType',
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceTypeObj',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_INVOICE_TYPE',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        bind: 'invoiceTypeObj.value',
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get(`${modelCode}.view.invoiceTypeMeaning`).d('发票种类'),
        type: FieldType.string,
        bind: 'invoiceTypeObj.meaning',
      },
      {
        name: 'invoiceTypeTag',
        label: intl.get(`${modelCode}.view.invoiceTypeTag`).d('发票种类标记'),
        type: FieldType.string,
        bind: 'invoiceTypeObj.tag',
        ignore: FieldIgnore.always,
      },
      {
        name: 'billFlag',
        label: intl.get(`${modelCode}.view.billFlag`).d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
        required: true,
        defaultValue: '9',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'remark',
        label: intl.get(`${modelCode}.view.remark`).d('附加备注'),
        type: FieldType.string,
        maxLength: 200,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'progress',
        label: intl.get(`${modelCode}.view.progress`).d('申请进展'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'orderQuantity',
        label: intl.get(`${modelCode}.view.orderQuantity`).d('订单数量'),
        type: FieldType.number,
      },
      {
        name: 'reviewedQuantity',
        label: intl.get(`${modelCode}.view.reviewedQuantity`).d('审核数量'),
        type: FieldType.number,
      },
      {
        name: 'completedQuantity',
        label: intl.get(`${modelCode}.view.completedQuantity`).d('完成数量'),
        type: FieldType.number,
      },
      {
        name: 'failedQuantity',
        label: intl.get(`${modelCode}.view.failedQuantity`).d('失败数量'),
        type: FieldType.number,
      },
      {
        name: 'showAdjustFlag',
        label: intl.get(`${modelCode}.view.showAdjustFlag`).d('显示调整记录'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'applicantId',
        label: intl.get(`${modelCode}.view.applicantId`).d('申请人标识'),
        type: FieldType.number,
      },
      {
        name: 'applicantNumber',
        label: intl.get(`${modelCode}.view.applicantNumber`).d('申请人编号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'applicantName',
        label: intl.get(`${modelCode}.view.applicantName`).d('申请人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewerId',
        label: intl.get(`${modelCode}.view.reviewerId`).d('审核人标识'),
        type: FieldType.number,
      },
      {
        name: 'reviewerNumber',
        label: intl.get(`${modelCode}.view.reviewerNumber`).d('审核人编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewerName',
        label: intl.get(`${modelCode}.view.reviewerName`).d('审核人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sourceType',
        label: intl.get(`${modelCode}.view.sourceType`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        defaultValue: '1',
        readOnly: true,
        required: true,
      },
      {
        name: 'sourceNumber',
        label: intl.get(`${modelCode}.view.sourceNumber`).d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestNumber',
        label: intl.get(`${modelCode}.view.requestNumber`).d('申请单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestStatus',
        label: intl.get(`${modelCode}.view.requestStatus`).d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
        readOnly: true,
        defaultValue: 'N',
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'reviewDate',
        label: intl.get(`${modelCode}.view.reviewDate`).d('审核时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'sourceNumber1',
        label: intl.get(`${modelCode}.view.sourceNumber1`).d('申请来源单号1'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sourceNumber2',
        label: intl.get(`${modelCode}.view.sourceNumber2`).d('申请来源单号2'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reservationCode',
        label: intl.get(`${modelCode}.view.reservationCode`).d('预约码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'deleteFlag',
        label: intl.get(`${modelCode}.view.deleteFlag`).d('删除标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELETE_MARK',
        defaultValue: 'N',
      },
      {
        name: 'extNumberObj',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.object,
        required: true,
        lovCode: 'HIOP.RULE_EXTENSION',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
        bind: 'extNumberObj.value',
      },
    ],
  };
};

// export { InvoiceReqDetailDS };
