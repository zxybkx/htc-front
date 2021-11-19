/*
 * @Descripttion:全发票明细头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-05 14:07:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, TextField, Select, Currency, NumberField } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={6}>
        <TextField name="machineNo" colSpan={2} />
        <TextField name="checkCode" colSpan={2} />
        <Select name="invoiceType" colSpan={2} />
        {/* --- */}
        <TextField name="invoiceCode" colSpan={2} />
        <TextField name="invoiceNo" colSpan={1} />
        <NumberField
          name="checkCount"
          formatterOptions={{ options: { useGrouping: false } }}
          colSpan={1}
        />
        <TextField name="invoiceDate" colSpan={1} />
        <TextField name="drawer" colSpan={1} />
        {/* --- */}
        <TextField name="salerName" colSpan={2} />
        <TextField name="salerAddressPhone" colSpan={4} />
        {/* --- */}
        <TextField name="salerTaxNo" colSpan={2} />
        <TextField name="salerAccount" colSpan={4} />
        {/* --- */}
        <TextField name="buyerName" colSpan={2} />
        <TextField name="buyerAddressPhone" colSpan={4} />
        {/* --- */}
        <TextField name="buyerTaxNo" colSpan={2} />
        <TextField name="buyerAccount" colSpan={4} />
        {/* --- */}
        <Currency name="invoiceAmount" colSpan={2} />
        <TextField name="taxAmount" colSpan={2} />
        <Currency name="totalAmount" colSpan={2} />
        {/* --- */}
        <Select name="zeroTaxRateFlag" colSpan={1} />
        <Select name="trafficFeeFlag" colSpan={1} />
        <TextField name="payee" colSpan={2} />
        <TextField name="reviewer" colSpan={2} />
        {/* --- */}
        <Select name="cancellationMark" colSpan={2} />
        <TextField name="blueInvoiceCode" colSpan={2} />
        <TextField name="blueInvoiceNo" colSpan={2} />
        {/* --- */}
        <TextField name="remark" colSpan={6} />
      </Form>
    </>
  );
};

export default InvoiceHeaderForm;
