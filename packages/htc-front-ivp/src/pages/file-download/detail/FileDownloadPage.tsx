import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Button, DataSet, Form, Modal, Output, Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Commands } from 'choerodon-ui/pro/lib/table/Table';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';
import moment from 'moment';
import { base64toBlob } from '@htccommon/utils/utils';
import { archivesDownload } from '@src/services/invoicesService';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import FileDownloadDS from '../stores/FileDownloadDS';
import FileDownloadDetailDS from '../stores/FileDownloadDetailDS';
import styles from './FileDownload.less';

const modelCode = 'hivp.invoicesFileDownload';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
}

interface FileDownloadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [
    modelCode,
    'htc.common',
    'hiop.invoiceRule',
    'hivp.batchCheck',
    'hivp.bill',
    'hivp.invoicesFileArchive',
  ],
})
export default class FileDownloadPage extends Component<FileDownloadPageProps> {
  state = { companyDesc: '', backPath: '', companyCode: '', employeeNumber: '' };

  detailDS = new DataSet({
    autoQuery: false,
    ...FileDownloadDetailDS(),
  });

  tableDS = new DataSet({
    autoQuery: false,
    ...FileDownloadDS(),
    children: {
      invoiceFileLines: this.detailDS,
    },
  });

  autoRefreshTimer;

  componentDidMount() {
    const { sourceCode } = this.props.match.params;
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      this.setState({
        companyDesc: invoiceInfo.companyDesc,
        backPath: invoiceInfo.backPath,
        companyCode: invoiceInfo.companyCode,
        employeeNumber: invoiceInfo.employeeNumber,
      });
      this.tableDS.setQueryParameter('companyId', invoiceInfo.companyId);
      this.tableDS.setQueryParameter('sourceCode', sourceCode);
    }
  }

  // 下载
  @Bind()
  async handledDownload(record) {
    const { companyCode, employeeNumber } = this.state;
    const lineList = record.toData().invoiceFileLines;
    const invoiceFileHeaderId = record.get('invoiceFileHeaderId');
    if (lineList) {
      const urlList = lineList.map(item => item.fileUrl);
      const params = {
        tenantId,
        companyCode,
        employeeNumber,
        urlList,
        invoiceFileHeaderId,
      };
      const res = await archivesDownload(params);
      if (res && res.status === '1000') {
        const date = moment().format('YYYY-MM-DD HH:mm:ss');
        const blob = new Blob([base64toBlob(res.data)]);
        if ((window.navigator as any).msSaveBlob) {
          try {
            (window.navigator as any).msSaveBlob(blob, `${date}.zip`);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get('hiop.invoiceRule.notification.error.upload').d('下载失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = `${date}.zip`;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      } else {
        notification.error({
          description: '',
          message: res && res.message,
        });
      }
    }
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'recordPeriod' },
      { name: 'bucketName' },
      { name: 'recordTotalSize', renderer: ({ value }) => <span>{value}</span> },
      { name: 'inOutType' },
      { name: 'type', width: 200 },
      { name: 'recordFileNum', renderer: ({ value }) => <span>{value}</span> },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 100,
        command: ({ record }): Commands[] => {
          return [
            <a onClick={() => this.handledDownload(record)}>
              {intl.get('hzero.common.button.download').d('下载')}
            </a>,
          ];
        },
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  get detailColumns(): ColumnProps[] {
    return [
      { name: 'bucketName', width: 140 },
      { name: 'buyerName', width: 260 },
      { name: 'salerName', width: 260 },
      { name: 'invoiceCode', width: 150 },
      { name: 'invoiceNo', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'invoiceAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'entryAccountDate', width: 120 },
      { name: 'recordDate', width: 120 },
      { name: 'recordType', width: 120 },
      { name: 'recordSize', renderer: ({ value }) => <span>{value}</span> },
      { name: 'fileUrl', width: 400 },
    ];
  }

  @Bind()
  openModal() {
    const modal = Modal.open({
      title: intl.get(`${modelCode}.view.title`).d('档案发票明细信息'),
      drawer: true,
      width: 700,
      closable: true,
      children: <Table dataSet={this.detailDS} columns={this.detailColumns} />,
      footer: (
        <Button onClick={() => modal.close()} color={ButtonColor.primary}>
          {intl.get('hzero.common.model.button.close').d('关闭')}
        </Button>
      ),
    });
  }

  render() {
    const { companyDesc, backPath } = this.state;
    return (
      <>
        <Header
          backPath={backPath}
          title={intl.get('hivp.bill.button.fileDownload').d('档案下载')}
        />
        <div className={styles.header}>
          <Form columns={5}>
            <Output
              label={intl.get('htc.common.modal.companyName').d('所属公司')}
              value={companyDesc}
              colSpan={2}
            />
            <Output
              label={intl.get('hivp.batchCheck.view.currentTime').d('当前日期')}
              value={moment().format(DEFAULT_DATE_FORMAT)}
            />
          </Form>
        </div>
        <Content>
          <Table dataSet={this.tableDS} columns={this.columns} style={{ height: 200 }} />
          <Table
            dataSet={this.detailDS}
            columns={this.detailColumns}
            header={intl.get(`${modelCode}.view.title`).d('档案发票明细信息')}
            style={{ height: 200 }}
          />
        </Content>
      </>
    );
  }
}
