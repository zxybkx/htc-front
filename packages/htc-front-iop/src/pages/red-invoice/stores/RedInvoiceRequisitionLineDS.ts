/*
 * @Descripttion: 专票红字申请单DS
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-12-14 09:10:12
 * @LastEditTime: 2021-03-05 15:50:26
 * @Copyright: Copyright (c) 2020, Hand
 */
import commonConfig from '@common/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType, DataSetSelection, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.redInvoice';

export default (isNew): DataSetProps => {
  // const API_PREFIX = commonConfig.IVP_API || '';
  const HIOP_API = `${commonConfig.IOP_API}`;
  const organizationId = getCurrentOrganizationId();
  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const url = `${HIOP_API}/v1/${organizationId}/red-invoice-requisition-lines/list`;
        const { redInvoiceRequisitionHeaderId } = config.data;
        const axiosConfig: AxiosRequestConfig = {
          ...config,
          url,
          params: {
            redInvoiceRequisitionHeaderId,
          },
          method: 'GET',
        };
        return axiosConfig;
      },
      destroy: (redInvoiceRequisitionLineList) => {
        if (!isNew) {
          return {
            url: `${HIOP_API}/v1/${organizationId}/red-invoice-requisition-lines/batch-remove`,
            redInvoiceRequisitionLineList,
            method: 'DELETE',
          };
        } else {
          return {};
        }
      },
    },
    paging: false,
    selection: DataSetSelection.multiple,
    primaryKey: 'redInvoiceRequisitionLineId',
    fields: [
      {
        name: 'companyId',
        label: intl.get(`${modelCode}.view.companyId`).d('公司ID'),
        type: FieldType.number,
      },
      {
        name: 'companyCode',
        type: FieldType.string,
      },
      {
        name: 'listFlag',
        type: FieldType.number,
      },
      {
        name: 'extNumber',
        label: intl.get(`${modelCode}.view.extNumber`).d('分机号'),
        type: FieldType.string,
      },
      {
        name: 'invoiceType',
        label: intl.get(`${modelCode}.view.invoiceType`).d('发票类型'),
        type: FieldType.string,
      },
      {
        name: 'goodsName',
        label: intl.get(`${modelCode}.view.goodsName`).d('名称'),
        type: FieldType.string,
        required: true,
        computedProps: {
          readOnly: ({ record }) =>
            Number(record.dataSet.parent.current.get('listFlag')) === 1 && record.get('lineNum'),
        },
      },
      {
        name: 'redInvoiceRequisitionLineId',
        type: FieldType.string,
      },
      {
        name: 'redInvoiceRequisitionHeaderId',
        type: FieldType.string,
      },
      {
        name: 'detailNo',
        type: FieldType.number,
      },
      {
        name: 'unit',
        label: intl.get(`${modelCode}.view.unit`).d('单位'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get(`${modelCode}.view.specificationModel`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('单价'),
        type: FieldType.currency,
        step: 0.00000001,
        computedProps: {
          readOnly: ({ record }) =>
            Number(record.dataSet.parent.current.get('listFlag')) === 1 && record.get('lineNum'),
        },
      },
      {
        name: 'detailAmount',
        label: intl.get(`${modelCode}.view.detailAmount`).d('商品金额'),
        type: FieldType.currency,
        required: true,
        // max: 0,
        step: 0.01,
      },
      {
        name: 'num',
        label: intl.get(`${modelCode}.view.num`).d('商品数量'),
        type: FieldType.number,
        max: 0,
        step: 0.00000001,
        computedProps: {
          readOnly: ({ record }) =>
            Number(record.dataSet.parent.current.get('listFlag')) === 1 && record.get('lineNum'),
        },
      },
      {
        name: 'deductionAmount',
        label: intl.get(`${modelCode}.view.deductionAmount`).d('扣除额'),
        type: FieldType.currency,
        step: 0.01,
      },
      {
        name: 'taxRateObj',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.object,
        lovCode: 'HIOP.TAX_TAX_RATE',
        cascadeMap: { companyId: 'companyId' },
        computedProps: {
          lovPara: ({ record }) => {
            const extNumber = record.dataSet.parent.current.get('extensionNumber');
            const invoiceType = record.dataSet.parent.current.get('invoiceTypeCode');
            if (extNumber && invoiceType) {
              return { extNumber, invoiceType };
            }
          },
          required: ({ record }) => record.dataSet.parent.current.get('isMultipleTaxRate') === 'N',
          readOnly: ({ record }) =>
            Number(record.dataSet.parent.current.get('listFlag')) === 1 && record.get('lineNum'),
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
        bind: 'taxRateObj.value',
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('商品税额'),
        type: FieldType.currency,
        required: true,
      },
      {
        name: 'goodsCode',
        label: intl.get(`${modelCode}.view.goodsCode`).d('商品编码'),
        type: FieldType.string,
      },
      {
        name: 'projectObj',
        type: FieldType.object,
        label: intl.get(`${modelCode}.view.projectObj`).d('自行编码'),
        lovCode: 'HIOP.GOODS_QUERY',
        cascadeMap: { companyId: 'companyId', companyCode: 'companyCode' },
        computedProps: {
          lovPara: ({ record }) => {
            const applicantType = record.dataSet.parent.current.get('applicantType');
            const buyerName = record.dataSet.parent.current.get('buyerName');
            const sellerName = record.dataSet.parent.current.get('sellerName');
            if (applicantType) {
              return {
                customerName: applicantType === '01' ? sellerName : buyerName,
                queryBySelfCode: true,
              };
            }
          },
          readOnly: ({ record }) =>
            Number(record.dataSet.parent.current.get('listFlag')) === 1 && record.get('lineNum'),
        },
        ignore: FieldIgnore.always,
        textField: 'projectNumber',
      },
      {
        name: 'selfCode',
        label: intl.get(`${modelCode}.view.selfCode`).d('自行编码'),
        type: FieldType.string,
        bind: 'projectObj.projectNumber',
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
        defaultValue: '0',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
        computedProps: {
          required: ({ record }) => record.get('taxRate') && Number(record.get('taxRate')) === 0,
        },
      },
      {
        name: 'specialManagementVat',
        label: intl.get(`${modelCode}.view.specialManagementVat`).d('增值税特殊管理'),
        type: FieldType.string,
        // bind: 'zeroTaxRateFlag.meaning',
      },
    ],
  };
};
