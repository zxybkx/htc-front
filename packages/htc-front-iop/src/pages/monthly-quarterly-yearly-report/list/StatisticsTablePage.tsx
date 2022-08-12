/**
 * @Description: 分月季年统计表
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-08-09 10:40
 * @LastEditTime:
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import StatisticsTableDS from '../stores/StatisticsTableDS';

@formatterCollections({
  code: ['htc.common', 'hiop.taxRateStatistic', 'hiop.invoiceWorkbench'],
})
export default class StatisticsTablePage extends Component {
  statisticsTable = new DataSet({
    autoQuery: false,
    ...StatisticsTableDS(),
  });

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      { name: 'companyCode' },
      {
        name: 'companyName',
        width: 120,
      },
      { name: 'monthlyInvoicingLimit' },
      { name: 'monthlyInvoicedAmount' },
      { name: 'quarterInvoicingLimit' },
      { name: 'quarterInvoicedAmount' },
      { name: 'annualInvoicingLimit' },
      { name: 'annualInvoicedAmount' },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.statisticsTable.title').d('分月季年统计表')} />
        <Content>
          <Table dataSet={this.statisticsTable} columns={this.columns} style={{ height: 400 }} />
        </Content>
      </>
    );
  }
}
