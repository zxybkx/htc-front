/*
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-01-15 16:48:12
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import moment from 'moment';

const modelCode = 'hiop.invoice-req';

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${API_PREFIX}/v1/${tenantId}/requisition-headers`;
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
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'headerId',
    fields: [
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
      },
      {
        name: 'employeeId',
        label: intl.get(`${modelCode}.view.employeeId`).d('员工id'),
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        label: intl.get(`${modelCode}.view.employeeNum`).d('员工编码'),
        type: FieldType.string,
      },
      {
        name: 'employeeName',
        label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
        type: FieldType.string,
      },
      {
        name: 'mobile',
        type: FieldType.string,
      },
      {
        name: 'sourceType',
        label: intl.get(`${modelCode}.view.sourceType`).d('来源类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
      },
      {
        name: 'sourceNumber',
        label: intl.get(`${modelCode}.view.sourceNumber`).d('申请来源单号'),
        type: FieldType.string,
      },
      {
        name: 'requestStatus',
        label: intl.get(`${modelCode}.view.requestStatus`).d('申请单状态'),
        type: FieldType.string,
        lookupCode: 'HIOP.APPLY_STATUS',
      },
      {
        name: 'requestNumber',
        label: intl.get(`${modelCode}.view.requestNumber`).d('申请单号'),
        type: FieldType.string,
      },
      {
        name: 'creationDate',
        label: intl.get(`${modelCode}.view.creationDate`).d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'requestType',
        label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
      },
      {
        name: 'billFlag',
        label: intl.get(`${modelCode}.view.billFlag`).d('购货清单标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.PURCHASE_LIST_MARK',
      },
      {
        name: 'buyerName',
        label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
        type: FieldType.string,
      },
      {
        name: 'buyerTaxNo',
        label: intl.get(`${modelCode}.view.buyerTaxNo`).d('购方纳税人识别号'),
        type: FieldType.string,
      },
      {
        name: 'buyerAddressPhone',
        label: intl.get(`${modelCode}.view.buyerAddressPhone`).d('购方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'buyerAccount',
        label: intl.get(`${modelCode}.view.buyerAccount`).d('购方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'buyerType',
        label: intl.get(`${modelCode}.view.buyerType`).d('购方企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
      },
      {
        name: 'totalAmount',
        label: intl.get(`${modelCode}.view.totalAmount`).d('合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalTaxAmount',
        label: intl.get(`${modelCode}.view.totalTaxAmount`).d('合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'totalIssuesAmount',
        label: intl.get(`${modelCode}.view.totalIssuesAmount`).d('开具合计含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'totalIssuesTaxAmount',
        label: intl.get(`${modelCode}.view.totalIssuesTaxAmount`).d('开具合计税额'),
        type: FieldType.currency,
      },
      {
        name: 'orderNums',
        label: intl.get(`${modelCode}.view.orderNums`).d('开票订单信息'),
        type: FieldType.string,
      },
      {
        name: 'invoiceNums',
        label: intl.get(`${modelCode}.view.invoiceNums`).d('发票信息'),
        type: FieldType.string,
      },
      {
        name: 'salerName',
        label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
        type: FieldType.string,
      },
      {
        name: 'salerTaxNo',
        label: intl.get(`${modelCode}.view.salerTaxNo`).d('销方纳税识别号'),
        type: FieldType.string,
      },
      {
        name: 'salerAddressPhone',
        label: intl.get(`${modelCode}.view.salerAddressPhone`).d('销方地址、电话'),
        type: FieldType.string,
      },
      {
        name: 'salerAccount',
        label: intl.get(`${modelCode}.view.salerAccount`).d('销方开户行及账号'),
        type: FieldType.string,
      },
      {
        name: 'salerType',
        label: intl.get(`${modelCode}.view.salerType`).d('销方企业类型'),
        type: FieldType.string,
        lookupCode: 'HIOP.BUSINESS_TYPE',
      },
      {
        name: 'sourceNumber1',
        label: intl.get(`${modelCode}.view.sourceNumber1`).d('申请来源单号1'),
        type: FieldType.string,
      },
      {
        name: 'sourceNumber2',
        label: intl.get(`${modelCode}.view.sourceNumber2`).d('申请来源单号2'),
        type: FieldType.string,
      },
      {
        name: 'electronicType',
        label: intl.get(`${modelCode}.view.electronicType`).d('电票交付方式'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELIVERY_WAY',
      },
      {
        name: 'emailPhone',
        label: intl.get(`${modelCode}.view.emailPhone`).d('手机或邮件交付'),
        type: FieldType.string,
      },
      {
        name: 'paperRecipient',
        label: intl.get(`${modelCode}.view.paperRecipient`).d('纸票收件人'),
        type: FieldType.string,
      },
      {
        name: 'paperPhone',
        label: intl.get(`${modelCode}.view.paperPhone`).d('纸票收件电话'),
        type: FieldType.string,
      },
      {
        name: 'paperAddress',
        label: intl.get(`${modelCode}.view.paperAddress`).d('纸票收件地址'),
        type: FieldType.string,
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
      },
      {
        name: 'reviewerName',
        label: intl.get(`${modelCode}.view.reviewerName`).d('审核人'),
        type: FieldType.string,
      },
      {
        name: 'reviewDate',
        label: intl.get(`${modelCode}.view.reviewDate`).d('审核时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'authEmployees',
        label: intl.get(`${modelCode}.view.authEmployees`).d('数据权限'),
        type: FieldType.string,
      },
      {
        name: 'reservationCode',
        label: intl.get(`${modelCode}.view.reservationCode`).d('预约码'),
        type: FieldType.string,
      },
      {
        name: 'deleteFlag',
        label: intl.get(`${modelCode}.view.deleteFlag`).d('删除标志'),
        type: FieldType.string,
        lookupCode: 'HIOP.DELETE_MARK',
      },
      {
        name: 'progress',
        label: intl.get(`${modelCode}.view.progress`).d('申请进展'),
        type: FieldType.string,
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
          label: intl.get(`${modelCode}.view.companyObj`).d('所属公司'),
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
          // ignore: FieldIgnore.always,
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
          name: 'employeeName',
          label: intl.get(`${modelCode}.view.employeeName`).d('员工姓名'),
          type: FieldType.string,
          bind: 'companyObj.employeeName',
          ignore: FieldIgnore.always,
        },
        {
          name: 'mobile',
          label: intl.get(`${modelCode}.view.mobile`).d('员工手机'),
          type: FieldType.string,
          bind: 'companyObj.mobile',
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
          name: 'companyAddressPhone',
          label: intl.get(`${modelCode}.view.companyAddressPhone`).d('地址、电话'),
          type: FieldType.string,
          bind: 'companyObj.companyAddressPhone',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'bankNumber',
          label: intl.get(`${modelCode}.view.bankNumber`).d('开户行及账号'),
          type: FieldType.string,
          bind: 'companyObj.bankNumber',
          ignore: FieldIgnore.always,
          readOnly: true,
        },
        {
          name: 'requestDateFrom',
          label: intl.get(`${modelCode}.view.requestDateFrom`).d('申请时间从'),
          type: FieldType.dateTime,
          max: 'requestDateTo',
          required: true,
          defaultValue: moment().startOf('day'),
        },
        {
          name: 'requestDateTo',
          label: intl.get(`${modelCode}.view.requestDateTo`).d('申请时间至'),
          type: FieldType.dateTime,
          min: 'requestDateFrom',
          required: true,
          defaultValue: moment().endOf('day'),
        },
        {
          name: 'reviewDateFrom',
          label: intl.get(`${modelCode}.view.reviewDateFrom`).d('审核时间从'),
          type: FieldType.dateTime,
          max: 'reviewDateTo',
        },
        {
          name: 'reviewDateTo',
          label: intl.get(`${modelCode}.view.reviewDateTo`).d('审核时间至'),
          type: FieldType.dateTime,
          min: 'reviewDateFrom',
        },
        {
          name: 'invoiceType',
          label: intl.get(`${modelCode}.view.invoiceType`).d('发票种类'),
          type: FieldType.string,
          lookupCode: 'HMDM.INVOICE_TYPE',
        },
        {
          name: 'sourceType',
          label: intl.get(`${modelCode}.view.sourceType`).d('来源类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.APPLY_SOURCE_TYPE',
        },
        {
          name: 'requestType',
          label: intl.get(`${modelCode}.view.requestType`).d('业务类型'),
          type: FieldType.string,
          lookupCode: 'HIOP.INVOICE_REQUEST_TYPE',
        },
        {
          name: 'requestStatus',
          label: intl.get(`${modelCode}.view.requestStatus`).d('申请单状态'),
          type: FieldType.string,
          lookupCode: 'HIOP.APPLY_STATUS',
        },
        {
          name: 'requestNumber',
          label: intl.get(`${modelCode}.view.requestNumber`).d('申请单号'),
          type: FieldType.string,
        },
        {
          name: 'sourceNumber',
          label: intl.get(`${modelCode}.view.sourceNumber`).d('申请来源单号'),
          type: FieldType.string,
        },
        {
          name: 'buyerName',
          label: intl.get(`${modelCode}.view.buyerName`).d('购方名称'),
          type: FieldType.string,
        },
        {
          name: 'salerName',
          label: intl.get(`${modelCode}.view.salerName`).d('销方名称'),
          type: FieldType.string,
        },
        {
          name: 'deleteFlag',
          label: intl.get(`${modelCode}.view.deleteFlag`).d('显示删除/已合并单据'),
          labelWidth: '130',
          type: FieldType.boolean,
          trueValue: 'Y',
          falseValue: 'N',
          defaultValue: 'N',
        },
        {
          name: 'invoiceCode',
          label: intl.get(`${modelCode}.view.invoiceCode`).d('发票代码'),
          type: FieldType.string,
        },
        {
          name: 'invoiceNo',
          label: intl.get(`${modelCode}.view.invoiceNo`).d('发票号码'),
          type: FieldType.string,
        },
        {
          name: 'billingType',
          label: intl.get(`${modelCode}.view.billingType`).d('开票类型'),
          lookupCode: 'HIOP.INVOICE_TYPE',
          type: FieldType.string,
        },
      ],
    }),
  };
};
