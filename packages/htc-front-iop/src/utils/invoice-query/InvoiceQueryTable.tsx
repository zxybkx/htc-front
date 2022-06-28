/**
 * @Description:开票订单查询
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-14 16:22:22
 * @LastEditTime: 2022-06-15 14:50:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Button, CheckBox, DataSet, Form, Table, TextField } from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind } from 'lodash-decorators';
import { concat } from 'lodash';
// import { enterpriseInfo } from '@src/services/invoiceOrderService';
// import notification from 'utils/notification';
import InvoiceQueryListDS from './stores/InvoiceQueryListDS';

interface InvoiceQueryTableProps {
  invoiceType: string; // 发票种类
  enterpriseName: string; // 企业名称
  sourceRecord: any; // 来源行
  sourceField: string; // 来源字段
  onCloseModal: any; // 关闭modal
  // 查询条件
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
  state = { isQueryAll: false };

  invoiceQueryListDS = new DataSet({
    autoQuery: false,
    ...InvoiceQueryListDS(this.props),
  });

  componentDidMount() {
    const { invoiceType, enterpriseName } = this.props;
    const { queryDataSet } = this.invoiceQueryListDS;
    if (queryDataSet) {
      if (!queryDataSet.current) {
        queryDataSet.create();
      }
      if (['0', '52'].includes(invoiceType)) {
        queryDataSet.getField('isQueryAll')!.set('defaultValue', 'Y');
        queryDataSet.current!.set({ isQueryAll: 'Y' });
        this.setState({ isQueryAll: true });
      }
      if (enterpriseName) {
        queryDataSet.current!.set({ enterpriseName });
        this.invoiceQueryListDS.query();
      }
    }
  }

  get columns(): ColumnProps[] {
    const { isQueryAll } = this.state;
    const initialColumns = [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'enterpriseName' },
      { name: 'taxpayerNumber' },
    ];
    const otherColumns = [{ name: 'businessAddressPhone' }, { name: 'corporateBankAccount' }];
    const finalColumns: any = isQueryAll ? concat(initialColumns, otherColumns) : initialColumns;
    return finalColumns;
  }

  @Bind()
  handleQuery() {
    this.invoiceQueryListDS.query();
    this.setState({
      isQueryAll: this.invoiceQueryListDS.queryDataSet!.current!.get('isQueryAll') === 'Y',
    });
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
                <TextField name="enterpriseName" colSpan={2} />
                <CheckBox name="isQueryAll" />
              </Form>
            </Col>
            <Col span={6} style={{ textAlign: 'end' }}>
              <Button color={ButtonColor.primary} onClick={this.handleQuery}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button color={ButtonColor.primary} onClick={this.chooseCompany}>
                {intl.get('hzero.common.button.select').d('选择')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  @Bind()
  chooseCompany() {
    const { sourceRecord, sourceField } = this.props;
    const lists = this.invoiceQueryListDS.selected.map((rec) => rec.toData());
    sourceRecord.set(sourceField, lists[0]);
    this.props.onCloseModal();
  }

  @Bind()
  handleRow(record) {
    const { sourceRecord, sourceField } = this.props;
    return {
      onDoubleClick: () => {
        sourceRecord.set(sourceField, record.toData());
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
