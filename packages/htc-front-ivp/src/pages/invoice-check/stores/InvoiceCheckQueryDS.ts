/**
 * @Description: 手工发票查验
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 11:54:42
 * @LastEditTime: 2020-12-25 11:02:06
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hcan.invoice-check';

export default (): DataSetProps => {
  const tenantId = getCurrentOrganizationId();
  return {
    fields: [
      {
        name: 'companyObj',
        label: intl.get(`${modelCode}.view.companyName`).d('公司'),
        type: FieldType.object,
        lovCode: 'HMDM.CURRENT_EMPLOYEE',
        lovPara: { tenantId },
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'companyName',
        label: intl.get(`${modelCode}.view.companyName`).d('公司'),
        type: FieldType.string,
        bind: 'companyObj.companyName',
      },
      {
        name: 'companyCode',
        label: intl.get(`${modelCode}.view.companyCode`).d('公司代码'),
        type: FieldType.string,
        bind: 'companyObj.companyCode',
      },
      {
        name: 'companyId',
        type: FieldType.number,
        bind: 'companyObj.companyId',
      },
      {
        name: 'employeeNumber',
        label: intl.get(`${modelCode}.view.employeeNumber`).d('员工编码'),
        type: FieldType.string,
        bind: 'companyObj.employeeNum',
      },
      {
        name: 'employeeId',
        type: FieldType.number,
        bind: 'companyObj.employeeId',
      },
      {
        name: 'taxpayerIdentificationNumber',
        label: intl.get(`${modelCode}.view.taxpayerIdentificationNumber`).d('购方纳税人识别号'),
        type: FieldType.string,
        labelWidth: '150',
      },
      {
        name: 'invoiceCode',
        label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
        type: FieldType.string,
        computedProps: {
          required: ({ record }) =>
            record.get('invoiceNumber') && record.get('invoiceNumber').length !== 20,
        },
      },
      {
        name: 'invoiceNumber',
        label: intl.get(`${modelCode}.view.invoiceNumber`).d('发票号码'),
        type: FieldType.string,
        required: true,
        maxLength: 20,
      },
      {
        name: 'invoiceDate',
        label: intl.get(`${modelCode}.view.invoiceDate`).d('开票日期'),
        type: FieldType.date,
        format: 'YYYYMMDD',
        required: true,
        transformRequest: value => moment(value).format('YYYYMMDD'),
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('发票金额'),
        type: FieldType.currency,
        // required: true,
      },
      {
        name: 'checkNumber',
        label: intl.get(`${modelCode}.view.checkNumber`).d('校验码（后6位）'),
        type: FieldType.string,
        pattern: /^[a-zA-Z0-9]{6}$/,
        defaultValidationMessages: {
          patternMismatch: intl.get(`${modelCode}.view.checkNumberValid`).d('只能输入6位字符'),
        },
        labelWidth: '150',
      },
      {
        name: 'checkStatus',
        type: FieldType.string,
      },
      {
        name: 'invoiceHeaderId',
        type: FieldType.number,
      },
      {
        name: 'invoiceType',
        type: FieldType.string,
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'companyObj' && value) {
          record.set({ taxpayerIdentificationNumber: value.taxpayerNumber });
        }
        if (!['checkStatus', 'invoiceHeaderId', 'invoiceType'].includes(name)) {
          record.set({
            checkStatus: undefined,
            invoiceHeaderId: undefined,
            invoiceType: undefined,
          });
        }
      },
    },
  };
};
