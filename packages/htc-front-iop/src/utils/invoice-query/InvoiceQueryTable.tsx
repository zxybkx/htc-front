/**
 * @Description:开票订单查询
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 16:22:22
 * @LastEditTime: 2022-06-15 14:50:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Button, DataSet, Form, Table, TextField } from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind } from 'lodash-decorators';
import InvoiceQueryListDS from './stores/InvoiceQueryListDS';

interface InvoiceQueryTableProps {
  invoiceType: string; // 发票种类
  enterpriseName: string; // 企业名称
  sourceRecord: any; // 来源行
  sourceField: string; // 来源字段
  onCloseModal: any; // 关闭modal
  companyCode: string;
  employeeNum: string;
}

@formatterCollections({
  code: [
    'hiop.invoiceQuery',
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.redInvoiceInfo',
    'hiop.invoiceReq',
  ],
})
export default class InvoiceQueryTable extends Component<InvoiceQueryTableProps> {
  invoiceQueryListDS = new DataSet({
    autoQuery: false,
    ...InvoiceQueryListDS(this.props),
  });

  componentDidMount() {
    const { enterpriseName } = this.props;
    const { queryDataSet } = this.invoiceQueryListDS;
    if (queryDataSet) {
      if (!queryDataSet.current) {
        queryDataSet.create();
      }
      if (enterpriseName) {
        queryDataSet.current!.set({ taxpayerRetrievedName: enterpriseName });
        this.invoiceQueryListDS.query();
      }
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'taxpayerName' },
      { name: 'taxpayerNumber' },
      { name: 'depositBankName' },
      { name: 'bankAccount' },
      { name: 'phoneNumber' },
      { name: 'address' },
      { name: 'taxpayerRiskLevel' },
    ];
  }

  @Bind()
  handleQuery() {
    this.invoiceQueryListDS.query();
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, queryFieldsLimit } = props;
    if (queryDataSet) {
      return (
        <>
          <Row type="flex" justify="space-between" align="middle">
            <Col span={18}>
              <Form columns={queryFieldsLimit} dataSet={queryDataSet}>
                <TextField name="taxpayerRetrievedName" colSpan={2} />
              </Form>
            </Col>
            <Col span={6} style={{ textAlign: 'end' }}>
              <Button color={ButtonColor.primary} onClick={this.handleQuery}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  @Bind()
  handleRow(record) {
    const { sourceRecord, sourceField } = this.props;
    return {
      onDoubleClick: () => {
        const {
          address,
          bankAccount,
          depositBankName,
          phoneNumber,
          taxpayerName,
          taxpayerNumber,
          // taxpayerRiskLevel,
        } = record.toData();
        sourceRecord.set(sourceField, {
          enterpriseName: taxpayerName,
          taxpayerNumber,
          businessAddressPhone: `${address || ''}${phoneNumber || ''}`,
          corporateBankAccount: `${depositBankName || ''}${bankAccount || ''}`,
        });

        if (sourceField === 'receiptObj' && 'fullElectricOpeanBank' in sourceRecord.data) {
          sourceRecord.set('fullElectricOpeanBank', depositBankName);
          sourceRecord.set('fullElectricBankAccount', bankAccount);
          sourceRecord.set('fullElectricAddress', address);
          sourceRecord.set('fullElectricPhone', phoneNumber);
        } else if (sourceField === 'buyerObj') {
          sourceRecord.set('buyerOpeanBank', depositBankName);
          sourceRecord.set('buyerBankAccount', bankAccount);
          sourceRecord.set('buyerAddress', address);
          sourceRecord.set('buyerPhone', phoneNumber);
        } else {
          sourceRecord.set('sellerOpeanBank', depositBankName);
          sourceRecord.set('sellerBankAccount', bankAccount);
          sourceRecord.set('sellerAddress', address);
          sourceRecord.set('sellerPhone', phoneNumber);
        }
        this.props.onCloseModal();
      },
    };
  }

  render() {
    return (
      <Table
        dataSet={this.invoiceQueryListDS}
        columns={this.columns}
        queryBar={this.renderQueryBar}
        selectionMode={SelectionMode.click}
        queryFieldsLimit={3}
        onRow={({ record }) => this.handleRow(record)}
      />
    );
  }
}
