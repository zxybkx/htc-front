import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Table, Form, Output } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import InvoiceHistoryDS from '../stores/InvoiceHistoryDS';

const modelCode = 'hivp.invoices.invoiceHistory';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface InvoiceHistoryPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
export default class InvoiceHistoryPage extends Component<InvoiceHistoryPageProps> {
  state = { companyDesc: '', backPath: '' };

  tableDS = new DataSet({
    autoQuery: true,
    ...InvoiceHistoryDS(this.props.match.params),
  });

  invoiceDS = new DataSet({
    autoQuery: false,
    ...SubPageInvoicesHeadersDS({
      invoicePoolHeaderId: this.props.match.params.sourceHeaderId,
    }),
  });

  async componentDidMount() {
    if (this.props.match.params.sourceCode === 'BILL_POOL') {
      this.invoiceDS = new DataSet({
        autoQuery: false,
        ...SubPageBillHeadersDS({
          billPoolHeaderId: this.props.match.params.sourceHeaderId,
        }),
      });
    }
    await this.invoiceDS.query();

    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId: invoiceInfo.companyId });
      if (empRes && empRes.content) {
        const curEmp = empRes.content[0];
        this.setState({
          companyDesc: `${curEmp.companyCode}-${curEmp.companyName}`,
          backPath: invoiceInfo.backPath,
        });
      }
    }
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
      {
        name: 'incidentType',
        width: 300,
        renderer: ({ record }) => (
          <div>
            {record && record.get('incidentType')}-{record && record.get('incidentTypeMeaning')}
          </div>
        ),
      },
      {
        name: 'incidentFrom',
        width: 300,
        renderer: ({ record }) => (
          <div>
            {record && record.get('incidentFrom')}-{record && record.get('incidentFromMeaning')}
          </div>
        ),
      },
      { name: 'incidentDetail', width: 450 },
      { name: 'incidentDate' },
    ];
  }

  render() {
    const { sourceCode } = this.props.match.params;
    const { companyDesc, backPath } = this.state;
    return (
      <>
        <Header backPath={backPath} title={intl.get(`${modelCode}.title`).d('历史记录')} />
        <Content>
          <Form dataSet={this.invoiceDS} columns={3}>
            <Output
              value={companyDesc}
              label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
            />
            <Output
              value={moment().format(DEFAULT_DATE_FORMAT)}
              label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
            />
            {/* <Output name="invoiceType" newLine />
            <Output name="inOutType" /> */}
            {sourceCode === 'BILL_POOL' ? (
              <Output name="billType" newLine />
            ) : (
              <Output name="invoiceType" newLine />
            )}
            {sourceCode === 'BILL_POOL' ? '' : <Output name="inOutType" />}
            <Output name="invoiceDate" />
            <Output name="buyerName" newLine />
            <Output name="invoiceCode" />
            <Output name="invoiceNo" />
            <Output name="salerName" />
            <Output name="invoiceAmount" />
            <Output name="totalAmount" />
          </Form>
          <Table
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={4}
            style={{ height: 300 }}
          />
        </Content>
      </>
    );
  }
}
