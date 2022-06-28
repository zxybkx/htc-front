import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const billFieldConfig = [
  {
    name: 'billType',
    type: FieldType.string,
  },
  {
    name: 'invoiceCode',
    type: FieldType.string,
  },
  {
    name: 'invoiceNo',
    type: FieldType.string,
  },
  {
    name: 'invoiceDate',
    type: FieldType.date,
  },
  {
    name: 'invoiceAmount',
    type: FieldType.currency,
  },
  {
    name: 'taxAmount',
    type: FieldType.currency,
  },
  {
    name: 'totalAmount',
    type: FieldType.currency,
  },
  {
    name: 'aviationDevelopmentFund',
    type: FieldType.currency,
  },
  {
    name: 'fare',
    type: FieldType.currency,
  },
  {
    name: 'fuelSurcharge',
    type: FieldType.currency,
  },
  {
    name: 'otherTaxes',
    type: FieldType.currency,
  },
  {
    name: 'total',
    type: FieldType.currency,
  },
  {
    name: 'checkCode',
    type: FieldType.string,
  },
  {
    name: 'salerName',
    type: FieldType.string,
  },
  {
    name: 'salerTaxNo',
    type: FieldType.string,
  },
  {
    name: 'buyerName',
    type: FieldType.string,
  },
  {
    name: 'buyerTaxNo',
    type: FieldType.string,
  },
  {
    name: 'entrance',
    type: FieldType.string,
  },
  {
    name: 'destination',
    type: FieldType.string,
  },
  {
    name: 'trainAndFlight',
    type: FieldType.string,
  },
  {
    name: 'seatType',
    type: FieldType.string,
  },
];
export default billFieldConfig;
