/**
 * @Description: 专票红字信息表列表-详情行
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-13 10:25:12
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
// import commonConfig from '@common/config/commonConfig';
// import { AxiosRequestConfig } from 'axios';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { getCurrentOrganizationId } from 'utils/utils';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hiop.redInvoice';

export default (): DataSetProps => {
  // const API_PREFIX = commonConfig.IVP_API || '';
  // const HIOP_API = `${commonConfig.IOP_API}`;
  // const organizationId = getCurrentOrganizationId();
  return {
    // transport: {
    //   read: (config): AxiosRequestConfig => {
    //     const url = `${HIOP_API}/v1/${organizationId}/red-invoice-requisition-lines/list`;
    //     const { redInvoiceRequisitionHeaderId } = config.data;
    //     const axiosConfig: AxiosRequestConfig = {
    //       ...config,
    //       url,
    //       params: {
    //         redInvoiceRequisitionHeaderId,
    //       },
    //       method: 'GET',
    //     };
    //     return axiosConfig;
    //   },
    // },
    paging: false,
    selection: false,
    primaryKey: 'redInvoiceRequisitionLineId',
    fields: [
      {
        name: 'goodsName',
        label: intl.get(`${modelCode}.view.goodsName`).d('货物或应税劳务、服务名称'),
        type: FieldType.string,
      },
      {
        name: 'specificationModel',
        label: intl.get(`${modelCode}.view.specificationModel`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get(`${modelCode}.view.unit`).d('单位'),
        type: FieldType.string,
      },
      {
        name: 'num',
        label: intl.get(`${modelCode}.view.num`).d('数量'),
        type: FieldType.number,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('单价'),
        type: FieldType.currency,
      },
      {
        name: 'detailAmount',
        label: intl.get(`${modelCode}.view.detailAmount`).d('金额（不含税）'),
        type: FieldType.currency,
      },
      {
        name: 'taxRate',
        label: intl.get(`${modelCode}.view.taxRate`).d('税率'),
        type: FieldType.string,
      },
      {
        name: 'taxAmount',
        label: intl.get(`${modelCode}.view.taxAmount`).d('税额'),
        type: FieldType.currency,
      },
      {
        name: 'goodsCode',
        label: intl.get(`${modelCode}.view.goodsCode`).d('商品编码'),
        type: FieldType.string,
      },
      {
        name: 'selfCode',
        label: intl.get(`${modelCode}.view.selfCode`).d('自行编码'),
        type: FieldType.string,
      },
      {
        name: 'preferentialPolicyFlag',
        label: intl.get(`${modelCode}.view.preferentialPolicyFlag`).d('优惠政策标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.PREFERENTIAL_POLICY_MARK',
      },
      {
        name: 'zeroTaxRateFlag',
        label: intl.get(`${modelCode}.view.zeroTaxRateFlag`).d('零税率标识'),
        type: FieldType.string,
        lookupCode: 'HIOP.ZERO_TAX_RATE_MARK',
      },
    ],
  };
};
