/*
 * @Description:客户信息维护
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:17:43
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { EMAIL, PHONE } from 'utils/regExp';

const modelCode = 'hiop.customer-info';

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
    pageSize: 5,
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
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'customerInformationId',
        type: FieldType.number,
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
        label: intl.get(`${modelCode}.view.customerCode`).d('客户代码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'systemCustomerName',
        label: intl.get(`${modelCode}.view.systemCustomerName`).d('对接系统客户名称'),
        type: FieldType.string,
      },
      {
        name: 'receiptObj',
        label: intl.get(`${modelCode}.view.receiptObj`).d('开票企业名称'),
        type: FieldType.object,
        ignore: FieldIgnore.always,
      },
      {
        name: 'customerName',
        label: intl.get(`${modelCode}.view.customerName`).d('开票企业名称'),
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
        label: intl.get(`${modelCode}.view.customerTaxpayerNumber`).d('纳税人识别号'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) => !['02', '03', '04'].includes(record.get('enterpriseType')),
        },
      },
      {
        name: 'customerAddressPhone',
        label: intl.get(`${modelCode}.view.customerAddressPhone`).d('地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'bankNumber',
        label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'enterpriseType',
        label: intl.get(`${modelCode}.view.enterpriseType`).d('企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
        required: true,
      },
      {
        name: 'qualifiedAuditorObj',
        label: intl.get(`${modelCode}.view.qualifiedAuditorObj`).d('限定申请人'),
        type: FieldType.object,
        lovCode: 'HMDM.EMPLOYEE_NAME',
        ignore: FieldIgnore.always,
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        multiple: true,
      },
      {
        name: 'qualifiedEmployeesIds',
        label: intl.get(`${modelCode}.view.qualifiedEmployeesIds`).d('限定申请人'),
        type: FieldType.number,
        bind: 'qualifiedAuditorObj.employeeId',
        multiple: ',',
        transformRequest: (value) => value || null,
      },
      {
        name: 'qualifiedEmployeesNames',
        type: FieldType.string,
        bind: `qualifiedAuditorObj.employeeName`,
        multiple: ',',
        transformRequest: (value) => value || null,
      },
      {
        name: 'extNumberObj',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.object,
        lovCode: 'HIOP.RULE_EXTENSION',
        cascadeMap: { companyId: 'companyId', employeeId: 'employeeId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
        bind: 'extNumberObj.value',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) => !record.get('extNumber'),
        },
      },
      {
        name: 'invoiceLimitAmount',
        label: intl.get(`${modelCode}.view.invoiceLimitAmount`).d('开票限额'),
        type: FieldType.currency,
        computedProps: {
          readOnly: ({ record }) => !record.get('invoiceType'),
        },
        min: 0,
      },
      {
        name: 'taxIncludedFlag',
        label: intl.get(`${modelCode}.view.taxIncludedFlag`).d('含税标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.TAX_MARK',
      },
      {
        name: 'billFlag',
        label: intl.get(`${modelCode}.view.billFlag`).d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
      },
      {
        name: 'electronicReceiverInfo',
        label: intl.get(`${modelCode}.view.electronicReceiverInfo`).d('手机邮箱交付'),
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
        name: 'paperTicketReceiverPhone',
        label: intl.get(`${modelCode}.view.paperTicketReceiverPhone`).d('纸票收件人电话'),
        type: FieldType.string,
      },
      {
        name: 'paperTicketReceiverAddress',
        label: intl.get(`${modelCode}.view.paperTicketReceiverAddress`).d('纸票收件人地址'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${modelCode}.view.enabledFlag`).d('启用状态'),
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
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          readOnly: true,
          required: true,
        },
        {
          name: 'customerCode',
          label: intl.get(`${modelCode}.view.customerCode`).d('客户代码'),
          type: FieldType.string,
        },
        {
          name: 'customerName',
          label: intl.get(`${modelCode}.view.customerName`).d('开票企业名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
