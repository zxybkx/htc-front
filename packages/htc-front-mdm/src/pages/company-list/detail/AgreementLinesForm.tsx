/*
 * @Descripttion:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-03-04 11:10:47
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { DataSet, Form, Output, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import { isNullOrUndefined } from 'util';
import AgreementCompanyLinesDS from '../stores/AgreementCompanyLinesDS';
import AgreementClauseLinesDS from '../stores/AgreementClauseLinesDS';

const modelCode = 'hmdm.agreement-clause';

interface Props {
  agreementParams: any;
}
const AgreementLinesForm: FunctionComponent<Props> = (props: Props) => {
  const { agreementParams } = props;
  // 公司
  const companyDS = new DataSet({
    autoQuery: !isNullOrUndefined(agreementParams.agreementId),
    ...AgreementCompanyLinesDS(agreementParams),
  });
  // 协议条款
  const clauseDS = new DataSet({
    autoQuery: !isNullOrUndefined(agreementParams.agreementId),
    ...AgreementClauseLinesDS(agreementParams),
  });

  /**
   * [协议条款]列信息列
   */
  const clauseColumns: ColumnProps[] = [
    {
      name: 'orderSeq',
      header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
      width: 80,
      renderer: ({ record }) => {
        return record ? clauseDS.indexOf(record) + 1 : '';
      },
    },
    { name: 'expensesTypeCode', width: 170 },
    { name: 'expensesTypeMeaning', width: 170 },
    { name: 'termDescription', width: 200 },
    { name: 'customerBillingModelCode', width: 150 },
    { name: 'billingCode' },
    { name: 'solutionPackageNumber' },
    { name: 'usedQuantity' },
    { name: 'remainingQuantity' },
    { name: 'billingStartDate', width: 160 },
    { name: 'billingEndDate', width: 160 },
    // { name: 'billingPrice', width: 160, align: ColumnAlign.right },
    // { name: 'invoiceMethodCode', width: 200 },
    { name: 'lastUpdateDate' },
  ];
  return (
    <>
      <Form key="AgreementForm" dataSet={companyDS} columns={3}>
        <Output name="companyCode" />
        <Output name="companyName" />
        <Output name="administrator" />
        <Output name="administratorMailbox" />
        <Output name="administratorPhone" />
        <Output name="checkChannelCode" />
        <Output name="inChannelCode" />
        <Output name="outChannelCode" />
        <Output name="authorizationStartDate" />
        <Output name="authorizationTypeCode" />
        <Output name="authorizationCode" />
        <Output name="authorizationEndDate" />
      </Form>
      <Table
        key="AgreementTable"
        dataSet={clauseDS}
        columns={clauseColumns}
        style={{ height: 300 }}
      />
    </>
  );
};

export default AgreementLinesForm;
