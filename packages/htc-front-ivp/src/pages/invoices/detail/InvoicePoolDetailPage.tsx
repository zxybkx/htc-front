/*
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-09-21 11:14:52
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import InvoiceDetailPage from '@src/utils/invoiceDetailPage/InvoiceDetailPage';

interface RouterInfo {
  invoiceHeaderId: any;
  invoiceType: string;
  entryPoolSource: string;
  companyCode: string;
}
interface InvoicePoolDetailPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
export default class InvoicePoolDetailPage extends Component<InvoicePoolDetailPageProps> {
  render() {
    const { invoiceHeaderId, invoiceType, entryPoolSource, companyCode } = this.props.match.params;
    const state = window.dvaApp._store.getState();
    const { global } = state;
    const { activeTabKey } = global;
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    const backPath =
      subTabKey === 'my-invoice'
        ? '/htc-front-ivp/my-invoice/list'
        : '/htc-front-ivp/invoices/list';
    return (
      <InvoiceDetailPage
        backPath={backPath}
        invoiceHeaderId={invoiceHeaderId}
        invoiceType={invoiceType}
        entryPoolSource={entryPoolSource}
        companyCode={companyCode}
      />
    );
  }
}
