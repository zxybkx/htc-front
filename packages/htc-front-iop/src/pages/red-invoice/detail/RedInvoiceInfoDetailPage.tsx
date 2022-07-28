/**
 * @Description: 专票红字信息表列表-详情
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-08-12 17:41:12
 * @LastEditTime: 2022-06-14 14:04
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import { DataSet, Form, Select, Spin, Table, TextField } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { RouteComponentProps } from 'react-router-dom';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import RedInvoiceInfoDetailHeaderDS from '../stores/RedInvoiceInfoDetailHeaderDS';
import RedInvoiceInfoDetailLineDS from '../stores/RedInvoiceInfoDetailLineDS';
import styles from '../redInvoice.module.less';

const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: any;
  headerId: any;
}

interface RedInvoiceRequisitionPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.redInvoiceInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.customerInfo'],
})
export default class RedInvoiceInfoDetailPage extends Component<RedInvoiceRequisitionPageProps> {
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

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
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

  /**
   * 返回公司信息
   * @return {string}
   */
  get renderCompanyDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.companyName || ''}`;
    }
    return '';
  }

  /**
   * 返回员工信息
   * @return {string}
   */
  get renderEmployeeDesc() {
    const { empInfo } = this.state;
    if (empInfo) {
      return `${empInfo.companyCode || ''}-${empInfo.employeeNum || ''}-${empInfo.employeeName ||
        ''}-${empInfo.mobile || ''}`;
    }
    return '';
  }

  /**
   * 自定义查询条
   * @return {ReactNode}
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    const { current } = this.headerDS;
    return (
      <>
        <div className={styles.containTable}>
          <div className={styles.containTable}>
            <h3 className={styles.title}>
              <b>{intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息')}</b>
            </h3>
            {buttons}
          </div>
          <div className={styles.tableTitleRight}>
            <p>
              {intl.get('hiop.invoiceWorkbench.label.totalExcludeTax').d('合计不含税金额：')}
              <span>
                {current?.get('invoiceAmount') && current?.get('invoiceAmount').toFixed(2)}
              </span>
            </p>
            <p>
              {intl.get('hiop.invoiceWorkbench.label.totalTax').d('合计税额：')}
              <span>{current?.get('taxAmount') && current?.get('taxAmount').toFixed(2)}</span>
            </p>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { empInfo } = this.state;
    return (
      <>
        <Header
          backPath="/htc-front-iop/red-invoice-info/list"
          title={intl
            .get('hiop.redInvoiceInfo.title.redInvoiceDetail')
            .d('专票红字信息表列表-详情')}
        />
        <Content style={{ background: '#f4f5f7', padding: '0' }}>
          <Spin dataSet={this.headerDS}>
            <Card bordered style={{ marginBottom: '8px' }}>
              <Form columns={4} dataSet={this.headerDS}>
                <TextField
                  label={intl.get('htc.common.label.companyName').d('所属公司')}
                  value={this.renderCompanyDesc}
                />
                <TextField
                  label={intl.get('htc.common.modal.taxpayerNumber').d('纳税人识别号')}
                  value={empInfo && empInfo.taxpayerNumber}
                />
                {/* <Output
                  label={intl.get(`${modelCode}.view.employeeDesc`).d('登录员工')}
                  value={this.renderEmployeeDesc}
                /> */}
                <Select name="taxType" />
                <TextField name="redInvoiceDate" />
                <TextField name="redInfoSerialNumber" />
                <Select name="overdueStatus" />
                <TextField name="infoStatusName" />
                <Select name="multiTaxFlag" />
                <TextField name="requisitionDescription" />
                <TextField name="requisitionReason" />
                <TextField name="goodsVersion" labelWidth={130} />
              </Form>
            </Card>
            <Card bordered style={{ marginBottom: '8px' }}>
              <Form columns={3} dataSet={this.headerDS}>
                <TextField name="taxDiskNumber" />
                <TextField name="extensionNumber" />
                <TextField name="invoiceDate" />
                <Select name="invoiceTypeCode" />
                <TextField name="blueInvoiceCode" />
                <TextField name="blueInvoiceNo" />
              </Form>
              <div style={{ background: '#fff', display: 'flex' }}>
                <div
                  style={{
                    background: 'rgb(0,0,0,0.02)',
                    padding: '16px 16px 0px',
                    marginRight: '8px',
                  }}
                >
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.buyer').d('购买方')}</b>
                  </h3>
                  <Form dataSet={this.headerDS}>
                    <TextField name="buyerName" />
                    <TextField name="buyerTaxNo" />
                  </Form>
                </div>
                <div style={{ background: 'rgb(0,0,0,0.02)', padding: '16px 16px 0px' }}>
                  <h3>
                    <b>{intl.get('hiop.invoiceWorkbench.label.seller').d('销售方')}</b>
                  </h3>
                  <Form dataSet={this.headerDS}>
                    <TextField name="sellerName" />
                    <TextField name="sellerTaxNo" />
                  </Form>
                </div>
              </div>
            </Card>
            <Card bordered>
              <Table
                queryBar={this.renderQueryBar}
                dataSet={this.linesDS}
                columns={this.columns}
                style={{ height: 200 }}
              />
            </Card>
          </Spin>
        </Content>
      </>
    );
  }
}
