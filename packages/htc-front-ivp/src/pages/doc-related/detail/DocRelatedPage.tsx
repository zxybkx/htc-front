import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DataSet, Button, Table, Form, Output, notification, Lov } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import {
  ColumnLock,
  ColumnAlign,
  TableCommandType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import moment from 'moment';
import querystring from 'querystring';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { getCurrentEmployeeInfo } from '@common/services/commonService';
import { documentRelationOperation, selectDocumentType } from '@src/services/invoicesService';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import DocRelatedDS, { DocumentDS } from '../stores/DocRelatedDS';

const modelCode = 'hivp.invoices.docRelated';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface DocRelatedPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
export default class DocRelatedPage extends Component<DocRelatedPageProps> {
  state = {
    companyId: '',
    companyCode: '',
    companyDesc: '',
    backPath: '',
    subViewPath: '',
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
          subViewPath: invoiceInfo.subViewPath,
        });
      }
    }
  }

  handleDocumentRelationOperation = async (record, relationFlag) => {
    const recData = record.toData();
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { ticketCollectorDesc } = this.state;
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
  };

  // 查看档案
  handleGotoArchiveView = () => {
    const { dispatch, location } = this.props;
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    let pathname = this.state.subViewPath;
    if (!pathname) {
      pathname =
        sourceCode === 'BILL_POOL'
          ? `/htc-front-ivp/bills/archive-view/${sourceCode}/${sourceHeaderId}`
          : `/htc-front-ivp/invoices/archive-view/${sourceCode}/${sourceHeaderId}`;
    }
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: location && `${location.pathname}${location.search}`,
              documentNumber: this.documentDS.current!.get('documentNumber'),
              documentTypeCode: this.documentDS.current!.get('documentTypeCode'),
              systemCode: this.documentDS.current!.get('systemCode'),
            })
          ),
        }),
      })
    );
  };

  get columns(): ColumnProps[] {
    const isEdit = (record) => !record.get('detailId');
    return [
      { name: 'systemObj', editor: (record) => isEdit(record) },
      { name: 'documentTypeObj', editor: (record) => isEdit(record) },
      { name: 'documentNumber', editor: (record) => isEdit(record) },
      // { name: 'documentSourceId', width: 110, editor: true },
      { name: 'documentSourceKey', editor: true },
      { name: 'documentRemark', width: 300, editor: true },
      { name: 'receiptsState' },
      { name: 'recordUpdateDate', width: 160 },
      { name: 'employeeName', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 230,
        command: ({ record }): Commands[] => {
          const receiptsState = record.get('receiptsState');
          return [
            <Button
              key="disableRel"
              onClick={() => this.handleDocumentRelationOperation(record, '0')}
              disabled={receiptsState === '0'}
            >
              {intl.get(`${modelCode}.button.disableRel`).d('失效关联')}
            </Button>,
            <Button
              key="enableRel"
              onClick={() => this.handleDocumentRelationOperation(record, '1')}
              disabled={receiptsState === '1'}
            >
              {intl.get(`${modelCode}.button.enableRel`).d('重新关联')}
            </Button>,
            receiptsState === '0' ? TableCommandType.edit : <></>,
          ];
        },
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
    this.tableDS.create({ companyCode, employeeNumber, sourceCode, invoiceCode, invoiceNum }, 0);
  }

  get buttons(): Buttons[] {
    return [
      <Button icon="playlist_add" key="add" onClick={() => this.handleAdd()}>
        {intl.get(`${modelCode}.button.add`).d('新增')}
      </Button>,
    ];
  }

  render() {
    const { sourceCode } = this.props.match.params;
    const { companyDesc, backPath } = this.state;
    return (
      <>
        <Header backPath={backPath} title={intl.get(`${modelCode}.title`).d('单据关联')}>
          <Button onClick={() => this.handleSelectDocumentType()}>
            {intl.get(`${modelCode}.button.disabled`).d('添加关联')}
          </Button>
          <Button
            disabled={!this.invoiceDS.current?.get('fileUrl')}
            onClick={() => this.handleGotoArchiveView()}
          >
            {intl.get(`${modelCode}.button.enabled`).d('查看档案')}
          </Button>
        </Header>
        <Content>
          <Form dataSet={this.invoiceDS} columns={3}>
            <Output
              value={companyDesc}
              label={intl.get(`${modelCode}.view.companyDesc`).d('所属公司')}
            />
            <Output
              value={moment().format(DEFAULT_DATE_FORMAT)}
              label={intl.get(`${modelCode}.view.curDate`).d('当前日期')}
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
          <Form dataSet={this.documentDS} columns={3}>
            <Lov name="documentObj" />
          </Form>
          <Table
            buttons={this.buttons}
            dataSet={this.tableDS}
            columns={this.columns}
            queryFieldsLimit={3}
            style={{ height: 200 }}
            editMode={TableEditMode.inline}
          />
        </Content>
      </>
    );
  }
}
