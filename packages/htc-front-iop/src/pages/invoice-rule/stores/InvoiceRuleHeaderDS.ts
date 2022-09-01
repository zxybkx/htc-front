/**
 * @Description:开票规则头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { phoneReg } from '@htccommon/utils/utils';

/**
 * 待开票导入单价合并允差校验规则
 * @params {number} value-当前值
 * @params {string} name-标签名
 * @params {object} record-行记录
 * @returns {string/undefined}
 */
const priceValidator = (value, name, record) => {
  if ((value || value === 0) && name && record) {
    if (value <= 0 || value >= 100) {
      return Promise.resolve(
        intl.get('hiop.invoiceRule.validate.price').d('请输入0-100之间的数字')
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
        const url = `${API_PREFIX}/v1/${tenantId}/rules-header-infos`;
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
          url: `${API_PREFIX}/v1/${tenantId}/rules-header-infos/save-info`,
          data: data && data[0],
          params,
          method: 'POST',
        };
      },
    },
    paging: false,
    selection: false,
    primaryKey: 'rulesHeaderId',
    events: {
      update: ({ record, name }) => {
        // 限制发票订单数据权限变更
        switch (name) {
          case 'invoiceWorkbenchFlag':
            record.set({ invoiceWorkbenchListObj: '' });
            break;
          case 'invoiceApplyFlag':
            record.set({ invoiceRequestListObj: '' });
            break;
          case 'invoicePrepareFlag':
            record.set({ invoicePrepareListObj: '' });
            break;
          case 'enableRulesFlag':
            record.set({
              enableApplyOneFlag: '',
              dynamicPrefixOne: '',
              enableApplyTwoFlag: '',
              dynamicPrefixTwo: '',
              enableApplyThreeFlag: '',
              dynamicPrefixThree: '',
              enableApplyFourFlag: '',
              dynamicPrefixFour: '',
            });
            break;
          case 'monthlyInvoicingLimitRemind':
            record.set('monthlyInvoicingLimit', '');
            break;
          case 'quarterInvoicingLimitRemind':
            record.set('quarterInvoicingLimit', '');
            break;
          case 'annualInvoicingLimitRemind':
            record.set('annualInvoicingLimit', '');
            break;
          default:
            break;
        }
      },
    },
    fields: [
      {
        name: 'rulesHeaderId',
        type: FieldType.number,
      },
      {
        name: 'companyId',
        type: FieldType.number,
        required: true,
      },
      {
        name: 'companyName',
        type: FieldType.string,
      },
      {
        name: 'codeTableVersions',
        label: intl.get('hiop.invoiceRule.modal.codeTableVersions').d('编码表版本号'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.COMMODITY_VERSION_NUMBER',
        defaultValue: '33.0',
        // readOnly: true,
      },
      {
        name: 'productType',
        label: intl.get('hiop.invoiceRule.modal.productType').d('产品类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.OUT_GLOBAL_OPTIONS',
        defaultValue: 'PRODUCT_TYPE',
        readOnly: true,
      },
      {
        name: 'invoiceStyleCode',
        label: intl.get('hiop.invoiceRule.modal.invoiceStyleCode').d('票样代码'),
        type: FieldType.string,
        lookupCode: 'HIOP.OUT_GLOBAL_OPTIONS',
        defaultValue: 'INVOICE_STYLE_CODE',
        readOnly: true,
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get('hiop.invoiceRule.modal.purchaseInvoiceFlag').d('默认收购发票'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: '',
        defaultValue: '',
      },
      {
        name: 'defaultInvoiceTypeObj',
        label: intl.get('hiop.invoiceRule.modal.defaultInvoiceTypeObj').d('默认开票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.COMPANY_INVOICE_TYPE',
        cascadeMap: { companyId: 'companyId' },
        required: true,
        ignore: FieldIgnore.always,
      },
      {
        name: 'defaultInvoiceTypeCode',
        type: FieldType.string,
        bind: 'defaultInvoiceTypeObj.value',
      },
      {
        name: 'defaultInvoiceTypeMeaning',
        type: FieldType.string,
        bind: 'defaultInvoiceTypeObj.meaning',
      },
      {
        name: 'limitInvoiceCode',
        label: intl.get('hiop.invoiceRule.modal.limitInvoiceCode').d('超限开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_MAX_AMOUNT_LIMIT',
        // required: true,
      },
      {
        name: 'defaultPayeeObj',
        label: intl.get('hiop.invoiceRule.modal.defaultPayeeObj').d('默认收款人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
      },
      {
        name: 'defaultPayeeId',
        type: FieldType.number,
        bind: 'defaultPayeeObj.employeeId',
      },
      {
        name: 'defaultPayeeNum',
        type: FieldType.string,
        bind: 'defaultPayeeObj.employeeNum',
      },
      {
        name: 'defaultPayeeName',
        type: FieldType.string,
        bind: 'defaultPayeeObj.employeeName',
      },
      {
        name: 'drawerPayeeFlag',
        label: intl.get('hiop.invoiceRule.modal.drawerPayeeFlag').d('开票人默认为收款人'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '130',
      },
      {
        name: 'drawerRulesCode',
        label: intl.get('hiop.invoiceRule.modal.drawerRulesCode').d('开票人取值规则'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.INVOICER_RULE',
        labelWidth: '110',
      },
      {
        name: 'mergeRules',
        label: intl.get('hiop.invoiceRule.modal.mergeRules').d('业务字段合并规则'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.BUSINESS_FIELD_MERGE_RULES',
        multiple: ',',
      },
      {
        name: 'prepareAutoMerge',
        label: intl.get('hiop.invoiceRule.modal.prepareAutoMerge').d('待开票同批次导入自动合并'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP_AUTOMERGE_BATCH_IMPORT_TOBEBILLED',
        multiple: ',',
      },
      {
        name: 'sourceNumberMerges',
        label: intl
          .get('hiop.invoiceRule.modal.sourceNumberMerges')
          .d('开票申请单同批次导入自动合并'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP_AUTOMERGE_BATCH_IMPORT_APPLY',
        multiple: ',',
      },
      {
        name: 'unitPriceTolerance',
        label: intl.get('hiop.invoiceRule.modal.unitPriceTolerance').d('待开票导入单价合并允差'),
        type: FieldType.number,
        precision: 8,
        validator: (value, name, record) => priceValidator(value, name, record),
      },
      {
        name: 'globalDrawerObj',
        label: intl.get('hiop.invoiceRule.modal.globalDrawerObj').d('设置全局统一开票人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          required: ({ record }) => record.get('drawerRulesCode') === 'COMPANY_ONE_INVOICER',
        },
        // labelWidth: '130',
      },
      {
        name: 'globalDrawerId',
        type: FieldType.number,
        bind: 'globalDrawerObj.employeeId',
      },
      {
        name: 'globalDrawerNum',
        type: FieldType.string,
        bind: 'globalDrawerObj.employeeNum',
      },
      {
        name: 'globalDrawerName',
        type: FieldType.string,
        bind: 'globalDrawerObj.employeeName',
      },
      {
        name: 'invoicePrintMethod',
        label: intl.get('hiop.invoiceRule.modal.invoicePrintMethod').d('发票打印方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_PRINT_METHOD',
        defaultValue: '1',
      },
      {
        name: 'defaultReviewerObj',
        label: intl.get('hiop.invoiceRule.modal.defaultReviewerObj').d('默认复核人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
      },
      {
        name: 'defaultReviewerId',
        type: FieldType.number,
        bind: 'defaultReviewerObj.employeeId',
      },
      {
        name: 'defaultReviewerName',
        type: FieldType.string,
        bind: 'defaultReviewerObj.employeeName',
      },
      {
        name: 'defaultReviewerNum',
        type: FieldType.string,
        bind: 'defaultReviewerObj.employeeNum',
      },
      {
        name: 'invoiceCompletionNotice',
        label: intl.get('hiop.invoiceRule.modal.invoiceCompletionNotice').d('开票完成通知'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.INVOICING_COMPLETION_NOTICE',
        multiple: ',',
      },
      {
        name: 'invoiceExceptionNotice',
        label: intl.get('hiop.invoiceRule.modal.invoiceExceptionNotice').d('开票异常通知'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.INVOICING_EXCEPTION_NOTIFICATION',
        multiple: ',',
      },
      {
        name: 'autoApprovalRules',
        label: intl.get('hiop.invoiceRule.modal.autoApprovalRules').d('自动审核'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RULES_OF_AUTOMATIC_APPROVAL',
        multiple: ',',
      },
      {
        name: 'qrCodeInvalid',
        label: intl.get('hiop.invoiceRule.modal.qrCodeInvalid').d('二维码失效时间'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP_QR_CODE_INVALID',
      },
      {
        name: 'distributionInvoiceFlag',
        label: intl
          .get('hiop.invoiceRule.modal.distributionInvoiceFlag')
          .d('自动分配申请单发票权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'distinguishReviewerFlag',
        label: intl
          .get('hiop.invoiceRule.modal.distinguishReviewerFlag')
          .d('新建单据不区分审核人权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'businessFieldSplits',
        label: intl.get('hiop.invoiceRule.modal.businessFieldSplits').d('业务字段拆单规则'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.BUSINESS_FIELD_SPLITTING_RULES',
        multiple: ',',
      },
      {
        name: 'inventoryRemindLimit',
        label: intl.get('hiop.invoiceRule.modal.inventoryRemindLimit').d('数量提醒'),
        type: FieldType.number,
      },
      {
        name: 'inventoryRemindEmail',
        label: intl.get('hiop.invoiceRule.modal.inventoryRemindEmail').d('邮件提醒'),
        type: FieldType.email,
      },
      {
        name: 'inventoryRemindPhone',
        label: intl.get('hiop.invoiceRule.modal.inventoryRemindPhone').d('短信提醒'),
        type: FieldType.string,
        pattern: phoneReg,
        defaultValidationMessages: {
          patternMismatch: '手机格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'offLineAmountLimit',
        label: intl.get('hiop.invoiceRule.modal.offLineAmountLimit').d('离线剩余限额小于'),
        type: FieldType.currency,
      },
      {
        name: 'offLineTimeLimit',
        label: intl.get('hiop.invoiceRule.modal.offLineTimeLimit').d('离线剩余时限小于'),
        type: FieldType.number,
      },
      {
        name: 'offLineRemindPhone',
        label: intl.get('hiop.invoiceRule.modal.inventoryRemindPhone').d('短信提醒'),
        type: FieldType.string,
        pattern: phoneReg,
        defaultValidationMessages: {
          patternMismatch: '手机格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'offLineRemindEmail',
        label: intl.get('hiop.invoiceRule.modal.inventoryRemindEmail').d('邮件提醒'),
        type: FieldType.email,
      },
      {
        name: 'invoiceWorkbenchFlag',
        label: intl.get('hiop.invoiceRule.modal.invoiceWorkbenchFlag').d('限制发票订单数据权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'monthlyInvoicingLimitRemind',
        label: intl
          .get('hiop.invoiceRule.modal.monthlyInvoicingLimitRemind')
          .d('启用月度开票限额提醒'),
        type: FieldType.boolean,
        defaultValue: false,
      },
      {
        name: 'quarterInvoicingLimitRemind',
        label: intl.get('hiop.invoiceRule.modal.qyjdkpxetx').d('启用季度开票限额提醒'),
        type: FieldType.boolean,
        defaultValue: false,
      },
      {
        name: 'monthlyInvoicingLimit',
        label: intl.get('hiop.invoiceRule.modal.monthlyInvoicingLimit').d('月度开票限额（元）'),
        type: FieldType.currency,
        min: 0,
        computedProps: {
          disabled: ({ record }) => !record.get('monthlyInvoicingLimitRemind'),
          required: ({ record }) => record.get('monthlyInvoicingLimitRemind'),
        },
      },
      {
        name: 'quarterInvoicingLimit',
        label: intl.get('hiop.invoiceRule.modal.quarterInvoicingLimit').d('季度开票限额（元）'),
        type: FieldType.currency,
        min: 0,
        computedProps: {
          disabled: ({ record }) => !record.get('quarterInvoicingLimitRemind'),
          required: ({ record }) => record.get('quarterInvoicingLimitRemind'),
        },
      },
      {
        name: 'annualInvoicingLimitRemind',
        label: intl
          .get('hiop.invoiceRule.modal.annualInvoicingLimitRemind')
          .d('启用年度开票限额提醒'),
        type: FieldType.boolean,
        defaultValue: false,
      },
      {
        name: 'annualInvoicingLimit',
        label: intl.get('hiop.invoiceRule.modal.annualInvoicingLimit').d('年度开票限额（元）'),
        type: FieldType.currency,
        min: 0,
        computedProps: {
          disabled: ({ record }) => !record.get('annualInvoicingLimitRemind'),
          required: ({ record }) => record.get('annualInvoicingLimitRemind'),
        },
      },
      {
        name: 'invoiceWorkbenchListObj',
        label: intl
          .get('hiop.invoiceRule.modal.invoiceWorkbenchListObj')
          .d('发票订单数据权限白名单'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        computedProps: {
          disabled: ({ record }) => record.get('invoiceWorkbenchFlag') !== 'Y',
        },
      },
      {
        name: 'invoiceWorkbenchListIds',
        type: FieldType.number,
        bind: 'invoiceWorkbenchListObj.employeeId',
        multiple: ',',
      },
      {
        name: 'invoiceWorkbenchMeaning',
        type: FieldType.string,
        bind: `invoiceWorkbenchListObj.employeeName`,
        multiple: ',',
      },
      {
        name: 'invoiceApplyFlag',
        label: intl.get('hiop.invoiceRule.modal.invoiceApplyFlag').d('限制发票申请单数据权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'invoiceRequestListObj',
        label: intl
          .get('hiop.invoiceRule.modal.invoiceRequestListObj')
          .d('发票申请单数据权限白名单'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        // labelWidth: '155',
        computedProps: {
          disabled: ({ record }) => record.get('invoiceApplyFlag') !== 'Y',
        },
      },
      {
        name: 'invoiceRequestListIds',
        type: FieldType.number,
        bind: 'invoiceRequestListObj.employeeId',
        multiple: ',',
      },
      {
        name: 'invoiceRequestMeaning',
        type: FieldType.string,
        bind: `invoiceRequestListObj.employeeName`,
        multiple: ',',
      },
      {
        name: 'invoicePrepareFlag',
        label: intl.get('hiop.invoiceRule.modal.invoicePrepareFlag').d('限制待开票数据权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'invoicePrepareListObj',
        label: intl.get('hiop.invoiceRule.modal.invoicePrepareListObj').d('待开票数据权限白名单'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        computedProps: {
          disabled: ({ record }) => record.get('invoiceApplyFlag') !== 'Y',
        },
      },
      {
        name: 'invoicePrepareListIds',
        type: FieldType.number,
        bind: 'invoicePrepareListObj.employeeId',
        multiple: ',',
      },
      {
        name: 'invoicePrepareMeaning',
        type: FieldType.string,
        bind: `invoicePrepareListObj.employeeName`,
        multiple: ',',
      },
      {
        name: 'enableRulesFlag',
        label: intl.get('hiop.invoiceRule.modal.enableRulesFlag').d('启用动态备注生成规则'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplyOneFlag',
        label: intl.get('hiop.invoiceRule.modal.enableApplyOneFlag').d('申请来源1'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'dynamicPrefixOne',
        label: intl.get('hiop.invoiceRule.modal.dynamicPrefixOne').d('前缀1'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'enableApplyTwoFlag',
        label: intl.get('hiop.invoiceRule.modal.enableApplyTwoFlag').d('申请来源2'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'dynamicPrefixTwo',
        label: intl.get('hiop.invoiceRule.modal.dynamicPrefixTwo').d('前缀2'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'enableApplyThreeFlag',
        label: intl.get('hiop.invoiceRule.modal.enableApplyThreeFlag').d('申请来源3'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'dynamicPrefixThree',
        label: intl.get('hiop.invoiceRule.modal.dynamicPrefixThree').d('前缀3'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'enableApplyFourFlag',
        label: intl.get('hiop.invoiceRule.modal.enableApplyFourFlag').d('申请来源4'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'dynamicPrefixFour',
        label: intl.get('hiop.invoiceRule.modal.dynamicPrefixFour').d('前缀4'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => record.get('enableRulesFlag') !== 'Y',
        },
      },
      {
        name: 'enabledFlag',
        label: intl.get('hiop.invoiceRule.modal.enabledFlag').d('是否启用'),
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
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
          label: intl.get('htc.common.label.companyName').d('所属公司'),
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
          ignore: FieldIgnore.always,
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
          name: 'mobile',
          type: FieldType.string,
          bind: 'companyObj.mobile',
          ignore: FieldIgnore.always,
        },
      ],
    }),
  };
};
