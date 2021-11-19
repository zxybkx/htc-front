/**
 * @Description:单据类型维护页面
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2021-03-24 10:05:21
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import querystring from 'querystring';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import {
  TableButtonType,
  TableEditMode,
  ColumnLock,
  ColumnAlign,
  TableCommandType,
} from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import DocumentTypeHeaderDS from '../stores/DocumentTypeHeaderDS';
import DocumentTypeLineDS from '../stores/DocumentTypeLineDS';

const modelCode = 'hivp.document-type';
// const tenantId = getCurrentOrganizationId();

interface DocumentTypePageProps {
  dispatch: Dispatch<any>;
}

@connect()
export default class DocumentTypePage extends Component<DocumentTypePageProps> {
  tableLineDS = new DataSet({
    autoQuery: false,
    ...DocumentTypeLineDS(),
  });

  tableHeaderDS = new DataSet({
    autoQuery: true,
    ...DocumentTypeHeaderDS(),
    children: {
      documentTypeLinesList: this.tableLineDS,
    },
  });

  /**
   * 禁用/启用
   */
  @Bind()
  handleEnabledFlag(sourceFlag, record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1, endDate: '' });
      if (sourceFlag === 'H') this.tableHeaderDS.submit();
      if (sourceFlag === 'L') this.tableLineDS.submit();
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then((button) => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0, endDate: new Date() });
          if (sourceFlag === 'H') this.tableHeaderDS.submit();
          if (sourceFlag === 'L') this.tableLineDS.submit();
        }
      });
    }
  }

  // 接口单据明细
  @Bind()
  handlerGoToInterfaceDoc(record) {
    const headerRec = this.tableHeaderDS.current?.toData();
    const { dispatch } = this.props;
    const pathname = '/htc-front-ivp/document-type/interface-doc';
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          linesInfo: encodeURIComponent(
            JSON.stringify({
              systemCode: headerRec.systemCode,
              systemName: headerRec.systemName,
              documentTypeCode: record.get('documentTypeCode'),
              documentTypeMeaning: record.get('documentTypeMeaning'),
              docTypeLineId: record.get('docTypeLineId'),
              docTypeHeaderId: record.get('docTypeHeaderId'),
            })
          ),
        }),
      })
    );
  }

  /**
   * 单据类型头信息
   */
  get headerColumns(): ColumnProps[] {
    return [
      { name: 'systemCode', editor: true },
      { name: 'systemName', editor: true },
      // { name: 'employeeDescription', width: 300 },
      { name: 'startDate' },
      { name: 'enabledFlag', width: 90, renderer: ({ value }) => enableRender(value) },
      { name: 'endDate' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <Button key="enabled" onClick={() => this.handleEnabledFlag('H', record)}>
              {curFlag === 0
                ? intl.get('hzero.common.status.enableFlag').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 单据类型行信息
   */
  get lineColumns(): ColumnProps[] {
    const editAble = (record) => !record.get('docTypeLineId');
    return [
      { name: 'documentTypeCode', editor: editAble },
      { name: 'documentTypeMeaning', editor: editAble },
      // { name: 'employeeDescription', width: 300 },
      { name: 'salesSourceCode', editor: true, width: 300 },
      { name: 'startDate', width: 160 },
      { name: 'enabledFlag', width: 90, renderer: ({ value }) => enableRender(value) },
      { name: 'endDate', width: 160 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 220,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            TableCommandType.edit,
            <Button key="enabled" onClick={() => this.handleEnabledFlag('L', record)}>
              {curFlag === 0
                ? intl.get('hzero.common.status.enableFlag').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')}
            </Button>,
            <Button key="itfDoc" onClick={() => this.handlerGoToInterfaceDoc(record)}>
              {intl.get(`${modelCode}.button.itfDoc`).d('接口单据明细')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    return [TableButtonType.add];
  }

  /**
   * 新增行
   * @returns
   */
  @Bind()
  handleAddLine() {
    // this.tableLineDS.reset();
    const docTypeHeaderId = this.tableHeaderDS.current!.get('docTypeHeaderId');
    if (docTypeHeaderId) {
      this.tableLineDS.create({ docTypeHeaderId }, 0);
    } else {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.saveHeader`).d(`请先保存头数据！`),
      });
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get lineButtons(): Buttons[] {
    return [
      <Button icon="playlist_add" key="add" onClick={() => this.handleAddLine()}>
        {intl.get('hzero.common.button.add ').d('新增')}
      </Button>,
      // TableButtonType.save,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('单据类型维护')} />
        <Content>
          <Table
            dataSet={this.tableHeaderDS}
            columns={this.headerColumns}
            buttons={this.buttons}
            queryFieldsLimit={2}
            editMode={TableEditMode.inline}
            style={{ height: 200 }}
          />
          <Table
            dataSet={this.tableLineDS}
            columns={this.lineColumns}
            buttons={this.lineButtons}
            queryFieldsLimit={2}
            editMode={TableEditMode.inline}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
