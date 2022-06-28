/**
 * @Description: 账单推送历史记录
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-09-13 16:23:22
 * @LastEditTime: 2022-06-21 13:42
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Content } from 'components/Page';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import BillPushHistoryDS from '../stores/BillPushHistoryDS';

const modelCode = 'chan.bill-push-history';

interface BillPushHistoryPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@connect()
@withProps(
  () => {
    const tableDS = new DataSet({
      autoQuery: true,
      ...BillPushHistoryDS(),
    });
    return { tableDS };
  },
  { cacheState: true }
)
export default class BillPushHistoryPage extends Component<BillPushHistoryPageProps> {
  /**
   * 详情跳转
   * @params {string} fileUrl-行的fileUrl
   */
  @Bind()
  handleGotoBillPage(fileUrl) {
    const { history } = this.props;
    const pathname = '/htc-front-chan/bill-push-history/bill-view-page';
    history.push({
      pathname,
      search: queryString.stringify({
        fileUrlInfo: encodeURIComponent(JSON.stringify({ fileUrl })),
      }),
    });
    // dispatch(
    //   routerRedux.push({
    //     pathname,
    //     search: queryString.stringify({
    //       fileUrlInfo: encodeURIComponent(JSON.stringify({ fileUrl })),
    //     }),
    //   })
    // );
  }

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
          return record ? record.index + 1 : '';
        },
      },
      {
        name: 'billNumber',
        width: 200,
        renderer: ({ record, value }) => {
          if (record) {
            if (record.get('fileUrl')) {
              return <a onClick={() => this.handleGotoBillPage(record.get('fileUrl'))}>{value}</a>;
            } else {
              return value;
            }
          }
        },
      },
      { name: 'tenantName' },
      { name: 'companyName', width: 250 },
      { name: 'billType' },
      { name: 'billCreateTime', width: 150 },
      { name: 'receiver' },
      { name: 'email', width: 220 },
      { name: 'creationDate', width: 150 },
    ];
  }

  render() {
    return (
      <PageHeaderWrapper title={intl.get(`${modelCode}.title`).d('账单推送历史记录')}>
        <Content>
          <Table dataSet={this.props.tableDS} columns={this.columns} />
        </Content>
      </PageHeaderWrapper>
    );
  }
}
