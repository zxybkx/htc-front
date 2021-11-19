/*
 * @Descripttion:发票行
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 11:54:42
 * @LastEditTime: 2020-07-27 11:48:42
 * @Copyright: Copyright (c) 2020, Hand
 */
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

const modelCode = 'hcan.invoice-detail';

export default (): DataSetProps => {
  return {
    selection: false,
    paging: false,
    fields: [
      {
        name: 'detailNo',
        label: intl.get(`${modelCode}.view.detailNo`).d('明细编号'),
        type: FieldType.string,
      },
      {
        name: 'goodsName',
        label: intl.get(`${modelCode}.view.goodsName`).d('货物名称'),
        type: FieldType.string,
      },
      {
        name: 'detailAmount',
        label: intl.get(`${modelCode}.view.detailAmount`).d('金额'),
        type: FieldType.currency,
      },
      {
        name: 'num',
        label: intl.get(`${modelCode}.view.num`).d('数量'),
        type: FieldType.number,
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
        name: 'taxUnitPrice',
        label: intl.get(`${modelCode}.view.taxUnitPrice`).d('含税单价'),
        type: FieldType.currency,
      },
      {
        name: 'taxDetailAmount',
        label: intl.get(`${modelCode}.view.taxDetailAmount`).d('含税金额'),
        type: FieldType.currency,
      },
      {
        name: 'unitPrice',
        label: intl.get(`${modelCode}.view.unitPrice`).d('不含税单价'),
        type: FieldType.currency,
      },
      {
        name: 'specificationModel',
        label: intl.get(`${modelCode}.view.specificationModel`).d('规格型号'),
        type: FieldType.string,
      },
      {
        name: 'unit',
        label: intl.get(`${modelCode}.view.unit`).d('计量单位'),
        type: FieldType.string,
      },
      {
        name: 'expenseItem',
        label: intl.get(`${modelCode}.view.expenseItem`).d('费用项目'),
        type: FieldType.string,
      },
      {
        name: 'plateNo',
        label: intl.get(`${modelCode}.view.plateNo`).d('车牌号'),
        type: FieldType.string,
      },
      {
        name: 'type',
        label: intl.get(`${modelCode}.view.type`).d('类型'),
        type: FieldType.string,
      },
      {
        name: 'trafficDateStart',
        label: intl.get(`${modelCode}.view.trafficDateStart`).d('同行日期起'),
        type: FieldType.date,
      },
      {
        name: 'trafficDateEnd',
        label: intl.get(`${modelCode}.view.trafficDateEnd`).d('同行日期止'),
        type: FieldType.date,
      },
    ],
  };
};
