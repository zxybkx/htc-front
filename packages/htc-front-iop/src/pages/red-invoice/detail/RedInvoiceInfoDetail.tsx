/**
 * @Description: 专票红字信息表列表-详情
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-12 17:41:12
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Form, Output, TextField, Select, Spin, Currency } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { RouteComponentProps } from 'react-router-dom';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { Card } from 'choerodon-ui';
import RedInvoiceInfoDetailHeaderDS from '../stores/RedInvoiceInfoDetailHeader';
import RedInvoiceInfoDetailLineDS from '../stores/RedInvoiceInfoDetailLine';

const modelCode = 'hiop.redInvoice';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: any;
  headerId: any;
}

interface RedInvoiceRequisitionPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class RedInvoiceRequisitionPage extends Component<RedInvoiceRequisitionPageProps> {
  state = {
    empInfo: undefined as any,
  };

  get isCreatePage() {
    const { match } = this.props;
    const { headerId } = match.params;
    return !headerId;
  }

  linesDS = new DataSet({
    autoQuery: false,
    ...RedInvoiceInfoDetailLineDS(),
  });

  headerDS = new DataSet({
    autoQuery: true,
    ...RedInvoiceInfoDetailHeaderDS(this.props.match.params),
    children: {
      lines: this.linesDS,
    },
  });

  async componentDidMount() {
    const empRes = await getCurrentEmployeeInfo({
      tenantId,
      companyId: this.props.match.params.companyId,
    });
    const empInfo = empRes && empRes.content[0];
    if (empInfo) {
      this.setState({ empInfo });
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'goodsName', width: 200 },
      { name: 'specificationModel' },
      { name: 'unit' },
      { name: 'num' },
      { name: 'unitPrice' },
      { name: 'detailAmount', width: 120 },
      { name: 'taxRate' },
      { name: 'taxAmount' },
      { name: 'goodsCode' },
      { name: 'selfCode' },
      { name: 'preferentialPolicyFlag', width: 110 },
      { name: 'zeroTaxRateFlag', width: 150 },
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
    const { empInfo } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-iop/red-invoice-info/list"
          title={intl.get(`${modelCode}.title`).d('专票红字信息表列表-详情')}
        />
        <Content>
          <Spin dataSet={this.headerDS}>
            <Form columns={3}>
              <Output
                label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
                value={this.renderCompanyDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
                value={this.renderEmployeeDesc}
              />
              <Output
                label={intl.get(`${modelCode}.view.taxpayerNumber`).d('纳税人识别号')}
                value={empInfo && empInfo.taxpayerNumber}
              />
            </Form>
            <Form columns={6} dataSet={this.headerDS}>
              <TextField name="redInfoSerialNumber" />
              <Select name="taxType" />
              <TextField name="redInvoiceDate" />
              <Select name="overdueStatus" />
              <TextField name="infoStatusName" colSpan={2} />
              {/*---*/}
              <TextField name="requisitionDescription" />
              <TextField name="requisitionReason" colSpan={2} />
              <TextField name="goodsVersion" />
              <Select name="multiTaxFlag" />
            </Form>
            <Card bordered style={{ marginBottom: '0.2rem' }}>
              <Form columns={6} dataSet={this.headerDS}>
                <TextField name="taxDiskNumber" />
                <TextField name="extensionNumber" />
                <Select name="invoiceTypeCode" />
                <TextField name="blueInvoiceCode" />
                <TextField name="blueInvoiceNo" />
                <TextField name="invoiceDate" />
                {/*---*/}
                <TextField name="sellerName" newLine colSpan={2} />
                <TextField name="sellerTaxNo" colSpan={2} />
                <Currency name="invoiceAmount" />
                <Currency name="taxAmount" />
                {/*---*/}
                <TextField name="buyerName" newLine colSpan={2} />
                <TextField name="buyerTaxNo" colSpan={2} />
              </Form>
            </Card>
          </Spin>
          <Table dataSet={this.linesDS} columns={this.columns} style={{ height: 200 }} />
        </Content>
      </>
    );
  }
}
