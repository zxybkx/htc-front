/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2022-06-20 10:02:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Header } from 'components/Page';
import { Dispatch } from 'redux';
import {
  Currency,
  DataSet,
  DatePicker,
  Form,
  NumberField,
  Output,
  Select,
  Spin,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { openTab } from 'utils/menuTab';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import queryString from 'query-string';
import formatterCollections from 'utils/intl/formatterCollections';
import moment from 'moment';
import { getCurrentOrganizationId } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { OrderLinesDS, ReqHeaderDS } from '../stores/InvoiceReqOrderListDS';

const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  headerId: any;
}

interface InvoiceReqOrderListPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.invoiceWorkbench', 'htc.common', 'hiop.invoiceReq', 'hiop.tobeInvoice'],
})
export default class InvoiceReqOrderListPage extends Component<InvoiceReqOrderListPageProps> {
  state = { empInfo: {} as any };

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

  /**
   * 查询
   */
  handleQuery = () => {
    this.reqHeaderDS.setQueryParameter('headerId', this.props.match.params.headerId);
    this.orderLinesDS.setQueryParameter('headerId', this.props.match.params.headerId);
    this.reqHeaderDS.query().then(res => {
      if (res) {
        getCurrentEmployeeInfo({ tenantId, companyId: res.companyId }).then(empRes => {
          if (empRes && empRes.content) {
            this.setState({ empInfo: empRes.content[0] });
          }
        });
      }
    });
  };

  /**
   * 订单详情
   * @params {object} record-行记录
   */
  handleGotoOrderDetailPage = record => {
    const orderHeaderId = record.get('orderHeaderId');
    const companyId = this.reqHeaderDS.current?.get('companyId');
    openTab({
      key: `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${orderHeaderId}`,
      path: `/htc-front-iop/invoice-workbench/edit/invoiceReq/${companyId}/${orderHeaderId}`,
      title: intl.get('hiop.invoiceWorkbench.title.invoiceOrder').d('开票订单'),
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
  };

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
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

  /**
   * 渲染公司信息
   */
  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  /**
   * 渲染员工信息
   */
  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${empInfo.employeeName ||
        ''}-${empInfo.mobile || ''}`;
    }
    return '';
  }

  render() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    let pathname;
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      pathname = invoiceInfo.backPath;
    }

    return (
      <>
        <Header
          backPath={pathname}
          title={intl.get('hiop.invoiceReq.title.invoiceOrderInfo').d('开票订单信息')}
        />
        <Spin dataSet={this.reqHeaderDS}>
          <Form dataSet={this.reqHeaderDS} columns={5}>
            <Output
              label={intl.get('htc.common.modal.companyName').d('所属公司')}
              required
              value={this.renderCompanyDesc}
              colSpan={2}
            />
            <Output
              label={intl.get('htc.common.modal.employeeDesc').d('登录员工')}
              value={this.renderEmployeeDesc}
              required
              colSpan={2}
            />
            <DatePicker
              value={moment()}
              label={intl.get('hiop.invoiceReq.modal.curDate').d('当前日期')}
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
      </>
    );
  }
}
