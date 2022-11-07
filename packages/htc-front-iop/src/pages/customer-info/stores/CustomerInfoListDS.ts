/**
 * @Description:客户信息维护
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:17:43
 * @LastEditTime: 2022-06-15 14:02
 * @Copyright: Copyright (c) 2021, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { phoneReg } from '@htccommon/utils/utils';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/customer-informations-main`;
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
          url: `${API_PREFIX}/v1/${tenantId}/customer-informations/batch-save`,
          data,
          params: {
            // checkDataSameFlag,
            ...params,
          },
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/customer-informations/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
    },
    pageSize: 10,
    primaryKey: 'customerInformationId',
    events: {
      update: ({ record, name, value }) => {
        // 开票企业名称
        if (name === 'receiptObj') {
          const customerName = value && (value.enterpriseName || value.receiptName);
          const customerTaxpayerNumber = value && value.taxpayerNumber;
          const customerAddressPhone = value && (value.businessAddressPhone || value.addressPhone);
          const bankNumber = value && (value.corporateBankAccount || value.accountNumber);
          // 赋值
          record.set({
            customerName,
            customerTaxpayerNumber,
            customerAddressPhone,
            bankNumber,
          });
        }
        if (name === 'extNumberObj') {
          record.set({
            invoiceType: '',
            invoiceLimitAmount: null,
          });
        }
        if (name === 'invoiceType') {
          record.set({ invoiceLimitAmount: null });
        }
      },
      // submitSuccess: ({ dataSet, data }) => {
      //   if (data.content && data.content[0]) {
      //     if (data.content[0].status === '1000') {
      //       checkDataSameFlag = '1';
      //       dataSet.query();
      //     } else {
      //       Modal.confirm({
      //         key: Modal.key,
      //         title: data.content[0].message,
      //         okText: '继续',
      //       }).then((button) => {
      //         if (button === 'ok') {
      //           checkDataSameFlag = '0';
      //           dataSet.current!.set({ checkDataSameFlag: '0' });
      //           dataSet.submit();
      //         } else {
      //           dataSet.query();
      //         }
      //       });
      //     }
      //   }
      // },
    },
    fields: [
      {
        name: 'checkDataSameFlag',
        type: FieldType.string,
        defaultValue: '1',
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
        name: 'customerInformationId',
        type: FieldType.string,
      },
      {
        name: 'employeeId',
        type: FieldType.string,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
      },
      {
        name: 'customerCode',
        label: intl.get('hiop.customerInfo.modal.customerCode').d('客户代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'systemCustomerName',
        label: intl.get('hiop.customerInfo.modal.systemCustomerName').d('对接系统客户名称'),
        type: FieldType.string,
      },
      {
        name: 'receiptObj',
        label: intl.get('hiop.customerInfo.modal.receiptObj').d('开票企业名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'customerName',
        label: intl.get('hiop.customerInfo.modal.receiptObj').d('开票企业名称'),
        labelWidth: '150',
        type: FieldType.string,
        required: true,
        textField: 'receiptName',
        valueField: 'taxpayerNumber',
        lookupUrl: `${API_PREFIX}/v1/${tenantId}/requisition-headers/receipt-lov`,
        lookupAxiosConfig: ({ record, ...config }) => ({
          ...config,
          params: {
            companyId: record?.get('companyId'),
            ...config.params,
          },
          method: 'GET',
        }),
      },
      {
        name: 'customerTaxpayerNumber',
        label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => !['02', '03', '04'].includes(record.get('enterpriseType')),
        },
      },
      {
        name: 'customerAddressPhone',
        label: intl.get('htc.common.modal.companyAddressPhone').d('地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'bankNumber',
        label: intl.get('htc.common.modal.bankNumber').d('开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'enterpriseType',
        label: intl.get('hiop.invoiceWorkbench.modal.companyType').d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
      },
      {
        name: 'qualifiedAuditorObj',
        label: intl.get('hiop.customerInfo.modal.qualifiedAuditorObj').d('限定申请人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
      },
      {
        name: 'qualifiedEmployeesIds',
        type: FieldType.string,
        bind: 'qualifiedAuditorObj.employeeId',
        multiple: ',',
        transformRequest: value => value || null,
      },
      {
        name: 'qualifiedEmployeesNames',
        type: FieldType.string,
        bind: `qualifiedAuditorObj.employeeName`,
        multiple: ',',
        transformRequest: value => value || null,
      },
      {
        name: 'extNumberObj',
        label: intl.get('hiop.invoiceWorkbench.modal.extNumber').d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_EXTENSION',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extNumber',
        type: FieldType.string,
        bind: 'extNumberObj.value',
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) => !record.get('extNumber'),
        },
      },
      {
        name: 'invoiceLimitAmount',
        label: intl.get('hiop.customerInfo.modal.invoiceLimitAmount').d('开票限额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !record.get('invoiceType'),
        },
        min: 0.03,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get('hiop.invoiceReq.modal.taxIncludedFlag').d('含税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'billFlag',
        label: intl.get('hiop.invoiceWorkbench.modal.shopListFlag').d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
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
        name: 'paperTicketReceiverPhone',
        label: intl.get('hiop.invoiceWorkbench.modal.paperTicketReceiverPhone').d('纸票收件人电话'),
        type: FieldType.string,
        pattern: phoneReg,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl
          .get('hiop.invoiceWorkbench.modal.paperTicketReceiverAddress')
          .d('纸票收件人地址'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('htc.common.modal.enabledFlag').d('启用状态'),
        type: FieldType.number,
        falseValue: 0,
        trueValue: 1,
        defaultValue: 1,
        lookupCode: 'HPFM.ENABLED_FLAG',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            record.set({
              taxpayerNumber: value.taxpayerNumber,
            });
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get('htc.common.modal.CompanyName').d('公司名称'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'companyId',
          type: FieldType.string,
          bind: 'companyObj.companyId',
        },
        {
          name: 'companyCode',
          type: FieldType.string,
          bind: 'companyObj.companyCode',
        },
        {
          name: 'employeeId',
          type: FieldType.string,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeNum',
          type: FieldType.string,
          bind: 'companyObj.employeeNum',
        },
        {
          name: 'taxpayerNumber',
          label: intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'customerCode',
          label: intl.get('hiop.customerInfo.modal.customerCode').d('客户代码'),
          type: FieldType.string,
        },
        {
          name: 'customerName',
          label: intl.get('hiop.customerInfo.modal.receiptObj').d('开票企业名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
