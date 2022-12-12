import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { openTab } from 'utils/menuTab';
import ExcelExport from 'components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import DetailDS from '../stores/DetailDS';

const modelCode = 'hivp.invoicesArchiveUpload';
const API_PREFIX = commonConfig.IVP_API || '';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  uploadArchivesId: string;
  sourceCode: string;
  companyId: string;
}
interface ArchiveUploadPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.batchCheck', 'hivp.bill', 'hivp.invoicesFileArchive'],
})
export default class UploadDetail extends Component<ArchiveUploadPageProps> {
  detailDS = new DataSet({
    autoQuery: false,
    ...DetailDS(),
  });

  async componentDidMount() {
    const { uploadArchivesId } = this.props.match.params;
    this.detailDS.setQueryParameter('uploadArchivesId', uploadArchivesId);
    this.detailDS.query();
  }

  // 查看档案
  @Bind()
  async handleGotoArchiveView(invoicePoolHeaderId) {
    const { sourceCode } = this.props.match.params;
    const pathname = `/htc-front-ivp/invoices/archive-view/${sourceCode}/${invoicePoolHeaderId}`;
    openTab({
      key: pathname,
      path: pathname,
      title: intl.get(`${modelCode}.path.viewArchives`).d('查看档案'),
      closable: true,
    });
  }

  get columns(): ColumnProps[] {
    return [
      {
        name: 'uploadFileName',
        width: 240,
        renderer: ({ text, record }) => {
          const identifyState = record?.get('identifyState');
          const identifyStateMeaning = record?.getField('identifyState')?.getText(identifyState);
          const invoicePoolHeaderId = record?.get('invoicePoolHeaderId');
          let color = '';
          let textColor = '';
          switch (identifyState) {
            case 'RECOGNITION_FINISHED':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'RECOGNITION_ABNORMAL':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {identifyStateMeaning}
              </Tag>
              &nbsp;
              {invoicePoolHeaderId ? (
                <a onClick={() => this.handleGotoArchiveView(invoicePoolHeaderId)}>{text}</a>
              ) : (
                <span>{text}</span>
              )}
            </>
          );
        },
      },
      { name: 'fileType', width: 120 },
      { name: 'dataCheckState', width: 120 },
      { name: 'uploadStatus', width: 120 },
      { name: 'existFileName', width: 240 },
      { name: 'invoiceType', width: 160 },
      { name: 'invoiceCode', width: 160 },
      { name: 'invoiceNo' },
      { name: 'invoiceDate', width: 120 },
      { name: 'invoiceAmount' },
    ];
  }

  // 导出
  @Bind()
  exportParams() {
    const { uploadArchivesId } = this.props.match.params;
    const queryParams = this.detailDS.queryDataSet!.map(data => data.toData()) || {};
    const _queryParams = {
      uploadArchivesId,
      ...queryParams[0],
    };
    return { ..._queryParams } || {};
  }

  render() {
    const { sourceCode, companyId } = this.props.match.params;
    let backPath = `/htc-front-ivp/invoices/batch-upload/${sourceCode}/${companyId}`;
    if (sourceCode === 'BILL_POOL') {
      backPath = `/htc-front-ivp/bills/batch-upload/${sourceCode}/${companyId}`;
    }
    return (
      <>
        <Header
          backPath={backPath}
          title={intl.get(`${modelCode}.title.fileMatching`).d('档案匹配')}
        >
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/archives-update/export-invoice-upload-file`}
            queryParams={() => this.exportParams()}
          />
        </Header>
        <Content>
          <Table dataSet={this.detailDS} columns={this.columns} />
        </Content>
      </>
    );
  }
}
