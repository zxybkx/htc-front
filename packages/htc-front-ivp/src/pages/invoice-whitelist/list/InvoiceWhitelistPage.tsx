/*
 * @Description:发票入池规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-1-19 17:18:15
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { openTab, closeTab } from 'utils/menuTab';
import queryString from 'query-string';
import { TableCommandType, TableEditMode } from 'choerodon-ui/pro/lib/table/enum';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { Row, Col } from 'choerodon-ui';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Output,
  Table,
  TextField,
  Select,
  NumberField,
  Modal,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { getCurrentOrganizationId } from 'utils/utils';
import InvoiceWhitelistDS from '../stores/InvoiceWhitelistDS';
import LineDS from '../stores/LineDS';
import './InvoiceWhitePage.less';

const modelCode = 'hivp.invoice-whitelist';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IVP_API || '';
const modalKey = Modal.key();

interface InvoiceWhitelistPageProps {
  dispatch: Dispatch<any>;
  invoiceWorkbenchDS: DataSet;
}

@connect()
export default class InvoiceWhitelistPage extends Component<InvoiceWhitelistPageProps> {
  state = {
    companyCode: '',
    employeeNum: '',
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
    this.invoiceWhitelistDS.query().then((res) => {
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
    const queryParams = this.lineDS.queryDataSet!.map((data) => data.toData(true)) || {};
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
        title: intl.get('hzero.common.button.import').d('导入'),
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
      }).then((button) => {
        if (button === 'ok') {
          this.lineDS.current!.set({ enabledFlag: 0 });
          this.lineSave();
        }
      });
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
      { name: 'buyerName', editor: (record) => !record.get('blackListKey') },
      { name: 'buyerTaxNo', editor: (record) => !record.get('blackListKey') },
      {
        name: 'blackListKey',
        editor: (record) => !record.get('buyerName') && !record.get('buyerTaxNo'),
      },
      { name: 'limitRange', editor: true },
      { name: 'enabledFlag', width: 90, renderer: ({ value }) => enableRender(value) },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        command: ({ record }): Commands[] => {
          const data = record.toData();
          const enabledFlag = record.get('enabledFlag');
          return [
            <Button key="disable" onClick={() => this.handleLineOp(data)}>
              {enabledFlag === 0
                ? intl.get(`${modelCode}.button.delete`).d('启用')
                : intl.get(`${modelCode}.button.delete`).d('禁用')}
            </Button>,
            TableCommandType.edit,
          ];
        },
      },
    ];
  }

  // 新增
  @Bind()
  lineAdd() {
    const curInfo = this.invoiceWhitelistDS.current!.toData();
    const { objectVersionNumber } = curInfo;
    const { companyCode } = this.state;
    this.lineDS.create(
      {
        objectVersionNumber,
        companyCode,
        tenantId,
      },
      0
    );
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
        message: intl.get('hivp.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    }
  }

  get buttons(): Buttons[] {
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button key="add" icon="playlist_add" onClick={() => this.lineAdd()}>
        {intl.get(`${modelCode}.button.add`).d('新增')}
      </Button>,
      <HeaderButtons
        key="delete"
        onClick={() => this.lineDelete()}
        dataSet={this.lineDS}
        title={intl.get(`${modelCode}.button.delete`).d('删除')}
      />,
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
    return (
      <>
        <Row gutter={16} type="flex" align="bottom">
          <Col span={22}>
            <Form columns={3} dataSet={queryDataSet}>
              <Lov name="companyObj" onChange={this.handleCompanyChange} />
              <Output name="taxpayerNumber" />
              <TextField name="buyerName" />
              <TextField name="buyerTaxNo" />
              <TextField name="blackListKey" />
              <Select name="limitRangeList" />
            </Form>
          </Col>
          <Col span={2}>
            <Form>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  this.lineDS.query();
                  this.invoiceWhitelistDS.query();
                }}
                style={{ width: 60, textAlign: 'end' }}
              >
                {intl.get(`${modelCode}.button.save`).d('查询')}
              </Button>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col span={22}>
            <Form dataSet={this.invoiceWhitelistDS} columns={3}>
              <Select name="employeeWhiteList" colSpan={1} onChange={() => this.saveHeader()} />
              <NumberField
                name="timeRange"
                colSpan={1}
                onChange={() => this.saveHeader()}
                renderer={(value) => value.text && `${value.text}天`}
              />
            </Form>
          </Col>
        </Row>
        {buttons}
      </>
    );
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('发票入池规则')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoice-white-lists/export-whitelist`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            dataSet={this.lineDS}
            columns={this.columns}
            buttons={this.buttons}
            queryBar={this.renderQueryBar}
            editMode={TableEditMode.inline}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
