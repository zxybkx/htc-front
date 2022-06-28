/**
 * @Description:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-22 11:09:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderTransferForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={3}>
        <Output name="throughAddress" />
        {/* --- */}
        <Output name="carrierName" />
        <Output name="carrierTaxNo" />
        <Output name="transportGoodsInfo" />
        {/* --- */}
        <Output name="draweeName" />
        <Output name="draweeTaxNo" />
        <Output name="taxDiskNumber" />
        {/* --- */}
        <Output name="receiveName" />
        <Output name="receiveTaxNo" />
        <Output name="carNumber" />
        <Output name="vehicleTonnage" />
      </Form>
    </>
  );
};

export default InvoiceHeaderTransferForm;
