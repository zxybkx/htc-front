/**
 * @page - 查检发票历史记录查询:
 * @Author: jesse.chen <jun.chen01@hand-china.com>
 * @Date: 2020-07-27 14:20:17
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-04 11:40:21
 * @Copyright: Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Button, DataSet, Table, Tooltip } from 'choerodon-ui/pro';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import commonConfig from '@htccommon/config/commonConfig';
import { getInvoiceInfo } from '@src/services/invoiceCheckService';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import InvoiceCheckHistoryListDS from '../stores/InvoiceCheckHistoryListDS';

const modelCode = 'hcan.invoice-histroy';
const API_PREFIX = commonConfig.CHAN_API || '';

interface InvoiceCheckHistoryListPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  tableDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
})
@withProps(
  () => {
    const tableDS = new DataSet({
      autoQuery: true,
      ...InvoiceCheckHistoryListDS(),
    });
    return { tableDS };
  },
  { cacheState: true }
)
export default class InvoiceCheckHistoryListPage extends Component<InvoiceCheckHistoryListPageProps> {
  tenantId = getCurrentOrganizationId();

  /**
   * 跳转发票详情
   * @params {object} record-行记录
   */
  @Bind()
  async handleGoToDetail(record) {
    const invoiceHeaderId = record.get('invoiceHeaderId');
    // const tenantId = record.get('tenantId');
    const { history } = this.props;
    const params = { tenantId: this.tenantId, invoiceHeaderId };
    getInvoiceInfo(params).then((resp) => {
      if (resp) {
        const pathname = `/htc-front-chan/invoice-check-history/detail/${invoiceHeaderId}/${resp.invoiceType}`;
        history.push(pathname);
        // dispatch(
        //   routerRedux.push({
        //     pathname,
        //   })
        // );
      }
    });
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
          return record ? this.props.tableDS.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'tenantName',
        width: 120,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      {
        name: 'companyName',
        width: 200,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'employeeName', width: 120 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
      { name: 'processStatusCode', width: 90 },
      {
        name: 'processRemark',
        width: 200,
        renderer: ({ value }) => {
          return (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          );
        },
      },
      { name: 'taxpayerNumber', width: 180 },
      { name: 'invoiceCode', width: 120 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 120 },
      { name: 'checkCode' },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'checkChannelCode', width: 140 },
      {
        name: 'operation',
        header: intl.get('hzero.common.actionInfo').d('票面信息'),
        width: 130,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="open"
              onClick={() => this.handleGoToDetail(record)}
              disabled={record.get('successFlag') === 0}
            >
              {intl.get('hzero.common.invoiceInfoLink').d('发票详情链接')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 导出条件
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.props.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('查验历史记录查询')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/invoice-check-historys/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.props.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
