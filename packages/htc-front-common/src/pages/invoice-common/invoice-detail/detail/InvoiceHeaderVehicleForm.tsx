/**
 * @Description:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-05 14:14:31
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceHeaderVehicleForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={3}>
        <Output name="idNo" />
        {/* --- */}
        <Output name="produceArea" />
        <Output name="qualifiedNo" />
        <Output name="commodityInspectionNo" />
        {/* --- */}
        <Output name="engineNo" />
        <Output name="vehicleIdentificationNo" />
        <Output name="taxPaymentCertificateNo" />
        <Output name="taxAuthorityCode" />
        {/* --- */}
        <Output name="limitedPeopleCount" />
        <Output name="taxAuthorityName" />
        <Output name="certificateOfImport" />
        <Output name="taxRate" />
        {/* --- */}
        <Output name="tonnage" />
        <Output name="salerPhone" />
        <Output name="salerAddress" />
        {/* --- */}
        <Output name="salerBankName" />
        <Output name="salerBankAccount" />
        {/* --- */}
        <Output name="licensePlate" />
        <Output name="registrationNo" />
        <Output name="carPrice" />
        {/* --- */}
        <Output name="transferredVehicleOffice" />
        <Output name="buyerUnitOrIndividual" />
        <Output name="buyerUnitCodeOrIdNo" />
        {/* --- */}
        <Output name="buyerPhone" />
        <Output name="buyerUnitOrIndividualAddress" />
        <Output name="sellerUnitOrIndividual" />
        {/* --- */}
        <Output name="sellerPhone" />
        <Output name="sellerUnitOrIndividualAddress" />
        <Output name="sellerUnitCodeOrIdNo" />
        {/* --- */}
        <Output name="businessUnitPhone" rowSpan={2} />
        <Output name="businessUnitAddress" />
        <Output name="businessUnit" />
        <Output name="businessUnitTaxNo" />
        <Output name="businessUnitBankAndAccount" />
        {/* --- */}
        <Output name="lemonMarket" />
        <Output name="lemonMarketTaxNo" />
        <Output name="lemonMarketPhone" />
        {/* --- */}
        <Output name="lemonMarketAddress" />
        <Output name="lemonMarketBankAndAccount" />
      </Form>
    </>
  );
};

export default InvoiceHeaderVehicleForm;
