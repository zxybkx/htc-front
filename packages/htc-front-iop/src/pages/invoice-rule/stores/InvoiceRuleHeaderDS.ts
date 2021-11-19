/*
 * @Description:开票规则头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-08-03 10:19:48
 * @LastEditTime: 2021-08-26 11:13:27
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';

const modelCode = 'hiop.tax-info';

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
        // 开票完成通知变更
        // if (name === 'invoiceCompletionNotice') {
        //   record.set({
        //     letterCompletionApplicantFlag: '',
        //     letterCompletionReviewerFlag: '',
        //     emailCompletionApplicantFlag: '',
        //     emailCompletionReviewerFlag: '',
        //   });
        // }
        // 开票异常通知变更
        // if (name === 'invoiceExceptionFlag') {
        //   record.set({
        //     letterExceptionApplicantFlag: '',
        //     letterExceptionReviewerFlag: '',
        //     emailExceptionApplicantFlag: '',
        //     emailExceptionReviewerFlag: '',
        //   });
        // }
        // 限制发票订单数据权限变更
        if (name === 'invoiceWorkbenchFlag') {
          record.set({ invoiceWorkbenchListObj: '' });
        }
        // 限制发票申请单数据权限变更
        if (name === 'invoiceApplyFlag') {
          record.set({ invoiceRequestListObj: '' });
        }
        // 启用动态备注生成规则变更
        if (name === 'enableRulesFlag') {
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
        label: intl.get(`${modelCode}.view.codeTableVersions`).d('编码表版本号'),
        type: FieldType.string,
        lookupCode: 'HIOP.OUT_GLOBAL_OPTIONS',
        defaultValue: 'CODE_TABLE_VERSIONS',
        readOnly: true,
      },
      {
        name: 'productType',
        label: intl.get(`${modelCode}.view.productType`).d('产品类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.OUT_GLOBAL_OPTIONS',
        defaultValue: 'PRODUCT_TYPE',
        readOnly: true,
      },
      {
        name: 'invoiceStyleCode',
        label: intl.get(`${modelCode}.view.invoiceStyleCode`).d('票样代码'),
        type: FieldType.string,
        lookupCode: 'HIOP.OUT_GLOBAL_OPTIONS',
        defaultValue: 'INVOICE_STYLE_CODE',
        readOnly: true,
      },
      {
        name: 'purchaseInvoiceFlag',
        label: intl.get(`${modelCode}.view.purchaseInvoiceFlag`).d('默认收购发票'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: '',
        defaultValue: '',
      },
      {
        name: 'defaultInvoiceTypeObj',
        label: intl.get(`${modelCode}.view.defaultInvoiceType`).d('默认开票种类'),
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
        label: intl.get(`${modelCode}.view.limitInvoiceCode`).d('超限开票类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_MAX_AMOUNT_LIMIT',
        // required: true,
      },
      {
        name: 'defaultPayeeObj',
        label: intl.get(`${modelCode}.view.defaultPayee`).d('默认收款人'),
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
        label: intl.get(`${modelCode}.view.drawerPayeeFlag`).d('开票人默认为收款人'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '130',
      },
      {
        name: 'drawerRulesCode',
        label: intl.get(`${modelCode}.view.drawerRulesCode`).d('开票人取值规则'),
        type: FieldType.string,
        required: true,
        lookupCode: 'HIOP.INVOICER_RULE',
        labelWidth: '110',
      },
      {
        name: 'globalDrawerObj',
        label: intl.get(`${modelCode}.view.globalDrawer`).d('设置全局统一开票人'),
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
        label: intl.get(`${modelCode}.view.invoicePrintMethod`).d('发票打印方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_PRINT_METHOD',
        defaultValue: '1',
      },
      {
        name: 'defaultReviewerObj',
        label: intl.get(`${modelCode}.view.defaultReviewer`).d('默认复核人'),
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
        label: intl.get(`${modelCode}.view.invoiceCompletionNotice`).d('开票完成通知'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.INVOICING_COMPLETION_NOTICE',
        multiple: ',',
      },
      {
        name: 'invoiceExceptionNotice',
        label: intl.get(`${modelCode}.view.invoiceExceptionNotice`).d('开票异常通知'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.INVOICING_EXCEPTION_NOTIFICATION',
        multiple: ',',
      },
      {
        name: 'autoApprovalRules',
        label: intl.get(`${modelCode}.view.autoApprovalRules`).d('自动审核'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.RULES_OF_AUTOMATIC_APPROVAL',
        multiple: ',',
      },
      {
        name: 'distributionInvoiceFlag',
        label: intl.get(`${modelCode}.view.distributionInvoiceFlag`).d('自动分配申请单发票权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'distinguishReviewerFlag',
        label: intl.get(`${modelCode}.view.distinguishReviewerFlag`).d('新建单据不区分审核人权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'businessFieldSplits',
        label: intl.get(`${modelCode}.view.businessFieldSplits`).d('启用业务字段拆单规则'),
        type: FieldType.string,
        lookupCode: 'HTC.HIOP.BUSINESS_FIELD_SPLITTING_RULES',
        multiple: ',',
      },
      {
        name: 'mergeFlag',
        label: intl.get(`${modelCode}.view.mergeFlag`).d('申请单来源单号不同允许合并'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'applyCodePriceFlag',
        label: intl.get(`${modelCode}.view.applyCodePriceFlag`).d('申请单上同编码/单价行合并'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        // labelWidth: '175',
      },
      {
        name: 'inventoryRemindLimit',
        label: intl.get(`${modelCode}.view.inventoryRemindLimit`).d('发票库存数量提醒'),
        type: FieldType.number,
      },
      {
        name: 'inventoryRemindEmail',
        label: intl.get(`${modelCode}.view.inventoryRemindEmail`).d('发票库存邮件提醒'),
        type: FieldType.email,
      },
      {
        name: 'inventoryRemindPhone',
        label: intl.get(`${modelCode}.view.inventoryRemindPhone`).d('发票库存短信提醒'),
        type: FieldType.string,
        pattern: PHONE,
        defaultValidationMessages: {
          patternMismatch: '手机格式不正确', // 正则不匹配的报错信息
        },
      },
      {
        name: 'invoiceWorkbenchFlag',
        label: intl.get(`${modelCode}.view.invoiceWorkbenchFlag`).d('限制发票订单数据权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'invoiceWorkbenchListObj',
        label: intl.get(`${modelCode}.view.invoiceWorkbenchListObj`).d('发票订单数据权限白名单'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        // labelWidth: '155',
        computedProps: {
          disabled: ({ record }) => !(record.get('invoiceWorkbenchFlag') === 'Y'),
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
        label: intl.get(`${modelCode}.view.invoiceApplyFlag`).d('限制发票申请单数据权限'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '155',
      },
      {
        name: 'invoiceRequestListObj',
        label: intl.get(`${modelCode}.view.invoiceRequestListObj`).d('发票申请单数据权限白名单'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
        // labelWidth: '155',
        computedProps: {
          disabled: ({ record }) => !(record.get('invoiceApplyFlag') === 'Y'),
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
        name: 'enableRulesFlag',
        label: intl.get(`${modelCode}.view.enableRulesFlag`).d('启用动态备注生成规则'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
      },
      {
        name: 'enableApplyOneFlag',
        label: intl.get(`${modelCode}.view.enableApplyOneFlag`).d('申请来源1'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'dynamicPrefixOne',
        label: intl.get(`${modelCode}.view.dynamicPrefixOne`).d('动态备注规则-前缀1'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'enableApplyTwoFlag',
        label: intl.get(`${modelCode}.view.enableApplyTwoFlag`).d('申请来源2'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'dynamicPrefixTwo',
        label: intl.get(`${modelCode}.view.dynamicPrefixTwo`).d('动态备注规则-前缀2'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'enableApplyThreeFlag',
        label: intl.get(`${modelCode}.view.enableApplyThreeFlag`).d('申请来源3'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'dynamicPrefixThree',
        label: intl.get(`${modelCode}.view.dynamicPrefixThree`).d('动态备注规则-前缀3'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'enableApplyFourFlag',
        label: intl.get(`${modelCode}.view.enableApplyFourFlag`).d('申请来源4'),
        type: FieldType.boolean,
        trueValue: 'Y',
        falseValue: 'N',
        defaultValue: 'N',
        labelWidth: '190',
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'dynamicPrefixFour',
        label: intl.get(`${modelCode}.view.dynamicPrefixFour`).d('动态备注规则-前缀4'),
        type: FieldType.string,
        computedProps: {
          disabled: ({ record }) => !(record.get('enableRulesFlag') === 'Y'),
        },
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('是否启用'),
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
          label: intl.get(`${modelCode}.view.companyObj`).d('公司名称'),
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
          label: intl.get(`${modelCode}.view.companyName`).d('公司'),
          type: FieldType.string,
          bind: 'companyObj.companyName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'companyCode',
          label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
          type: FieldType.string,
          bind: 'companyObj.companyCode',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('当前员工'),
          type: FieldType.string,
          ignore: FieldIgnore.always,
        },
        {
          name: 'employeeNum',
          label: intl.get(`${modelCode}.view.employeeNum`).d('员工编号'),
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
          ignore: FieldIgnore.always,
        },
        {
          name: 'mobile',
          label: intl.get(`${modelCode}.view.mobile`).d('员工手机号'),
          type: FieldType.string,
          bind: 'companyObj.mobile',
          ignore: FieldIgnore.always,
        },
      ],
    }),
  };
};
