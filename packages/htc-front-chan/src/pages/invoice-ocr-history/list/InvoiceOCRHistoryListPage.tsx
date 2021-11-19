import commonConfig from '@common/config/commonConfig';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Dispatch } from 'redux';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import InvoiceOCRHistoryListDS from '../stores/InvoiceOCRHistoryListDS';

const modelCode = 'hcan.invoice-ocr-history';
const API_PREFIX = commonConfig.CHAN_API || '';

interface InvoiceOCRHistoryListPageProps {
  dispatch: Dispatch<any>;
}

export default class InvoiceOCRHistoryListPage extends Component<InvoiceOCRHistoryListPageProps> {
  tableDS = new DataSet({
    autoQuery: true,
    ...InvoiceOCRHistoryListDS(),
  });

  tenantId = getCurrentOrganizationId();

  @Bind()
  handleGetQueryParams() {
    const queryParams = this.tableDS.queryDataSet!.map((data) => data.toData()) || {};
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? this.tableDS.indexOf(record) + 1 : '';
        },
      },
      { name: 'tenantName', width: 220 },
      { name: 'companyName', width: 210 },
      { name: 'employeeName', width: 130 },
      { name: 'checkChannelCode', width: 130 },
      { name: 'invoiceQuantity', renderer: ({ value }) => <span>{value}</span>, width: 130 },
      { name: 'processStatusCode', width: 100 },
      { name: 'processRemark', width: 160 },
      { name: 'processDateFrom', width: 160 },
      { name: 'processDateTo', width: 160 },
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票OCR历史记录')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/invoice-ocr-historys/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
        </Header>
        <Content>
          <Table queryFieldsLimit={3} dataSet={this.tableDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
