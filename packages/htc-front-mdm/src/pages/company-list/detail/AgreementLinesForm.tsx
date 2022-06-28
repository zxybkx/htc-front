/**
 * @Description:全发票明细头-机动车发票信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-09-34 17:23:47
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import AgreementCompanyLinesDS from '../stores/AgreementCompanyLinesDS';
import AgreementClauseLinesDS from '../stores/AgreementClauseLinesDS';

const modelCode = 'hmdm.agreement-clause';

interface AgreementLinesProps {
  agreementParams: any;
}

export default class AgreementLinesForm extends Component<AgreementLinesProps> {
  // 公司
  companyDS = new DataSet({
    autoQuery: false,
    ...AgreementCompanyLinesDS(this.props.agreementParams),
  });

  // 协议条款
  clauseDS = new DataSet({
    autoQuery: false,
    ...AgreementClauseLinesDS(this.props.agreementParams),
  });

  componentDidMount() {
    this.companyDS.query();
    this.clauseDS.query();
  }

  /**
   * [协议条款]列信息列
   */
  get clauseColumns(): ColumnProps[] {
    return [
      {
        name: 'orderSeq',
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.clauseDS.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'expensesTypeInfo',
        width: 170,
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'expensesTypeCode',
            title: '',
            renderer: ({ value }) => value || '-',
          },
          {
            name: 'expensesTypeMeaning',
            title: '',
            renderer: ({ value }) => value || '-',
          },
        ],
      },
      {
        name: 'termDescription',
        width: 200,
        renderer: ({ value }) => value || '-',
      },
      {
        name: 'customerBillingModelCode',
        width: 150,
        renderer: ({ value, text }) => (value ? text : '-'),
      },
      {
        name: 'billingCode',
        renderer: ({ value, text }) => (value ? text : '-'),
      },
      {
        name: 'numberInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'solutionPackageNumber',
            renderer: ({ value }) => value || '-',
          },
          {
            name: 'usedQuantity',
            renderer: ({ value }) => value || '-',
          },
          {
            name: 'remainingQuantity',
            renderer: ({ value }) => value || '-',
          },
        ],
      },
      {
        name: 'dateInfo',
        aggregation: true,
        width: 200,
        align: ColumnAlign.left,
        children: [
          {
            name: 'billingStartDate',
            renderer: ({ value, text }) => (value ? text : '-'),
          },
          {
            name: 'billingEndDate',
            renderer: ({ value, text }) => (value ? text : '-'),
          },
        ],
      },
      {
        name: 'lastUpdateDate',
        renderer: ({ value, text }) => (value ? text : '-'),
      },
    ];
  }

  render() {
    return (
      <>
        <Form key="AgreementForm" dataSet={this.companyDS} columns={3}>
          <Output name="companyCode" renderer={({ value }) => value || '-'} />
          <Output name="companyName" renderer={({ value }) => value || '-'} />
          <Output name="administrator" renderer={({ value }) => value || '-'} />
          <Output name="administratorMailbox" renderer={({ value }) => value || '-'} />
          <Output name="administratorPhone" renderer={({ value }) => value || '-'} />
          <Output name="checkChannelCode" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="inChannelCode" renderer={({ value, text }) => (value ? text : '-')} />
          <Output name="outChannelCode" renderer={({ value, text }) => (value ? text : '-')} />
          <Output
            name="authorizationStartDate"
            renderer={({ value, text }) => (value ? text : '-')}
          />
          <Output
            name="authorizationTypeCode"
            renderer={({ value, text }) => (value ? text : '-')}
          />
          <Output name="authorizationCode" renderer={({ value }) => value || '-'} />
          <Output
            name="authorizationEndDate"
            renderer={({ value, text }) => (value ? text : '-')}
          />
        </Form>
        <AggregationTable
          key="AgreementTable"
          aggregation
          dataSet={this.clauseDS}
          columns={this.clauseColumns}
          style={{ height: 330 }}
        />
      </>
    );
  }
}
