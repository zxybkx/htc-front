/**
 * @Description:全发票明细头
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-05 14:07:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={3}>
        <Output name="machineNo" />
        <Output name="checkCode" />
        <Output name="invoiceType" />
        {/* --- */}
        <Output name="invoiceCode" />
        <Output name="invoiceNo" />
        <Output name="checkCount" formatterOptions={{ options: { useGrouping: false } }} />
        <Output name="invoiceDate" />
        <Output name="drawer" />
        {/* --- */}
        <Output name="salerName" />
        <Output name="salerAddressPhone" />
        {/* --- */}
        <Output name="salerTaxNo" />
        <Output name="salerAccount" />
        {/* --- */}
        <Output name="buyerName" />
        <Output name="buyerAddressPhone" />
        {/* --- */}
        <Output name="buyerTaxNo" />
        <Output name="buyerAccount" />
        {/* --- */}
        <Output name="invoiceAmount" />
        <Output name="taxAmount" />
        <Output name="totalAmount" />
        {/* --- */}
        <Output name="zeroTaxRateFlag" />
        <Output name="trafficFeeFlag" />
        <Output name="payee" />
        <Output name="reviewer" />
        {/* --- */}
        <Output name="cancellationMark" />
        <Output name="blueInvoiceCode" />
        <Output name="blueInvoiceNo" />
        {/* --- */}
        <Output name="remark" />
      </Form>
    </>
  );
};

export default InvoiceHeaderForm;
