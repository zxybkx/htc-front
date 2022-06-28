/**
 * @Description: 全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-09-24 10:06:17
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import LinkGenerationHistoryDS from '../stores/LinkGenerationHistoryDS';

const modelCode = 'hcan.link-generation-history';

interface LinkGenerationHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class LinkGenerationHistoryListPage extends Component<LinkGenerationHistoryListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...LinkGenerationHistoryDS(),
  });

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'overdueStatus' },
      { name: 'linksType' },
      { name: 'linksAccountStart', width: 160 },
      { name: 'linksAccountEnd', width: 160 },
      { name: 'linksCode', width: 200 },
      { name: 'phone', width: 120 },
      { name: 'email', width: 220 },
      { name: 'systemTenantName', width: 160 },
      { name: 'companyName', width: 160 },
      { name: 'creationDate', width: 160 },
      { name: 'createdByName', width: 160 },
      { name: 'failureDate', width: 160 },
      { name: 'customerSubmit' },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('链接生成历史记录')} />
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
