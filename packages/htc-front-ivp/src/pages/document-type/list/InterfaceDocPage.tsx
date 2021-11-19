/*
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
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import {
  ColumnAlign,
  ColumnLock,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import InterfaceDocDS from '../stores/InterfaceDocDS';

const modelCode = 'hivp.interface-doc';

interface InterfaceDocPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
}

@connect()
export default class InterfaceDocPage extends Component<InterfaceDocPageProps> {
  tableDS = new DataSet({
    autoQuery: false,
    ...InterfaceDocDS(),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const linesInfoStr = new URLSearchParams(search).get('linesInfo');
    if (linesInfoStr) {
      const linesInfo = JSON.parse(decodeURIComponent(linesInfoStr));
      const { queryDataSet } = this.tableDS;
      if (queryDataSet) {
        queryDataSet.getField('systemCode')!.set('defaultValue', linesInfo && linesInfo.systemCode);
        queryDataSet.getField('systemName')!.set('defaultValue', linesInfo && linesInfo.systemName);
        queryDataSet
          .getField('documentTypeCode')!
          .set('defaultValue', linesInfo && linesInfo.documentTypeCode);
        queryDataSet
          .getField('documentTypeMeaning')!
          .set('defaultValue', linesInfo && linesInfo.documentTypeMeaning);
        queryDataSet.reset();
        queryDataSet.create();
      }
      this.tableDS.setQueryParameter('docTypeLineId', linesInfo.docTypeLineId);
      this.tableDS.query();
    }
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'companyObj',
        width: 300,
        editor: true,
      },
      { name: 'documentNumber', editor: true },
      { name: 'documentSourceId', width: 120, editor: true },
      { name: 'documentSourceKey', editor: true },
      { name: 'documentRemark', width: 300, editor: true },
      { name: 'relationStateCode' },
      { name: 'relationInvoiceQuantity', renderer: ({ value }) => <span>{value}</span> },
      { name: 'sourceTypeCode' },
      { name: 'recordCreateDate', width: 160 },
      { name: 'recordUpdateDate', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          const relationStateCode = record.get('relationStateCode');
          if (relationStateCode === '1') {
            return [<span>-</span>];
          } else {
            return [TableCommandType.edit];
          }
        },
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
      this.tableDS.create(
        {
          docTypeHeaderId,
          docTypeLineId,
        },
        0
      );
    }
  }

  get buttons(): Buttons[] {
    return [
      <Button icon="playlist_add" key="add" onClick={() => this.handleAdd()}>
        {intl.get(`${modelCode}.button.add`).d('新增')}
      </Button>,
    ];
  }

  render() {
    return (
      <>
        <Header
          title={intl.get(`${modelCode}.title`).d('接口单据明细')}
          backPath="/htc-front-ivp/document-type/list"
        />
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={4}
            editMode={TableEditMode.inline}
          />
        </Content>
      </>
    );
  }
}
