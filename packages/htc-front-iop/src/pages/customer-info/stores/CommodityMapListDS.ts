/**
 * @Description:商品映射
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:15:14
 * @LastEditTime: 2022-06-15 14:02
 * @Copyright: Copyright (c) 2021, Hand
 */
import commonConfig from '@htccommon/config/commonConfig';
import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSetSelection, FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const getTaxRate = (value) => {
  if (value.indexOf('%') > 0) {
    return value.replace('%', '') / 100;
  } else {
    return value;
  }
};

export default (): DataSetProps => {
  const API_PREFIX = commonConfig.IOP_API || '';
  const tenantId = getCurrentOrganizationId();

  return {
    transport: {
      read: (config): AxiosRequestConfig => {
        const { oneselfNumber, projectName, issueName } = config.data;
        let url = `${API_PREFIX}/v1/${tenantId}/goods-mapping-main/goods-by-customer`;
        if (oneselfNumber || projectName || issueName) {
          url = `${API_PREFIX}/v1/${tenantId}/goods-mapping-main`;
        }
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
      destroy: ({ data }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/goods-mappings/batch-remove`,
          data,
          method: 'DELETE',
        };
      },
      submit: ({ data, params }) => {
        return {
          url: `${API_PREFIX}/v1/${tenantId}/goods-mappings/batch-save`,
          data,
          params,
          method: 'POST',
        };
      },
    },
    pageSize: 10,
    selection: DataSetSelection.multiple,
    primaryKey: 'goodsMappingId',
    events: {
      update: ({ record, name, value }) => {
        // 自行编码
        if (name === 'projectObj') {
          record.set({
            taxRateObj: (value && value.taxRate && { taxRate: getTaxRate(value.taxRate) }) || {},
            projectName: value && value.projectName,
            issueName: value && value.projectName,
          });
        }
      },
    },
    fields: [
      {
        name: 'goodsMappingId',
        type: FieldType.number,
      },
      {
        name: 'employeeNum',
        type: FieldType.string,
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
        name: 'customerCode',
        type: FieldType.string,
      },
      {
        name: 'customerName',
        type: FieldType.string,
      },
      {
        name: 'projectObj',
        type: FieldType.object,
        label: intl.get('hiop.customerInfo.modal.projectObj').d('自行编码'),
        lovCode: 'HIOP.GOODS_QUERY',
        cascadeMap: {
          companyId: 'companyId',
          companyCode: 'companyCode',
          customerName: 'customerName',
        },
        lovPara: { queryBySelfCode: true },
        ignore: FieldIgnore.always,
        textField: 'projectNumber',
        required: true,
      },
      {
        name: 'oneselfNumber',
        type: FieldType.string,
        bind: 'projectObj.projectNumber',
        // required: true,
      },
      {
        name: 'projectName',
        label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'abbreviation',
        type: FieldType.string,
        bind: 'projectObj.abbreviation',
      },
      {
        name: 'issueName',
        label: intl.get('hiop.invoiceReq.modal.commodityIssues').d('开具名称'),
        type: FieldType.string,
        required: true,
      },
      {
        name: 'taxRateObj',
        label: intl.get('hiop.invoiceWorkbench.modal.taxRate').d('税率'),
        type: FieldType.object,
        lovCode: 'HIOP.SELECT_TAXRATE',
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxRate',
        type: FieldType.string,
        bind: 'taxRateObj.taxRate',
      },
      {
        name: 'model',
        label: intl.get('hiop.invoiceWorkbench.modal.model').d('规格型号'),
        type: FieldType.string,
        bind: 'projectObj.model',
      },
      {
        name: 'invoiceTypeObj',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.object,
        lovCode: 'HIOP.SELECT_INVOICETYPE',
        lovPara: { tenantId },
        cascadeMap: { companyId: 'companyId' },
        ignore: FieldIgnore.always,
        textField: 'invoiceTypeMeaning',
      },
      {
        name: 'invoiceType',
        label: intl.get('hiop.invoiceWorkbench.modal.invoiceVariety').d('发票种类'),
        type: FieldType.string,
        lookupCode: 'HMDM.INVOICE_TYPE',
        computedProps: {
          readOnly: ({ record }) => {
            if (record.dataSet.parent) {
              return record.dataSet.parent.current.get('invoiceType') ||
                !record.dataSet.parent.current.get('extNumber')
            }
          }
        },
      },
      {
        name: 'invoiceTypeMeaning',
        type: FieldType.string,
        bind: 'invoiceTypeObj.invoiceTypeMeaning',
      },
      {
        name: 'goodsUnit',
        label: intl.get('hiop.invoiceWorkbench.modal.projectUnit').d('单位'),
        type: FieldType.string,
        bind: 'projectObj.projectUnit',
      },
      {
        name: 'goodsUnitPrice',
        label: intl.get('hiop.invoiceWorkbench.modal.price').d('单价'),
        type: FieldType.currency,
        defaultValue: 0,
        min: 0,
        bind: 'projectObj.projectUnitPrice',
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
      fields: [
        {
          name: 'oneselfNumber',
          label: intl.get('hiop.customerInfo.modal.projectObj').d('自行编码'),
          type: FieldType.string,
        },
        {
          name: 'projectName',
          label: intl.get('hiop.invoiceWorkbench.modal.projectNameSuffix').d('项目名称'),
          type: FieldType.string,
        },
        {
          name: 'issueName',
          label: intl.get('hiop.invoiceReq.modal.commodityIssues').d('开具名称'),
          type: FieldType.string,
        },
      ],
    }),
  };
};
