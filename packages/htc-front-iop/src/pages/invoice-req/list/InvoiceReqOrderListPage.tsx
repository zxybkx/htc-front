/*
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-03-10 17:40:17
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { Dispatch } from 'redux';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {
  DataSet,
  Table,
  Select,
  TextField,
  Form,
  Output,
  DatePicker,
  Spin,
  Currency,
  NumberField,
} from 'choerodon-ui/pro';
import { openTab } from 'utils/menuTab';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import queryString from 'query-string';
import formatterCollections from 'utils/intl/formatterCollections';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { ReqHeaderDS, OrderLinesDS } from '../stores/InvoiceReqOrderListDS';

const modelCode = 'hiop.invoice-req';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  headerId: any;
}

interface InvoiceReqOrderListPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
@connect()
export default class InvoiceReqOrderListPage extends Component<InvoiceReqOrderListPageProps> {
  state = { empInfo: {} as any, backPath: '' };

  orderLinesDS = new DataSet({
    ...OrderLinesDS(),
  });

  reqHeaderDS = new DataSet({
    autoQuery: false,
    ...ReqHeaderDS(),
    children: {
      orderLines: this.orderLinesDS,
    },
  });

  componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    // console.log('invoiceInfoStr', invoiceInfoStr);
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      // console.log('invoiceInfo', invoiceInfo);
      this.setState({
        backPath: invoiceInfo.backPath,
      });
    }
    this.handleQuery();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.headerId &&
      prevProps.match.params.headerId !== this.props.match.params.headerId
    ) {
      this.handleQuery();
    }
  }

  handleQuery = () => {
    this.reqHeaderDS.setQueryParameter('headerId', this.props.match.params.headerId);
    this.orderLinesDS.setQueryParameter('headerId', this.props.match.params.headerId);
    this.reqHeaderDS.query().then((res) => {
      if (res) {
        getCurrentEmployeeInfo({ tenantId, companyId: res.companyId }).then((empRes) => {
          if (empRes && empRes.content) {
            this.setState({ empInfo: empRes.content[0] });
          }
        });
      }
    });
  };

  handleGotoOrderDetailPage = (record) => {
    // const { dispatch } = this.props;
    const orderHeaderId = record.get('orderHeaderId');
    const companyId = this.reqHeaderDS.current?.get('companyId');
    // const { headerId } = this.props.match.params;
    openTab({
      key: `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${orderHeaderId}`,
      path: `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${orderHeaderId}`,
      title: intl.get(`${modelCode}.invoiceReq.order.title`).d('开票订单'),
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: location.pathname,
            backSearch: location.search,
          })
        ),
      }),
      closable: true,
      type: 'menu',
    });
    // dispatch(
    //   routerRedux.push({
    //     pathname: `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${orderHeaderId}`,
    //     search: queryString.stringify({
    //       invoiceInfo: encodeURIComponent(
    //         JSON.stringify({
    //           backPath: location.pathname,
    //           backSearch: location.search,
    //         })
    //       ),
    //     }),
    //   })
    // );
  };

  get columns(): ColumnProps[] {
    return [
      // {
      //   header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
      //   width: 60,
      //   renderer: ({ record, dataSet }) => {
      //     return dataSet && record ? dataSet.indexOf(record) + 1 : '';
      //   },
      //   lock: ColumnLock.left,
      // },
      { name: 'lineNum', lock: ColumnLock.left },
      { name: 'projectName', width: 200, lock: ColumnLock.left },
      { name: 'taxIncludedFlag', width: 130 },
      { name: 'amount', width: 150, align: ColumnAlign.right },
      { name: 'discountAmount', width: 150, align: ColumnAlign.right },
      { name: 'deductionAmount', width: 150, align: ColumnAlign.right },
      { name: 'taxRate', align: ColumnAlign.right },
      { name: 'projectNumber', width: 200 },
      { name: 'specificationModel', width: 150 },
      { name: 'unit' },
      { name: 'quantity', width: 150, renderer: ({ value }) => <span>{value}</span> },
      { name: 'price', width: 150, align: ColumnAlign.right },
      { name: 'sourceNumber3', width: 120 },
      { name: 'sourceNumber4', width: 120 },
      { name: 'orderStatus' },
      { name: 'orderInvoiceCode' },
      { name: 'orderInvoiceNo' },
      { name: 'orderTaxIncludedFlag' },
      { name: 'orderAmount', width: 150, align: ColumnAlign.right },
      { name: 'orderTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'orderDeduction', width: 150, align: ColumnAlign.right },
      { name: 'orderSubmitterName', width: 150 },
      { name: 'orderSubmitDate', width: 160 },
      { name: 'orderLineNature', width: 170 },
      { name: 'orderUnitPrice', width: 150, align: ColumnAlign.right },
      { name: 'orderExtNumber' },
      { name: 'orderRemark', width: 200 },
      { name: 'orderProgress', width: 200 },
      {
        name: 'orderNumber',
        width: 250,
        renderer: ({ record, value }) => (
          <a onClick={() => this.handleGotoOrderDetailPage(record)}>{value}</a>
        ),
        lock: ColumnLock.right,
      },
      { name: 'orderLineNumber', lock: ColumnLock.right },
    ];
  }

  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${
        empInfo.employeeName || ''
      }-${empInfo.mobile || ''}`;
    }
    return '';
  }

  render() {
    const { backPath } = this.state;
    return (
      <PageHeaderWrapper
        headerProps={{ backPath }}
        // headerProps={{ backPath: backPath || '/htc-front-iop/invoice-req/list' }}
        title={intl.get(`${modelCode}.title`).d('开票订单信息')}
      >
        <Spin dataSet={this.reqHeaderDS}>
          <Form dataSet={this.reqHeaderDS} columns={5}>
            <Output
              label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
              required
              value={this.renderCompanyDesc}
              colSpan={2}
            />
            <Output
              label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
              value={this.renderEmployeeDesc}
              required
              colSpan={2}
            />
            <DatePicker
              value={moment()}
              label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
              readOnly
            />
            <Select name="sourceType" />
            <TextField name="requestNumber" />
            <Select name="requestType" />
            <TextField name="sourceNumber" />
            <TextField name="reviewDate" />
            <Currency name="totalAmount" />
            <Currency name="totalTaxAmount" />
            <Select name="requestStatus" />
            <NumberField
              name="totalQuantity"
              formatterOptions={{ options: { useGrouping: false } }}
            />
            <Select name="invoiceType" />
            <TextField name="buyerName" colSpan={2} />
            <TextField name="salerName" colSpan={2} />
            <TextField name="applicantName" />
          </Form>
        </Spin>
        <Table dataSet={this.orderLinesDS} columns={this.columns} style={{ height: 400 }} />
      </PageHeaderWrapper>
    );
  }
}
