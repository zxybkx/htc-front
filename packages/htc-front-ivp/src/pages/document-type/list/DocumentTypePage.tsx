/**
 * @Description:单据类型维护页面
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-09-15 15:10:12
 * @LastEditTime: 2021-11-25 10:05:21
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
import { Col, Row, Tag } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import {
  DataSet,
  Button,
  Modal,
  Switch,
  Form,
  TextField,
  DateTimePicker,
  Select,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { TableButtonType, ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentTenant } from 'utils/utils';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import notification from 'utils/notification';
import AggregationTable from '@htccommon/pages/invoice-common/aggregation-table/detail/AggregationTablePage';
import formatterCollections from 'utils/intl/formatterCollections';
import DocumentTypeHeaderDS from '../stores/DocumentTypeHeaderDS';
import DocumentTypeLineDS from '../stores/DocumentTypeLineDS';
import styles from '../table.less';

const modelCode = 'hivp.documentType';

interface DocumentTypePageProps {
  dispatch: Dispatch<any>;
}

@connect()
@formatterCollections({
  code: [modelCode, 'htc.common', 'hiop.invoiceRule'],
})
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

  // componentDidMount(): void {
  //   this.tableHeaderDS.query().then(res => {
  //     if (res && res.content) {
  //       this.setState({
  //         currentTenantInfo: res.content[0],
  //       });
  //       this.tableLineDS.setQueryParameter('docTypeHeaderId', res.content[0].docTypeHeaderId);
  //       this.tableLineDS.query();
  //     }
  //   });
  // }

  /**
   * 禁用/启用
   */
  @Bind()
  handleEnabledFlag(sourceFlag, record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1, endDate: '' });
      if (sourceFlag === 'H') {
        this.tableHeaderDS.submit();
      }
      if (sourceFlag === 'L') this.tableLineDS.submit();
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then((button) => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0, endDate: new Date() });
          if (sourceFlag === 'H') {
            this.tableHeaderDS.submit();
          }
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
      {
        name: 'tenantInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'systemCode',
            title: '',
            renderer: ({ value, record }) => {
              const enabledFlag = record!.get('enabledFlag');
              const enabledText =
                enabledFlag === 0
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enabled').d('启用');
              return (
                <>
                  <Tag color={enabledFlag === 0 ? '#dadada' : '#87d068'}>{enabledText}</Tag>
                  <span>{value}</span>
                </>
              );
            },
          },
          {
            name: 'systemName',
            title: '',
          },
          {
            name: 'startDate',
            title: '',
            renderer: ({ text, record }) => {
              const endDate =
                record!.get('endDate') &&
                moment(record!.get('endDate')).format(DEFAULT_DATETIME_FORMAT);
              return (
                <div style={{ color: '#8C8C8C' }}>
                  <span>{text}</span>
                  {endDate && <span>&nbsp;-&nbsp;</span>}
                  <span>{endDate}</span>
                </div>
              );
            },
          },
        ],
      },
    ];
  }

  @Bind()
  handleLineSwitchChange(record, modal) {
    if (record.get('enabledFlag') === 0) {
      record.set({ endDate: new Date() });
      modal.update({
        children: (
          <Form record={record}>
            <TextField name="documentTypeCode" />
            <TextField name="documentTypeMeaning" />
            <Select name="salesSourceCode" />
            <DateTimePicker name="startDate" />
            <Switch
              name="enabledFlag"
              onChange={() => this.handleLineSwitchChange(record, modal)}
            />
            <DateTimePicker name="endDate" />
          </Form>
        ),
      });
    } else {
      record.set({ endDate: null });
      record.set({ startDate: new Date() });
      modal.update({
        children: (
          <Form record={record}>
            <TextField name="documentTypeCode" />
            <TextField name="documentTypeMeaning" />
            <Select name="salesSourceCode" />
            <DateTimePicker name="startDate" />
            <Switch
              name="enabledFlag"
              onChange={() => this.handleLineSwitchChange(record, modal)}
            />
          </Form>
        ),
      });
    }
  }

  openLineModal(record, isNew) {
    const modal = Modal.open({
      title: isNew
        ? intl.get('hzero.common.button.new').d('新建')
        : intl.get('hzero.common.button.editable').d('编辑'),
      children: (
        <Form record={record}>
          <TextField name="documentTypeCode" />
          <TextField name="documentTypeMeaning" />
          <Select name="salesSourceCode" />
          <DateTimePicker name="startDate" />
          <Switch name="enabledFlag" onChange={() => this.handleLineSwitchChange(record, modal)} />
          {record.get('enabledFlag') === 0 && <DateTimePicker name="endDate" />}
        </Form>
      ),
      onOk: () => this.tableLineDS.submit(),
      onCancel: () => {
        if (isNew) {
          this.tableLineDS.remove(record);
        } else {
          this.tableLineDS.reset();
        }
      },
    });
  }

  /**
   * 单据编辑
   */
  @Bind()
  handleDocEdit(record) {
    this.openLineModal(record, false);
  }

  /**
   * 单据类型行信息
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        name: 'companyInfo',
        aggregation: true,
        align: ColumnAlign.left,
        width: 100,
        children: [
          {
            name: 'enabledFlag',
            title: '',
            renderer: ({ text, value }) => (
              <Tag color={value === 0 ? '#dadada' : '#87d068'}>{text}</Tag>
            ),
          },
          {
            name: 'documentTypeCode',
            title: '',
          },
        ],
      },
      { name: 'documentTypeMeaning', width: 120 },
      { name: 'salesSourceCode', width: 320 },
      {
        name: 'dateInfo',
        aggregation: true,
        align: ColumnAlign.left,
        children: [
          {
            name: 'startDate',
            header: () => (
              <span style={{ color: '#8C8C8C' }}>
                {intl.get(`${modelCode}.button.start`).d('开始')}：
              </span>
            ),
          },
          {
            name: 'endDate',
            header: () => (
              <span style={{ color: '#8C8C8C' }}>
                {intl.get(`${modelCode}.button.deadline`).d('截止')}：
              </span>
            ),
            renderer: ({ value, text }) => (value ? text : '-'),
          },
        ],
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 200,
        command: ({ record }): Commands[] => {
          const curFlag = record.get('enabledFlag');
          return [
            <span className="action-link" key="action">
              <a
                onClick={() => this.handleEnabledFlag('L', record)}
                style={{ color: curFlag === 0 ? 'green' : 'gray' }}
              >
                {curFlag === 0
                  ? intl.get('hzero.common.status.enabled').d('启用')
                  : intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => this.handleDocEdit(record)}>
                {intl.get('hzero.common.button.editable').d('编辑')}
              </a>
              <a onClick={() => this.handlerGoToInterfaceDoc(record)}>
                {intl.get(`${modelCode}.button.itfDoc`).d('接口单据明细')}
              </a>
            </span>,
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
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      // TableButtonType.save,
    ];
  }

  @Bind()
  handleSwitchChange() {
    this.handleEnabledFlag('H', this.tableHeaderDS.current);
  }

  /**
   * 新建系统启用/禁用
   */
  handleSwitchChangeNew(record, modal) {
    if (record.get('enabledFlag') === 0) {
      record.set({ endDate: new Date() });
      modal.update({
        children: (
          <Form record={record}>
            <TextField name="systemCode" />
            <TextField name="systemName" />
            <DateTimePicker name="startDate" />
            <Switch name="enabledFlag" onChange={() => this.handleSwitchChangeNew(record, modal)} />
            <DateTimePicker name="endDate" />
          </Form>
        ),
      });
    } else {
      record.set({ endDate: null });
      record.set({ startDate: new Date() });
      modal.update({
        children: (
          <Form record={record}>
            <TextField name="systemCode" />
            <TextField name="systemName" />
            <DateTimePicker name="startDate" />
            <Switch name="enabledFlag" onChange={() => this.handleSwitchChangeNew(record, modal)} />
          </Form>
        ),
      });
    }
  }

  @Bind()
  openHeaderModal(record) {
    const modal = Modal.open({
      title: intl.get(`${modelCode}.view.newSystem`).d('新建系统'),
      children: (
        <Form record={record}>
          <TextField name="systemCode" />
          <TextField name="systemName" />
          <DateTimePicker name="startDate" />
          <Switch name="enabledFlag" onChange={() => this.handleSwitchChangeNew(record, modal)} />
        </Form>
      ),
      onOk: () => this.tableHeaderDS.submit(),
      onCancel: () => {
        this.tableHeaderDS.remove(record);
      },
    });
  }

  /**
   * 系统新建
   */
  @Bind()
  handleTenantAdd() {
    this.openHeaderModal(this.tableHeaderDS.create({}, 0));
  }

  /**
   * 单据新建
   */
  @Bind()
  handleDocumentAdd() {
    const docTypeHeaderId = this.tableHeaderDS.current!.get('docTypeHeaderId');
    if (docTypeHeaderId) {
      this.openLineModal(this.tableLineDS.create({ docTypeHeaderId }, 0), true);
    }
  }

  @Bind()
  renderBread() {
    const Bread = observer((props: any) => {
      const enabledFlag = props.dataSet && props.dataSet.current?.get('enabledFlag');
      const systemName = props.dataSet && props.dataSet.current?.get('systemName');
      const enabledText =
        enabledFlag === 0
          ? intl.get('hzero.common.status.disable').d('禁用')
          : intl.get('hzero.common.status.enabled').d('启用');
      return (
        <Row type="flex">
          <Col span={20}>
            <Tag color={enabledFlag === 0 ? '#dadada' : '#87d068'}>{enabledText}</Tag>
            <span style={{ fontSize: '0.14rem' }}>{systemName}</span>
          </Col>
          <Col span={4} style={{ textAlign: 'end' }}>
            <Switch
              onChange={this.handleSwitchChange}
              style={{ marginRight: '0.1rem' }}
              checked={enabledFlag === 1}
            />
            <Button color={ButtonColor.primary} icon="add" onClick={this.handleDocumentAdd}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          </Col>
        </Row>
      );
    });
    return <Bread dataSet={this.tableHeaderDS} />;
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.view.title`).d('单据类型维护')} />
        <Row gutter={16} style={{ height: 'calc(100%)' }}>
          <Col span={5} style={{ height: 'calc(100%)' }}>
            <Content style={{ overflowX: 'hidden' }}>
              <div>
                <div className={styles.header}>
                  <span className={styles.leftTopLabel}>
                    {intl.get('htc.common.view.tenantCode').d('租户代码')}：
                  </span>
                  <span>{getCurrentTenant().tenantNum}</span>
                </div>
                <div className={styles.header}>
                  <span className={styles.leftTopLabel}>
                    {intl.get('htc.common.view.tenantName').d('租户名称')}：
                  </span>
                  <span>{getCurrentTenant().tenantName}</span>
                </div>
                <Button icon="add" block color={ButtonColor.primary} onClick={this.handleTenantAdd}>
                  {intl.get(`${modelCode}.view.newSystem`).d('新建系统')}
                </Button>
              </div>
              <div className={styles.contain}>
                <AggregationTable
                  dataSet={this.tableHeaderDS}
                  columns={this.headerColumns}
                  showHeader={false}
                  aggregation
                />
              </div>
            </Content>
          </Col>
          <Col span={19} style={{ height: '100%' }}>
            <Content>
              {this.renderBread()}
              <AggregationTable
                aggregation
                dataSet={this.tableLineDS}
                columns={this.lineColumns}
                style={{ height: 450 }}
              />
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}
