/*
 * @Descripttion:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-22 11:09:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, TextField } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderTransferForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={6}>
        <TextField name="throughAddress" colSpan={6} />
        {/* --- */}
        <TextField name="carrierName" colSpan={2} />
        <TextField name="carrierTaxNo" colSpan={2} />
        <TextField name="transportGoodsInfo" colSpan={2} />
        {/* --- */}
        <TextField name="draweeName" colSpan={2} />
        <TextField name="draweeTaxNo" colSpan={2} />
        <TextField name="taxDiskNumber" colSpan={2} />
        {/* --- */}
        <TextField name="receiveName" colSpan={2} />
        <TextField name="receiveTaxNo" colSpan={2} />
        <TextField name="carNumber" colSpan={1} />
        <TextField name="vehicleTonnage" colSpan={1} />
      </Form>
    </>
  );
};

export default InvoiceHeaderTransferForm;
