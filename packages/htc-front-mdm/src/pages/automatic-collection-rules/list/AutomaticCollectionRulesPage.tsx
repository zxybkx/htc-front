/**
 * @page:自动催收规则维护页面
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-02-18 14:03
 * @LastEditTime: 2022-06-20 15:10
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import AutomaticCollectionHeaderDS from '../stores/AutomaticCollectionHeaderDS';
import AutomaticCollectionLinesDS from '../stores/AutomaticCollectionLinesDS';

interface AutomaticCollectionRulesPageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hmdm.automaticCollection', 'htc.common', 'hiop.invoiceWorkbench', 'hiop.invoiceRule'],
})
export default class AutomaticCollectionRulesPage extends Component<
  AutomaticCollectionRulesPageProps
> {
  rulesLineDS = new DataSet({
    ...AutomaticCollectionLinesDS(),
  });

  rulesHeaderDS = new DataSet({
    autoQuery: true,
    ...AutomaticCollectionHeaderDS(),
    children: {
      lines: this.rulesLineDS,
    },
  });

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    return [TableButtonType.add, TableButtonType.save];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'tenantId' },
      { name: 'tenantObject', editor: true },
      { name: 'ruleScope', editor: true },
      { name: 'sendType', editor: true },
      { name: 'remind', editor: true },
      { name: 'persons', editor: true },
      { name: 'personPhone', editor: true },
      { name: 'personEmail', width: 240, editor: true },
      { name: 'flag', editor: true },
    ];
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get lineButtons(): Buttons[] {
    return [TableButtonType.save];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get linesColumns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 80,
        renderer: ({ record }) => {
          return record ? this.rulesLineDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'expensesTypeObject', width: 180 },
      { name: 'expensesTypeMeaning', width: 150 },
      { name: 'solutionPackage', width: 150 },
      { name: 'solutionPackageNumber' },
      { name: 'unitPrice' },
      { name: 'billingCode' },
      { name: 'annualFee' },
      { name: 'excessUnitPrice' },
      { name: 'customerBillingModelCodeMeaning', width: 130 },
      { name: 'billingStartDate', width: 150 },
      { name: 'billingEndDate', width: 150 },
      { name: 'daysRemind', editor: true },
      { name: 'onceRemind', editor: true },
      { name: 'daysSend', editor: true },
      { name: 'onceSend', editor: true },
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl
            .get(`hmdm.automaticCollection.title.automaticCollectionRuleMaintenance`)
            .d('自动催收规则维护')}
        />
        <Content>
          <Table
            queryFieldsLimit={3}
            dataSet={this.rulesHeaderDS}
            columns={this.columns}
            buttons={this.buttons}
          />
          <Table
            dataSet={this.rulesLineDS}
            columns={this.linesColumns}
            buttons={this.lineButtons}
            style={{ marginTop: 20 }}
          />
        </Content>
      </>
    );
  }
}
