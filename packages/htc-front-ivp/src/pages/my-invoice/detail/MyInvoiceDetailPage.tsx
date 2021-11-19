/*
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2021-01-28 11:43:07
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import BillPoolDetailPage from '@common/pages/invoice-common/bill-detail/detail/BillPoolDetailPage';
import InvoiceDetailPage from '@src/utils/invoiceDetailPage/InvoiceDetailPage';

const invoiceSourceCode = 'INVOICE_POOL';
// const billSourceCode = 'BILL_POOL';

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface InvoicePoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
export default class InvoicePoolDetailPage extends Component<InvoicePoolDetailPageProps> {
  state = { invoiceType: '', invoiceHeaderId: '', entryPoolSource: '', companyCode: '' };

  async componentDidMount() {
    const { sourceCode } = this.props.match.params;
    if (sourceCode === invoiceSourceCode) {
      const { search } = this.props.location;
      const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
      if (invoiceInfoStr) {
        const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
        this.setState({
          invoiceType: invoiceInfo.invoiceType,
          invoiceHeaderId: invoiceInfo.invoiceHeaderId,
          entryPoolSource: invoiceInfo.entryPoolSource,
          companyCode: invoiceInfo.companyCode,
        });
      }
    }
  }

  render() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { invoiceHeaderId, invoiceType, entryPoolSource, companyCode } = this.state;
    return sourceCode === invoiceSourceCode ? (
      <InvoiceDetailPage
        backPath="/htc-front-ivp/my-invoice/list"
        invoiceHeaderId={invoiceHeaderId}
        invoiceType={invoiceType}
        entryPoolSource={entryPoolSource}
        companyCode={companyCode}
      />
    ) : (
      <BillPoolDetailPage
        backPath="/htc-front-ivp/my-invoice/list"
        billPoolHeaderId={sourceHeaderId}
      />
    );
  }
}
