/**
 * @Description:发票入池规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-19 17:18:15
 * @LastEditTime: 2021-10-13 15:56:29
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { closeTab, openTab } from 'utils/menuTab';
import queryString from 'query-string';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@htccommon/config/commonConfig';
import notification from 'utils/notification';
import { Col, Icon, Row, Tag } from 'choerodon-ui';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Modal,
  NumberField,
  Select,
  Table,
  TextField,
  Switch,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { FormLayout } from 'choerodon-ui/pro/lib/form/enum';
import InvoiceWhitelistDS from '../stores/InvoiceWhitelistDS';
import LineDS from '../stores/LineDS';
import styles from './InvoiceWhitePage.less';

const modelCode = 'hivp.invoiceWhitelist';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const modalKey = Modal.key();

interface InvoiceWhitelistPageProps {
  dispatch: Dispatch<any>;
  invoiceWorkbenchDS: DataSet;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.bill', 'hiop.invoiceRule'],
})
export default class InvoiceWhitelistPage extends Component<InvoiceWhitelistPageProps> {
  state = {
    companyCode: '',
    employeeNum: '',
    queryMoreDisplay: false,
  };

  invoiceWhitelistDS = new DataSet({
    autoQuery: false,
    ...InvoiceWhitelistDS(),
  });

  lineDS = new DataSet({
    autoQuery: false,
    ...LineDS(),
  });

  // 查询
  @Bind()
  handleQuery(empInfo) {
    this.invoiceWhitelistDS.query().then(res => {
      if (res && !res.failed) {
        if (!res.companyCode) {
          this.invoiceWhitelistDS.current!.set({
            companyCode: empInfo.companyCode,
            companyName: empInfo.companyName,
            taxpayerNumber: empInfo.taxpayerNumber,
            tenantId,
          });
        }
      }
    });
    this.lineDS.query();
  }

  async componentDidMount() {
    const { queryDataSet: lineQueryDataSet } = this.lineDS;
    if (lineQueryDataSet) {
      const res = await getCurrentEmployeeInfo({ tenantId });
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo) {
          const { companyCode, companyName, taxpayerNumber, employeeNum } = empInfo;
          this.invoiceWhitelistDS.setQueryParameter('companyCode', companyCode);
          this.invoiceWhitelistDS.setQueryParameter('companyName', companyName);
          this.invoiceWhitelistDS.setQueryParameter('taxpayerNumber', taxpayerNumber);
          lineQueryDataSet.getField('companyObj')!.set('defaultValue', empInfo);
          lineQueryDataSet.reset();
          lineQueryDataSet.create({}, 0);
          this.setState({ companyCode, employeeNum });
          this.handleQuery(empInfo);
        }
      }
    }
  }

  // 导出
  @Bind()
  exportParams() {
    const queryParams = this.lineDS.queryDataSet!.map(data => data.toData(true)) || {};
    return { ...queryParams[0] } || {};
  }

  // 导入
  @Bind()
  async handleBatchExport() {
    const code = 'HIVP.INVOICE_WHITE_LIST';
    const { companyCode, employeeNum } = this.state;
    const params = { companyCode, employeeNum, tenantId };
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify(params);
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.save.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get(`${modelCode}.view.invoiceReqImport`).d('发票入池规则导入'),
          args: argsParam,
        }),
      });
    }
  }

  @Bind()
  handleLineOp(record) {
    if (record.enabledFlag === 0) {
      // 禁用转启用，单据状态为禁用时显示，点击按钮直接将单据状态更新为启用
      this.lineDS.current!.set({ enabledFlag: 1 });
      this.lineSave();
    } else {
      const title = intl.get(`${modelCode}.view.disableConfirm`).d('确认禁用？');
      Modal.confirm({
        key: modalKey,
        title,
      }).then(button => {
        if (button === 'ok') {
          this.lineDS.current!.set({ enabledFlag: 0 });
          this.lineSave();
        }
      });
    }
  }

  @Bind()
  handleEdit(record) {
    record.setState('editing', true);
  }

  @Bind()
  handleCancel(record) {
    if (record.status === 'add') {
      this.lineDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  @Bind()
  async handleSave(record) {
    const res = await this.lineDS.submit();
    if (res && res.content) record.setState('editing', false);
  }

  @Bind()
  commands(record) {
    const btns: any = [];
    const enabledFlag = record.get('enabledFlag');
    const lineData = record.toData();
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSave(record)}>
          {intl.get('hzero.common.button.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a
          onClick={() => this.handleLineOp(lineData)}
          style={{ color: enabledFlag === 0 ? 'green' : 'gray' }}
        >
          {enabledFlag === 0
            ? intl.get('hzero.common.status.enable').d('启用')
            : intl.get('hzero.common.status.disable').d('禁用')}
        </a>,
        <a onClick={() => this.handleEdit(record)}>
          {intl.get('hzero.common.status.edit').d('编辑')}
        </a>
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
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'buyerName',
        editor: record => record.getState('editing') && !record.get('blackListKey'),
        renderer: ({ value, record }) => {
          const enabledFlag = record?.get('enabledFlag');
          const enabledText =
            enabledFlag === 0
              ? intl.get('hzero.common.status.disable').d('禁用')
              : intl.get('hzero.common.status.enable').d('启用');
          return (
            <>
              <Tag color={enabledFlag === 0 ? '#dadada' : '#87d068'}>{enabledText}</Tag>
              &nbsp;<span>{value}</span>
            </>
          );
        },
      },
      {
        name: 'buyerTaxNo',
        editor: record => record.getState('editing') && !record.get('blackListKey'),
      },
      {
        name: 'blackListKey',
        editor: record =>
          record.getState('editing') && !record.get('buyerName') && !record.get('buyerTaxNo'),
      },
      { name: 'limitRange', editor: record => record.getState('editing') },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => this.commands(record),
      },
    ];
  }

  // 新增
  @Bind()
  lineAdd() {
    const curInfo = this.invoiceWhitelistDS.current!.toData();
    const { objectVersionNumber } = curInfo;
    const { companyCode } = this.state;
    const record = this.lineDS.create(
      {
        objectVersionNumber,
        companyCode,
        tenantId,
      },
      0
    );
    record.setState('editing', true);
  }

  // 删除
  @Bind()
  async lineDelete() {
    const lists = this.lineDS.selected;
    this.lineDS.delete(lists);
  }

  // 保存
  @Bind()
  async lineSave() {
    const linesValidate = await this.lineDS.validate(false, false);
    if (!linesValidate) {
      notification.warning({
        description: '',
        message: '校验不通过',
      });
      return;
    }
    const res = await this.lineDS.submit();
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get(`${modelCode}.notice.editData`).d('请先修改数据'),
      });
    }
  }

  get buttons(): Buttons[] {
    return [
      <Button key="add" icon="playlist_add" onClick={() => this.lineAdd()}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      TableButtonType.delete,
    ];
  }

  @Bind()
  saveHeader() {
    this.invoiceWhitelistDS.submit();
  }

  @Bind()
  handleCompanyChange(value) {
    if (value) {
      const { companyCode, companyName, taxpayerNumber, employeeNum } = value;
      this.invoiceWhitelistDS.setQueryParameter('companyCode', companyCode);
      this.invoiceWhitelistDS.setQueryParameter('companyName', companyName);
      this.invoiceWhitelistDS.setQueryParameter('taxpayerNumber', taxpayerNumber);
      this.setState({ companyCode, employeeNum });
      this.handleQuery(value);
    }
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons } = props;
    const { queryMoreDisplay } = this.state;
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<TextField name="buyerTaxNo" />);
    queryMoreArray.push(<TextField name="blackListKey" />);
    queryMoreArray.push(<Select name="limitRangeList" />);
    return (
      <div style={{ marginBottom: '0.1rem' }}>
        <Row type="flex">
          <Col span={18}>
            <Form columns={3} dataSet={queryDataSet}>
              <Lov name="companyObj" onChange={this.handleCompanyChange} />
              <TextField name="taxpayerNumber" />
              <TextField name="buyerName" />
              {queryMoreDisplay && queryMoreArray}
            </Form>
          </Col>
          <Col span={6} style={{ textAlign: 'end' }}>
            <Button
              funcType={FuncType.link}
              onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}
            >
              {queryMoreDisplay ? (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  <Icon type="expand_more" />
                </span>
              ) : (
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  <Icon type="expand_less" />
                </span>
              )}
            </Button>
            <Button
              onClick={() => {
                queryDataSet.reset();
                queryDataSet.create();
              }}
            >
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                this.lineDS.query();
                this.invoiceWhitelistDS.query();
              }}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </Col>
        </Row>
        {buttons}
      </div>
    );
  }

  render() {
    return (
      <>
        <Header
          title={
            <div>
              {intl.get(`${modelCode}.view.title`).d('发票入池规则')}
              <Form
                dataSet={this.invoiceWhitelistDS}
                style={{ display: 'inline-block' }}
                layout={FormLayout.none}
              >
                <Switch
                  name="enabledFlag"
                  onChange={() => this.saveHeader()}
                  style={{ marginLeft: '10px' }}
                />
              </Form>
            </div>
          }
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-white-lists/export-whitelist`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get('hzero.common.button.save.import').d('导入')}
          </Button>
        </Header>
        <div className={styles.header}>
          <Form dataSet={this.invoiceWhitelistDS} columns={3}>
            <Select name="employeeWhiteList" colSpan={1} onChange={() => this.saveHeader()} />
            <NumberField
              name="timeRange"
              colSpan={1}
              onChange={() => this.saveHeader()}
              renderer={value =>
                value.text &&
                `${value.text}${intl.get('hzero.common.message.priority.day').d('天')}`
              }
            />
          </Form>
        </div>
        <Content>
          <Table
            dataSet={this.lineDS}
            columns={this.columns}
            buttons={this.buttons}
            queryBar={this.renderQueryBar}
            style={{ height: 350 }}
          />
        </Content>
      </>
    );
  }
}
