/**
 * @Description:接口单据详细信息
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2021-03-05 15:13:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Button, DataSet, Form, Output, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import formatterCollections from 'utils/intl/formatterCollections';
import InterfaceDocDS, { SystemDS } from '../stores/InterfaceDocDS';
import styles from '../table.less';

const modelCode = 'hivp.documentType';

interface InterfaceDocPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    modelCode,
    'htc.common',
    'hiop.redInvoiceInfo',
    'hivp.invoicesArchiveUpload',
    'hivp.checkCertification',
    'hiop.invoiceWorkbench',
  ],
})
export default class InterfaceDocPage extends Component<InterfaceDocPageProps> {
  tableDS = new DataSet({
    autoQuery: false,
    ...InterfaceDocDS(),
  });

  systemDS = new DataSet({
    autoQuery: false,
    ...SystemDS(),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const linesInfoStr = new URLSearchParams(search).get('linesInfo');
    if (linesInfoStr) {
      const linesInfo = JSON.parse(decodeURIComponent(linesInfoStr));
      this.systemDS.getField('systemCode')!.set('defaultValue', linesInfo && linesInfo.systemCode);
      this.systemDS.getField('systemName')!.set('defaultValue', linesInfo && linesInfo.systemName);
      this.systemDS
        .getField('documentTypeCode')!
        .set('defaultValue', linesInfo && linesInfo.documentTypeCode);
      this.systemDS
        .getField('documentTypeMeaning')!
        .set('defaultValue', linesInfo && linesInfo.documentTypeMeaning);
      this.systemDS.create();
      this.tableDS.setQueryParameter('docTypeLineId', linesInfo.docTypeLineId);
      this.tableDS.query();
    }
  }

  @Bind()
  handleEdit(record) {
    record.setState('editing', true);
  }

  @Bind()
  handleCancel(record) {
    if (record.status === 'add') {
      this.tableDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  @Bind()
  async handleSave(record) {
    const res = await this.tableDS.submit();
    if (res && res.content) record.setState('editing', false);
  }

  @Bind()
  commands(record) {
    const btns: any = [];
    const relationStateCode = record.get('relationStateCode');
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSave(record)}>
          {intl.get('hzero.common.btn.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        relationStateCode === '1' ? (
          <span>-</span>
        ) : (
          <a onClick={() => this.handleEdit(record)}>
            {intl.get('hzero.common.button.rule.edit').d('编辑')}
          </a>
        )
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'companyObj',
        width: 200,
        editor: record => record.getState('editing'),
      },
      { name: 'documentNumber', width: 150, editor: record => record?.getState('editing') },
      {
        name: 'documentSourceId',
        width: 120,
        editor: record => record.getState('editing'),
      },
      { name: 'documentSourceKey', editor: record => record?.getState('editing') },
      {
        name: 'documentRemark',
        width: 300,
        editor: record => record?.getState('editing'),
      },
      { name: 'relationStateCode' },
      { name: 'relationInvoiceQuantity' },
      { name: 'sourceTypeCode' },
      { name: 'recordCreateDate', width: 150 },
      { name: 'recordUpdateDate', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        renderer: ({ record }) => this.commands(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  handleAdd() {
    const { search } = this.props.location;
    const linesInfoStr = new URLSearchParams(search).get('linesInfo');
    if (linesInfoStr) {
      const linesInfo = JSON.parse(decodeURIComponent(linesInfoStr));
      const { docTypeHeaderId, docTypeLineId } = linesInfo;
      const record = this.tableDS.create(
        {
          docTypeHeaderId,
          docTypeLineId,
        },
        0
      );
      record.setState('editing', true);
    }
  }

  get buttons(): Buttons[] {
    return [
      <Button icon="playlist_add" key="add" onClick={() => this.handleAdd()}>
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.button.itfDoc`).d('接口单据明细')}
          backPath="/htc-front-ivp/document-type/list"
        />
        <div className={styles.docHeader}>
          <Form dataSet={this.systemDS} columns={4}>
            <Output name="systemCode" />
            <Output name="systemName" />
            <Output name="documentTypeCode" />
            <Output name="documentTypeMeaning" />
          </Form>
        </div>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={3}
            style={{ height: 330 }}
          />
        </Content>
      </>
    );
  }
}
