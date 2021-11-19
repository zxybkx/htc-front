/*
 * @Descripttion: 专票红字申请单列表DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2020-12-14 09:34:36
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

const modelCode = 'hiop.redInvoice';

export default (): DataSetProps => {
  const HIOP_API = `${commonConfig.IOP_API}`;
  const organizationId = getCurrentOrganizationId();
  // const yesterdayStart = moment().subtract(1, 'days').startOf('day');
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${organizationId}/red-invoice-infos`;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            ...config.params,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'redInvoiceInfoHeaderId',
    events: {},
    fields: [
      {
        name: 'redInfoSerialNumber',
        label: intl.get(`${modelCode}.view.redInfoSerialNumber`).d('红字信息表编码'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'redInvoiceInfoHeaderId',
        type: FieldType.string,
      },
      {
        name: 'orderStatus',
        label: intl.get(`${modelCode}.view.orderStatus`).d('状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.RED_INFO_STATUS',
        required: true,
      },
      {
        name: 'redInvoiceDate',
        label: intl.get(`${modelCode}.view.redInvoiceDate`).d('填开时间'),
        type: FieldType.dateTime,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        required: true,
      },
      {
        name: 'taxDiskNumber',
        label: intl.get(`${modelCode}.view.taxDiskNumber`).d('金税盘编号（机器编码）'),
        type: FieldType.string,
      },
      {
        name: 'extensionNumber',
        label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'blueInvoiceObj',
        label: intl.get(`${modelCode}.view.blueInvoiceObj`).d('蓝字发票'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
      },
      {
        name: 'blueInvoiceCode',
        label: intl.get(`${modelCode}.view.blueInvoiceCode`).d('蓝字发票代码'),
        type: FieldType.object,
        lovCode: 'HIOP.SPECIAL_INVOICE',
        bind: 'blueInvoiceObj.invoiceCode',
      },
      {
        name: 'blueInvoiceNo',
        label: intl.get(`${modelCode}.view.blueInvoiceNo`).d('蓝字发票号码'),
        type: FieldType.string,
        bind: 'blueInvoiceObj.invoiceNo',
      },
      {
        name: 'invoiceAmount',
        label: intl.get(`${modelCode}.view.invoiceAmount`).d('金额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerName',
        label: intl.get(`${modelCode}.view.sellerName`).d('销方名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'sellerTaxNo',
        label: intl.get(`${modelCode}.view.sellerTaxNo`).d('销方纳税人识别号'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'overdueStatus',
        label: intl.get(`${modelCode}.view.overdueStatus`).d('逾期状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.LATE_STATUS',
      },
      {
        name: 'invoiceTypeCode',
        label: intl.get(`${modelCode}.view.invoiceTypeCode`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
    ],
    queryDataSet: new DataSet({
      events: {
        update: async ({ record, name, value }) => {
          if (value && name === 'companyObj') {
            const {
              companyCode,
              companyId,
              employeeNum,
              employeeName,
              mobile,
              taxpayerNumber,
            } = value;
            const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
            record.set('employeeDesc', employeeDesc);
            record.set('taxpayerNumber', taxpayerNumber);
            /* 设置金税盘编码默认值 */
            const taxDiskRes = await queryUnifyIdpValue('HIOP.TAX_DISK_NUMBER', { companyId });
            if (taxDiskRes) {
              const taxNumberInfo = taxDiskRes[0];
              record.set('taxDiskNumberObj', taxNumberInfo);
            }
          }
        },
      },
      fields: [
        {
          name: 'companyObj',
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
          type: FieldType.object,
          lovCode: 'HIOP.CURRENT_EMPLOYEE_OUT',
          lovPara: { tenantId: organizationId },
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
          name: 'employeeId',
          type: FieldType.number,
          bind: 'companyObj.employeeId',
        },
        {
          name: 'employeeDesc',
          label: intl.get(`${modelCode}.view.employeeDesc`).d('登录员工'),
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
          name: 'email',
          label: intl.get(`${modelCode}.view.email`).d('邮箱'),
          type: FieldType.string,
          bind: 'companyObj.email',
          ignore: FieldIgnore.always,
        },
        {
          name: 'taxpayerNumber',
          label: intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号'),
          type: FieldType.string,
          bind: 'companyObj.taxpayerNumber',
        },
        {
          name: 'redInvoiceDateFrom',
          label: intl.get(`${modelCode}.view.redInvoiceDateFrom`).d('填开时间从'),
          type: FieldType.dateTime,
          max: 'redInvoiceDateTo',
          // defaultValue: yesterdayStart,
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'redInvoiceDateTo',
          label: intl.get(`${modelCode}.view.redInvoiceDateTo`).d('填开时间至'),
          type: FieldType.dateTime,
          min: 'redInvoiceDateFrom',
          // defaultValue: moment().format(DEFAULT_DATETIME_FORMAT),
          transformRequest: (value) => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
        },
        {
          name: 'taxDiskNumberObj',
          label: intl.get(`${modelCode}.view.taxDiskNumber`).d('金税盘编号'),
          type: FieldType.object,
          lovCode: 'HIOP.TAX_DISK_NUMBER',
          computedProps: {
            lovPara: ({ record }) => {
              return { companyId: record.get('companyId') };
            },
          },
          ignore: FieldIgnore.always,
          required: true,
        },
        {
          name: 'taxDiskNumber',
          label: intl.get(`${modelCode}.view.taxDiskNumber`).d('金税盘编号'),
          type: FieldType.string,
          bind: 'taxDiskNumberObj.taxDiskNumber',
        },
        {
          name: 'extensionNumber',
          label: intl.get(`${modelCode}.view.extensionNumber`).d('分机号'),
          type: FieldType.string,
          bind: 'taxDiskNumberObj.extNumber',
          readOnly: true,
          required: true,
        },
        {
          name: 'invoiceType',
          label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
          defaultValue: 0,
          required: true,
        },
        {
          name: 'invoiceTypeCode',
          label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
          bind: 'invoiceType',
          required: true,
        },
        {
          name: 'overdueStatus',
          label: intl.get(`${modelCode}.view.overdueStatus`).d('逾期状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.LATE_STATUS',
          defaultValue: 'N',
          required: true,
        },
        {
          name: 'businessNoticeNum',
          label: intl.get(`${modelCode}.view.businessNoticeNum`).d('业务通知流水号'),
          type: FieldType.string,
          readOnly: true,
        },
        {
          name: 'resultName',
          label: intl.get(`${modelCode}.view.resultName`).d('税控执行结果'),
          type: FieldType.string,
          lookupCode: 'HIOP.TAX_PERFORM_RESULT',
          readOnly: true,
        },
      ],
    }),
  };
};
