/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-02-01 14:07:01
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { reqNextDefault } from '@src/services/invoiceReqService';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

const API_PREFIX = commonConfig.IOP_API || '';
const tenantId = getCurrentOrganizationId();

/**
 * 收票方5项信息必输验证规则
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {boolean}
 */
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
      return name !== 'receiptAccount';
    } else if (requestType === 'SALES_INVOICE') {
      return (
        name === 'receiptName' || (name === 'receiptTaxNo' && ['01', '02'].includes(receiptType))
      );
    }
  }
  return false;
};

/**
 * 只读验证规则
 * @params {object} record-行记录
 */
const headerReadOnlyRule = record => {
  return (
    !(['N', 'Q'].includes(record.get('requestStatus')) && record.get('deleteFlag') === 'N') ||
    record.get('sourceType') === '8' ||
    record.get('readonly')
  );
};

const sourceReadOnlyRule = record => {
  return (
    headerReadOnlyRule(record) || !['1', '3', '4', '5', '6'].includes(record.get('sourceType'))
  );
};

const setNextDefault = (record, value, oldValue, dsParams, receiptName) => {
  const invoiceType = record.get('invoiceType');
  if (value !== oldValue && receiptName && invoiceType) {
    const params = {
      tenantId,
      receiptName,
      companyId: dsParams.companyId,
      invoiceVariety: invoiceType,
    };
    // 下次默认
    reqNextDefault(params).then(res => {
      if (res && res.nextDefaultFlag === 1) {
        if (invoiceType === '51') {
          record.set({
            paperRecipient: '',
            paperPhone: '',
            nextDefaultFlag: res.nextDefaultFlag,
            paperAddress: '',
            emailPhone: res.emailPhone,
          });
        } else {
          record.set({
            paperRecipient: res.paperRecipient,
            paperPhone: res.paperPhone,
            nextDefaultFlag: res.nextDefaultFlag,
            paperAddress: res.paperAddress,
            emailPhone: '',
          });
        }
      }
    });
  }
};

const handleInvoiceTypeObjChange = (name, value, record) => {
  if (name === 'invoiceTypeObj' && value) {
    const invoiceTypeTag = value.tag || '';
    const electronicType = invoiceTypeTag === 'E' ? '1' : '';
    if (invoiceTypeTag === 'E') {
      record.set({
        paperRecipient: '',
        paperPhone: '',
        paperAddress: '',
        electronicType,
      });
    } else {
      record.set({
        electronicType,
        emailPhone: '',
      });
    }
  }
};

export default (dsParams): DataSetProps => {
  const { companyId } = dsParams;
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
          setNextDefault(record, value, oldValue, dsParams, receiptName);
        }
        // 发票种类标记
        handleInvoiceTypeObjChange(name, value, record);
      },
    },
    fields: [
      {
        name: 'readonly',
        type: FieldType.boolean,
      },
      {
        name: 'headerId',
        type: FieldType.string,
      },
      {
        name: 'companyId',
        type: FieldType.string,
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
        label: intl.get('hiop.invoiceWorkbench.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
        ignore: FieldIgnore.always,
      },
      {
        name: 'employeeName',
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
        label: intl.get('hiop.tobeInvoice.modal.requestTypeObj').d('业务类型'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_BUSINESS_TYPE',
        lovPara: { requestType: 'INVOICE_REQUEST' },
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'requestType',
        type: FieldType.string,
        bind: 'requestTypeObj.value',
      },
      {
        name: 'requestTypeMeaning',
        type: FieldType.string,
        bind: 'requestTypeObj.meaning',
      },
      {
        name: 'receiptObj',
        label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'receiptName',
        label: intl.get('hiop.invoiceReq.modal.receiptName').d('收票方名称'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        textField: 'receiptName',
        valueField: 'taxpayerNumber',
        lookupAxiosConfig: () => ({
          url: `${API_PREFIX}/v1/${tenantId}/requisition-headers/receipt-lov?companyId=${encodeURIComponent(
            companyId
          )}`,
          method: 'GET',
        }),
        maxLength: 100,
      },
      {
        name: 'receiptTaxNo',
        label: intl.get('hiop.invoiceWorkbench.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        maxLength: 20,
      },
      {
        name: 'receiptType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
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
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        maxLength: 200,
      },
      {
        name: 'receiptAccount',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record, name }) => receiptRequiredRule(record, name),
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        maxLength: 200,
      },
      {
        name: 'paperRecipient',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverName').d('纸票收件人'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
        },
      },
      {
        name: 'paperPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverPhone').d('纸票收件人电话'),
        type: FieldType.string,
        pattern: phoneReg,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
          pattern: ({ record }) => {
            if (record.get('paperPhone')) {
              if (record.get('paperPhone').indexOf('-') > -1) {
                return new RegExp(/^\d*[-]\d*$/);
              } else {
                return phoneReg;
              }
            }
          },
        },
      },
      {
        name: 'nextDefaultFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.nextDefaultFlag').d('下次默认'),
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
        label: intl
          .get('hiop.invoiceWorkbench.modal.paperTicketReceiverAddress')
          .d('纸票收件人地址'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'D',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'D',
        },
      },
      {
        name: 'electronicType',
        label: intl.get('hiop.invoiceWorkbench.modal.deliveryWay').d('交付方式'),
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
        label: intl.get('hiop.invoiceReq.modal.emailPhone').d('手机邮件交付'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) =>
            headerReadOnlyRule(record) || record.get('invoiceTypeTag') !== 'E',
          disabled: ({ record }) => record.get('invoiceTypeTag') !== 'E',
          pattern: ({ record }) => {
            if (record.get('emailPhone')) {
              if (record.get('emailPhone').indexOf('@') > -1) {
                return EMAIL;
              } else {
                return phoneReg;
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
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceCode',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceCode').d('发票代码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceNo',
        label: intl.get('hiop.invoiceWorkbench.modal.InvoiceNo').d('发票号码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'invoiceTypeObj',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_INVOICE_TYPE',
        lovPara: { requestType: 'INVOICE_REQUEST' },
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
        required: true,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
      },
      {
        name: 'invoiceType',
        type: FieldType.string,
        bind: 'invoiceTypeObj.value',
      },
      {
        name: 'invoiceTypeMeaning',
        type: FieldType.string,
        bind: 'invoiceTypeObj.meaning',
      },
      {
        name: 'invoiceTypeTag',
        type: FieldType.string,
        bind: 'invoiceTypeObj.tag',
        ignore: FieldIgnore.always,
      },
      {
        name: 'billFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
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
        label: intl.get('hiop.invoiceReq.modal.addRemark').d('附加备注'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
          maxLength: ({ record }) => (record.get('invoiceType') === '41' ? 170 : 230),
        },
      },
      {
        name: 'progress',
        label: intl.get('hiop.invoiceReq.modal.progress').d('申请进展'),
        type: FieldType.string,
        readOnly: true,
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
      {
        name: 'showAdjustFlag',
        label: intl.get('hiop.invoiceReq.modal.showAdjustFlag').d('显示调整记录'),
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
        label: intl.get('hiop.invoiceReq.modal.applicantId').d('申请人标识'),
        type: FieldType.string,
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
        type: FieldType.string,
      },
      {
        name: 'reviewerNumber',
        label: intl.get('hiop.invoiceReq.modal.reviewerNumber').d('审核人编码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'reviewerName',
        label: intl.get('hiop.invoiceWorkbench.modal.submitterName').d('审核人'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'sourceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceType').d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        defaultValue: '1',
        readOnly: true,
        required: true,
      },
      {
        name: 'sourceNumber',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceSourceOrder').d('来源单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestNumber',
        label: intl.get('hiop.invoiceReq.modal.requestNumber').d('申请单号'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'requestStatus',
        label: intl.get('hiop.invoiceReq.modal.requestStatus').d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
        readOnly: true,
        defaultValue: 'N',
      },
      {
        name: 'creationDate',
        label: intl.get('hiop.invoiceWorkbench.modal.creationDate').d('创建时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'reviewDate',
        label: intl.get('hiop.invoiceWorkbench.modal.submitDates').d('审核时间'),
        type: FieldType.dateTime,
        readOnly: true,
      },
      {
        name: 'sourceNumber1',
        label: intl.get('hiop.invoiceReq.modal.sourceNumber1').d('来源单号1'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => sourceReadOnlyRule(record),
        },
      },
      {
        name: 'sourceNumber2',
        label: intl.get('hiop.invoiceReq.modal.sourceNumber2').d('来源单号2'),
        type: FieldType.string,
        computedProps: {
          readOnly: ({ record }) => sourceReadOnlyRule(record),
        },
      },
      {
        name: 'reservationCode',
        label: intl.get('hiop.invoiceReq.modal.reservationCode').d('预约码'),
        type: FieldType.string,
        readOnly: true,
      },
      {
        name: 'deleteFlag',
        label: intl.get('hiop.invoiceReq.modal.deleteFlag').d('删除标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELETE_MARK',
        defaultValue: 'N',
      },
      {
        name: 'extNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
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
        type: FieldType.string,
        bind: 'extNumberObj.value',
      },
      {
        name: 'systemCodeObj',
        label: intl.get('hivp.invoices.view.systemCode').d('来源系统'),
        type: FieldType.object,
        lovCode: 'HTC.SOURCE_SYSTEM',
        lovPara: { enabledFlag: 1 },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'systemCode',
        type: FieldType.string,
        bind: 'systemCodeObj.systemCode',
      },
      {
        name: 'docTypeHeaderId',
        type: FieldType.string,
        bind: 'systemCodeObj.docTypeHeaderId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCodeObj',
        label: intl.get('hivp.invoicesArchiveUpload.view.documentTypeMeaning').d('单据类型'),
        type: FieldType.object,
        lovCode: 'HTC.DOCUMENT_TYPE',
        cascadeMap: { docTypeHeaderId: 'docTypeHeaderId' },
        lovPara: { enabledFlag: 1 },
        computedProps: {
          readOnly: ({ record }) => headerReadOnlyRule(record),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'documentTypeCode',
        type: FieldType.string,
        bind: 'documentTypeCodeObj.documentTypeCode',
      },
    ],
  };
};

// export { InvoiceReqDetailDS };
