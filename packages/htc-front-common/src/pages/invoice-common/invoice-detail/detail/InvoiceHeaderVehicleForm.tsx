/*
 * @Descripttion:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-05 14:14:31
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, TextField, TextArea, Currency } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderVehicleForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={6}>
        <TextField name="idNo" colSpan={6} />
        {/* --- */}
        <TextField name="produceArea" colSpan={2} />
        <TextField name="qualifiedNo" colSpan={2} />
        <TextField name="commodityInspectionNo" colSpan={2} />
        {/* --- */}
        <TextField name="engineNo" colSpan={1} />
        <TextField name="vehicleIdentificationNo" colSpan={2} />
        <TextField name="taxPaymentCertificateNo" colSpan={2} />
        <TextField name="taxAuthorityCode" colSpan={1} />
        {/* --- */}
        <TextField name="limitedPeopleCount" colSpan={1} />
        <TextField name="taxAuthorityName" colSpan={2} />
        <TextField name="certificateOfImport" colSpan={2} />
        <TextField name="taxRate" colSpan={1} />
        {/* --- */}
        <TextField name="tonnage" colSpan={1} />
        <TextField name="salerPhone" colSpan={2} />
        <TextField name="salerAddress" colSpan={3} />
        {/* --- */}
        <TextField name="salerBankName" colSpan={3} />
        <TextField name="salerBankAccount" colSpan={3} />
        {/* --- */}
        <TextField name="licensePlate" colSpan={2} />
        <TextField name="registrationNo" colSpan={2} />
        <Currency name="carPrice" colSpan={2} />
        {/* --- */}
        <TextField name="transferredVehicleOffice" colSpan={2} />
        <TextField name="buyerUnitOrIndividual" colSpan={2} />
        <TextField name="buyerUnitCodeOrIdNo" colSpan={2} />
        {/* --- */}
        <TextField name="buyerPhone" colSpan={2} />
        <TextField name="buyerUnitOrIndividualAddress" colSpan={2} />
        <TextField name="sellerUnitOrIndividual" colSpan={2} />
        {/* --- */}
        <TextField name="sellerPhone" colSpan={2} />
        <TextField name="sellerUnitOrIndividualAddress" colSpan={2} />
        <TextField name="sellerUnitCodeOrIdNo" colSpan={2} />
        {/* --- */}
        <TextArea name="businessUnitPhone" colSpan={2} rowSpan={2} />
        <TextField name="businessUnitAddress" colSpan={2} />
        <TextField name="businessUnit" colSpan={2} />
        <TextField name="businessUnitTaxNo" colSpan={2} />
        <TextField name="businessUnitBankAndAccount" colSpan={2} />
        {/* --- */}
        <TextField name="lemonMarket" colSpan={2} />
        <TextField name="lemonMarketTaxNo" colSpan={2} />
        <TextField name="lemonMarketPhone" colSpan={2} />
        {/* --- */}
        <TextField name="lemonMarketAddress" colSpan={3} />
        <TextField name="lemonMarketBankAndAccount" colSpan={3} />
      </Form>
    </>
  );
};

export default InvoiceHeaderVehicleForm;
