import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import {
  DataSet,
  Button,
  Table,
  Form,
  Output,
  notification,
  Lov,
  Spin,
  Icon,
} from 'choerodon-ui/pro';
import { Collapse, Tag } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { documentRelationOperation, selectDocumentType } from '@src/services/invoicesService';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import InvoiceChildSwitchPage from '@src/utils/invoiceChildSwitch/invoiceChildSwitchPage';
import formatterCollections from 'utils/intl/formatterCollections';
import DocRelatedDS, { DocumentDS } from '../stores/DocRelatedDS';
import style from '../docRelated.model.less';

const { Panel } = Collapse;
const modelCode = 'hivp.invoicesDocRelated';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface DocRelatedPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'hivp.invoicesArchiveUpload', 'htc.common', 'hivp.batchCheck'],
})
@connect()
@formatterCollections({
  code: [
    modelCode,
    'hivp.invoicesArchiveUpload',
    'hivp.bill',
    'hivp.batchCheck',
    'htc.common',
    'hivp.invoicesArchiveUpload',
    'hivp.checkCertification',
  ],
})
export default class DocRelatedPage extends Component<DocRelatedPageProps> {
  state = {
    companyId: '',
    companyCode: '',
    companyDesc: '',
    backPath: '',
    ticketCollectorDesc: '',
    employeeNumber: '',
  };

  tableDS = new DataSet({
    autoQuery: true,
    ...DocRelatedDS(this.props.match.params),
  });

  invoiceDS = new DataSet({
    autoQuery: false,
    ...SubPageInvoicesHeadersDS({
      invoicePoolHeaderId: this.props.match.params.sourceHeaderId,
    }),
  });

  documentDS;

  async componentDidMount() {
    if (this.props.match.params.sourceCode === 'BILL_POOL') {
      this.invoiceDS = new DataSet({
        autoQuery: false,
        ...SubPageBillHeadersDS({
          billPoolHeaderId: this.props.match.params.sourceHeaderId,
        }),
      });
    }
    await this.invoiceDS.query();
    const { search } = this.props.location;
    // const { sourceCode } = this.props.match.params;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const empRes = await getCurrentEmployeeInfo({ tenantId, companyId: invoiceInfo.companyId });
      const curInfo = empRes && empRes.content[0];
      // const { invoiceCode, invoiceNo } = this.invoiceDS.current!.toData();
      if (curInfo) {
        this.documentDS = new DataSet({
          autoQuery: false,
          autoCreate: true,
          ...DocumentDS(curInfo.companyId),
        });
        const { companyCode, companyName, employeeNum, employeeName, mobile } = curInfo;
        const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
        this.setState({
          companyId: invoiceInfo.companyId,
          companyCode,
          employeeNumber: employeeNum,
          companyDesc: `${companyCode}-${companyName}`,
          ticketCollectorDesc: employeeDesc,
          backPath: invoiceInfo.backPath,
        });
      }
    }
  }

  handleDocumentRelationOperation = async (record, relationFlag) => {
    const recData = record.toData();
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { ticketCollectorDesc, employeeNumber } = this.state;
    const params = {
      tenantId,
      detailId: recData.detailId,
      relationFlag,
      invoicePoolHeaderId: sourceHeaderId,
      sourceCode,
      documentTypeCode: recData.documentTypeCode,
      systemCode: recData.systemCode,
      documentNumber: recData.documentNumber,
      ticketCollectorDesc,
      employeeNumber,
    };
    const res = getResponse(await documentRelationOperation(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      this.tableDS.query();
    }
  };

  handleSelectDocumentType = async () => {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { ticketCollectorDesc } = this.state;
    const docCur = this.documentDS.current;
    if (docCur) {
      const docCurRecord = docCur.toData();
      if (docCurRecord && docCurRecord.documentNumber) {
        const res = getResponse(
          await selectDocumentType({
            tenantId,
            companyId: this.state.companyId,
            invoicePoolHeaderId: sourceHeaderId,
            sourceCode,
            documentTypeCode: docCurRecord.documentTypeCode,
            systemCode: docCurRecord.systemCode,
            documentNumber: docCurRecord.documentNumber,
            ticketCollectorDesc,
          })
        );
        if (res) {
          notification.success({
            description: '',
            message: res.message,
          });
          this.tableDS.query();
        }
      } else {
        notification.info({
          description: '',
          message: intl.get(`${modelCode}.view.selecteDoc`).d('请先选择单据信息'),
        });
      }
    }
    return true;
  };

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
    const receiptsState = record?.get('receiptsState');
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSave(record)}>
          {intl.get('hzero.common.btn.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancel(record)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    } else if (receiptsState === '0') {
      btns.push(
        <a onClick={() => this.handleDocumentRelationOperation(record, '1')}>
          {intl.get(`${modelCode}.button.enableRel`).d('关联')}
        </a>,
        <a onClick={() => this.handleEdit(record)}>
          {intl.get('hzero.common.status.edit').d('编辑')}
        </a>
      );
    } else {
      btns.push(
        <a
          style={{ color: '#8C8C8C' }}
          onClick={() => this.handleDocumentRelationOperation(record, '0')}
        >
          {intl.get(`${modelCode}.button.disassociate`).d('取消关联')}
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
    const isEdit = (record) => !record.get('detailId');
    return [
      { name: 'systemObj', editor: (record) => isEdit(record) },
      { name: 'documentTypeObj', editor: (record) => isEdit(record) },
      { name: 'documentNumber', editor: (record) => isEdit(record) },
      // { name: 'documentSourceId', width: 110, editor: true },
      { name: 'documentSourceKey', editor: (record) => record.getState('editing') },
      { name: 'documentRemark', width: 300, editor: (record) => record.getState('editing') },
      {
        name: 'receiptsState',
        renderer: ({ record }) => {
          const receiptsState = record?.get('receiptsState');
          if (receiptsState === '0') {
            return (
              <Tag style={{ color: '#595959' }} color="#F0F0F0">
                {intl.get(`${modelCode}.button.disassociate`).d('未关联')}
              </Tag>
            );
          } else {
            return (
              <Tag style={{ color: '#19A633' }} color="#D6FFD7">
                {intl.get(`${modelCode}.button.disassociate`).d('已关联')}
              </Tag>
            );
          }
        },
      },
      { name: 'recordUpdateDate', width: 160 },
      { name: 'employeeName', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 230,
        renderer: ({ record }) => this.commands(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  handleAdd() {
    const { sourceCode } = this.props.match.params;
    const { companyCode, employeeNumber } = this.state;
    const invoiceCode = this.invoiceDS.current!.get('invoiceCode');
    const invoiceNum = this.invoiceDS.current!.get('invoiceNo');
    const record = this.tableDS.create(
      { companyCode, employeeNumber, sourceCode, invoiceCode, invoiceNum },
      0
    );
    record.setState('editing', true);
  }

  get buttons(): Buttons[] {
    const state = window.dvaApp._store.getState();
    const { global } = state;
    const { activeTabKey } = global;
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    return [
      <Button
        id={`addAssociated${this.props.match.params.sourceHeaderId}${subTabKey}`}
        style={{ display: 'none' }}
        icon="playlist_add"
        key="add"
        onClick={() => this.handleAdd()}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Button>,
    ];
  }

  render() {
    const { sourceCode } = this.props.match.params;
    const { companyDesc, backPath } = this.state;
    const customPanelStyle = {
      background: '#fff',
      overflow: 'hidden',
      borderBottom: '8px solid #F6F6F6',
    };
    const state = window.dvaApp._store.getState();
    const { global } = state;
    const { activeTabKey } = global;
    const subTabKey = activeTabKey.substr(15); // 获取当前子标签
    return (
      <>
        <Header backPath={backPath} title={intl.get('hivp.bill.button.relateDoc').d('单据关联')}>
          {/* <Button onClick={() => this.handleSelectDocumentType()}>
            {intl.get(`${modelCode}.button.disabled`).d('添加关联')}
          </Button> */}
        </Header>
        <Content style={{ background: '#F6F6F6' }}>
          <Spin dataSet={this.invoiceDS}>
            <Collapse bordered={false} defaultActiveKey={['HEADER', 'TABLE']}>
              <Panel
                header={intl
                  .get('hivp.invoicesArchiveUpload.title.invoiceHeader')
                  .d('票据基础信息')}
                key="HEADER"
                style={customPanelStyle}
              >
                <Form dataSet={this.invoiceDS} columns={3}>
                  <Output
                    value={companyDesc}
                    label={intl.get('htc.common.modal.companyName').d('所属公司')}
                  />
                  <Output
                    value={moment().format(DEFAULT_DATE_FORMAT)}
                    label={intl.get('hivp.batchCheck.view.currentTime').d('当前日期')}
                  />
                  <Output name="recordType" />
                  {sourceCode === 'BILL_POOL' ? (
                    <Output name="billType" />
                  ) : (
                    <Output name="invoiceType" />
                  )}
                  {sourceCode === 'BILL_POOL' ? '' : <Output name="inOutType" />}
                  <Output name="invoiceDate" />
                  <Output name="buyerName" newLine />
                  <Output name="invoiceCode" />
                  <Output name="invoiceNo" />
                  <Output name="salerName" />
                  <Output name="invoiceAmount" />
                  <Output name="totalAmount" />
                </Form>
              </Panel>
              <Panel
                header={intl.get(`${modelCode}.title.associatedDocuments`).d('关联单据')}
                key="TABLE"
                style={customPanelStyle}
              >
                <div>
                  <Lov
                    style={{ width: '280px' }}
                    dataSet={this.documentDS}
                    name="documentObj"
                    onChange={() => this.handleSelectDocumentType()}
                  />
                  {/* eslint-disable */}
                  <label
                    htmlFor={`addAssociated${this.props.match.params.sourceHeaderId}${subTabKey}`}
                    className={style.add}
                  >
                    <a>
                      <Icon type="add" />
                      {intl.get('hzero.common.btn.add').d('新增')}
                    </a>
                  </label>
                  {/* eslint-enable */}
                </div>
                <Table
                  buttons={this.buttons}
                  dataSet={this.tableDS}
                  columns={this.columns}
                  queryFieldsLimit={3}
                  style={{ height: 200 }}
                />
              </Panel>
            </Collapse>
            <InvoiceChildSwitchPage type={2} />
          </Spin>
        </Content>
      </>
    );
  }
}
