/*
 * @Description:
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2021-08-26 11:07:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { DataSet, Form, TextField, Select, CheckBox, Lov, NumberField } from 'choerodon-ui/pro';

interface Props {
  dataSet: DataSet;
}
const InvoiceRuleHeaderForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  return (
    <>
      <Form dataSet={dataSet} columns={4} labelTooltip={Tooltip.overflow}>
        <Select name="codeTableVersions" />
        <Select name="productType" />
        <Select name="invoiceStyleCode" />
        <CheckBox name="purchaseInvoiceFlag" />
        {/*---*/}
        <Lov name="defaultInvoiceTypeObj" />
        <Select name="limitInvoiceCode" />
        <Lov name="defaultPayeeObj" />
        <CheckBox name="drawerPayeeFlag" />
        {/*---*/}
        <Select name="drawerRulesCode" />
        <Lov name="globalDrawerObj" />
        <Lov name="defaultReviewerObj" />
        <Select name="invoicePrintMethod" />
        {/*---*/}
        <Select name="invoiceCompletionNotice" colSpan={2} />
        <Select name="invoiceExceptionNotice" colSpan={2} />
        {/*---*/}
        <Select name="autoApprovalRules" colSpan={2} />
        <Select name="businessFieldSplits" colSpan={2} />
        {/*---*/}
        <CheckBox name="invoiceWorkbenchFlag" newLine />
        <Lov name="invoiceWorkbenchListObj" colSpan={3} />
        <CheckBox name="invoiceApplyFlag" />
        <Lov name="invoiceRequestListObj" colSpan={3} />
        {/*---*/}
        <CheckBox name="distributionInvoiceFlag" />
        <NumberField
          name="inventoryRemindLimit"
          formatterOptions={{ options: { useGrouping: false } }}
        />
        <TextField name="inventoryRemindEmail" />
        <TextField name="inventoryRemindPhone" />
        {/*---*/}
        <CheckBox name="enableRulesFlag" />
        <CheckBox name="applyCodePriceFlag" />
        <CheckBox name="mergeFlag" />
        <CheckBox name="distinguishReviewerFlag" />
        {/*---*/}
        <TextField name="dynamicPrefixOne" newLine />
        <CheckBox name="enableApplyOneFlag" />
        <TextField name="dynamicPrefixThree" />
        <CheckBox name="enableApplyThreeFlag" />
        {/*---*/}
        <TextField name="dynamicPrefixTwo" />
        <CheckBox name="enableApplyTwoFlag" />
        <TextField name="dynamicPrefixFour" />
        <CheckBox name="enableApplyFourFlag" />
      </Form>
    </>
  );
};

export default InvoiceRuleHeaderForm;
