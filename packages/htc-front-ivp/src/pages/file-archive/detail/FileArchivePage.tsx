import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import {
  Button,
  DataSet,
  DatePicker,
  Form,
  MonthPicker,
  Output,
  Select,
  Switch,
  Table,
} from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import notification from 'utils/notification';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import moment from 'moment';
import querystring from 'querystring';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { batchArchiveFiles, updateEntryAccount } from '@src/services/invoicesService';
import { Button as PermissionButton } from 'components/Permission';
import { getPresentMenu } from '@htccommon/utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import FileArchiveHeaderDS from '../stores/FileArchiveHeaderDS';
import FileArchiveDS from '../stores/FileArchiveDS';
import styles from './fileArchive.less';

const modelCode = 'hivp.invoicesFileArchive';
const tenantId = getCurrentOrganizationId();
const permissionPath = `${getPresentMenu().name}.ps`;

interface RouterInfo {
  sourceCode: string;
}

interface FileArchivePageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'hivp.invoicesArchiveUpload', 'hivp.bill', 'htc.common', 'hivp.batchCheck'],
})
@connect()
export default class FileArchivePage extends Component<FileArchivePageProps> {
  state = {
    updateEnteredFlag: 0,
    companyId: '',
    companyCode: '',
    employeeNo: '',
    backPath: '',
    archiveValue: undefined,
  };

  headerDS = new DataSet({
    autoQuery: false,
    autoCreate: false,
    ...FileArchiveHeaderDS(),
  });

  tableDS = new DataSet({
    autoQuery: false,
    ...FileArchiveDS(),
  });

  autoRefreshTimer;

  componentDidMount() {
    const { search } = this.props.location;
    const { sourceCode } = this.props.match.params;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      this.headerDS.create(
        { companyDesc: invoiceInfo.companyDesc, companyId: invoiceInfo.companyId },
        0
      );
      if (this.tableDS.getField('invoiceType') && sourceCode === 'BILL_POOL') {
        this.tableDS.getField('invoiceType')!.set('lookupCode', 'HIVP.BILL_TYPE');
      }
      this.tableDS.setQueryParameter('sourceCode', sourceCode);
      this.tableDS.setQueryParameter('invoicePoolHeaderIds', invoiceInfo.sourceHeaderIds);
      this.tableDS.query();
      this.setState({
        companyId: invoiceInfo.companyId,
        companyCode: invoiceInfo.companyCode,
        employeeNo: invoiceInfo.employeeNumber,
        backPath: invoiceInfo.backPath,
      });
    }
  }

  // 更新入账状态/期间
  @Bind()
  async handleUpdateEntryAccount() {
    const { sourceCode } = this.props.match.params;
    const selectedList = this.tableDS.selected.map((rec) => rec.toData());
    const selectedRowKeys = selectedList.map((record) => record.invoicePoolHeaderId);
    if (selectedList.length === 0) {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.selectedMessage`).d('请勾选需要处理的数据'),
      });
      return;
    }
    const validate = await this.headerDS.validate(false, false);
    if (!validate) {
      notification.warning({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const entryAccountDate = this.headerDS.current!.get('entryAccountDate');
    const params = {
      tenantId,
      sourceCode,
      entryAccountDate: entryAccountDate && moment(entryAccountDate).format(DEFAULT_DATE_FORMAT),
      invoicePoolHeaderIds: selectedRowKeys.join(','),
    };
    const res = getResponse(await updateEntryAccount(params));
    if (res && res.status === 'H1017') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.tableDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  // 批量归档档案
  @Bind()
  async handleBatchArchive() {
    const { sourceCode } = this.props.match.params;
    const { companyId, companyCode, employeeNo } = this.state;
    const selectedList = this.tableDS.selected.map((rec) => rec.toData());
    const selectedRowKeys = selectedList.map((record) => record.invoicePoolHeaderId);
    if (selectedList.length === 0) {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.selectedMessage`).d('请勾选需要处理的数据'),
      });
      return;
    }
    const validate = await this.headerDS.validate(false, false);
    if (!validate) {
      notification.warning({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const archiveDate = this.headerDS.current!.get('archiveDate');
    const params = {
      tenantId,
      sourceCode,
      archiveDate: archiveDate && moment(archiveDate).format('YYYY-MM'),
      invoicePoolHeaderIds: selectedRowKeys.join(','),
      companyId,
      companyCode,
      employeeNo,
    };
    const res = getResponse(await batchArchiveFiles(params));
    if (res && res.status === 'H1018') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.tableDS.query();
    } else {
      notification.error({
        description: '',
        message: res.message,
      });
    }
  }

  // 查看档案
  handleGotoArchiveView = (record) => {
    const { dispatch, location } = this.props;
    const { sourceCode } = this.props.match.params;
    const sourceHeaderId = record.get('invoicePoolHeaderId');
    const pathname =
      sourceCode === 'BILL_POOL'
        ? `/htc-front-ivp/bills/archive-view/${sourceCode}/${sourceHeaderId}`
        : `/htc-front-ivp/invoices/archive-view/${sourceCode}/${sourceHeaderId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: location && `${location.pathname}${location.search}`,
            })
          ),
        }),
      })
    );
  };

  get columns(): ColumnProps[] {
    return [
      { name: 'inOutType' },
      { name: 'entryAccountState' },
      { name: 'entryAccountDate', width: 120 },
      { name: 'invoiceType', width: 200 },
      { name: 'salerName', width: 260 },
      { name: 'buyerName', width: 260 },
      { name: 'invoiceState' },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'annotation', width: 200 },
      { name: 'recordType', width: 120 },
      { name: 'downloadPath', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <Button
              key="viewArchive"
              disabled={!record.get('fileUrl')}
              funcType={FuncType.link}
              onClick={() => this.handleGotoArchiveView(record)}
            >
              {intl.get('hivp.invoicesArchiveUpload.view.file').d('查看档案')}
            </Button>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  handleArchiveChange(value) {
    this.setState({ archiveValue: value });
  }

  render() {
    const { updateEnteredFlag, backPath, archiveValue } = this.state;
    return (
      <>
        <Header backPath={backPath} title={intl.get('hivp.bill.button.archives').d('档案归档')}>
          <PermissionButton
            type="c7n-pro"
            onClick={() => this.handleBatchArchive()}
            color={ButtonColor.primary}
            permissionList={[
              {
                code: `${permissionPath}.button.filed-batch-archive`,
                type: 'button',
                meaning: '按钮-档案归档-归档',
              },
            ]}
          >
            {intl.get('hivp.invoicesArchiveUpload.button.filed').d('归档')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            disabled={updateEnteredFlag !== 1}
            onClick={() => this.handleUpdateEntryAccount()}
            permissionList={[
              {
                code: `${permissionPath}.button.filed-update-entry-account`,
                type: 'button',
                meaning: '按钮-档案归档-更新',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.updateEntryAccount`).d('更新')}
          </PermissionButton>
        </Header>
        <div className={styles.header}>
          <Form columns={2} style={{ marginTop: 15 }} dataSet={this.headerDS}>
            <Output name="companyDesc" />
            <Output name="curDate" />
          </Form>
        </div>
        <Content>
          <Form dataSet={this.headerDS} columns={4}>
            <Switch
              name="updateEnteredFlag"
              onChange={(value) => this.setState({ updateEnteredFlag: value })}
            />
            <DatePicker name="entryAccountDate" />
            <Select name="archiveMethod" onChange={this.handleArchiveChange} />
            {archiveValue === '2' && <MonthPicker name="archiveDate" />}
          </Form>
          <Table dataSet={this.tableDS} columns={this.columns} style={{ height: 400 }} />
        </Content>
      </>
    );
  }
}
