import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Button, Form, Output, Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import notification from 'utils/notification';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import { HZERO_FILE } from 'utils/config';
import { getAccessToken } from 'utils/utils';
import ArchiveOfdPage from '@htccommon/pages/invoice-common/ofd-view/index';
import formatterCollections from 'utils/intl/formatterCollections';
import ArchiveViewPubDS from '../stores/ArchiveViewPubDS';

const modelCode = 'hivp.invoicesArchiveUpload';

interface RouterInfo {
  invoicePoolHeaderId: any;
}
interface ArchiveViewPubPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'htc.common', 'hivp.bill'],
})
export default class ArchiveViewPubPage extends Component<ArchiveViewPubPageProps> {
  state = {
    recordType: '',
    curImgUrl: '',
    viewerVisible: false,
    fileName: 'archive',
    tenantId: '',
  };

  queryDS = new DataSet({
    autoQuery: false,
    ...ArchiveViewPubDS(),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const searchParams = new URLSearchParams(search);
    if (searchParams) {
      const tenantId = searchParams.get('tenantId');
      if (tenantId) {
        this.queryDS.setQueryParameter('tenantId', tenantId);
      }
      const companyCode = searchParams.get('companyCode');
      if (companyCode) {
        this.queryDS.setQueryParameter('companyCode', companyCode);
      }
      const invoiceCode = searchParams.get('invoiceCode');
      if (invoiceCode) {
        this.queryDS.setQueryParameter('invoiceCode', invoiceCode);
      }
      const invoiceNo = searchParams.get('invoiceNo');
      if (invoiceNo) {
        this.queryDS.setQueryParameter('invoiceNo', invoiceNo);
      }
      const documentNumber = searchParams.get('documentNumber');
      if (documentNumber) {
        this.queryDS.setQueryParameter('documentNumber', documentNumber);
      }
      if (tenantId || companyCode || invoiceCode || invoiceNo || documentNumber) {
        this.queryDS.query().then(() => {
          this.setState({
            tenantId,
            curImgUrl: this.queryDS.current && this.queryDS.current.get('fileUrl'),
            recordType: this.queryDS.current && this.queryDS.current.get('recordType'),
            fileName: this.queryDS.current && this.queryDS.current.get('fileName'),
          });
        });
      }
    }
  }

  handleQuery = () => {
    const queryData = this.queryDS.queryDataSet!.current!.toData();
    // 互斥或存在
    if (
      (queryData && (queryData.invoiceCode || queryData.invoiceNo) && queryData.documentNumber) ||
      !(queryData && (queryData.invoiceCode || queryData.invoiceNo || queryData.documentNumber))
    ) {
      notification.info({
        message: intl.get(`${modelCode}.view.queryParams`).d('请输入发票或单据编号'),
        description: '',
      });
      return;
    }
    this.queryDS.query().then(() => {
      if (this.queryDS.length > 0) {
        this.setState({
          curImgUrl: this.queryDS.current?.get('fileUrl'),
          recordType: this.queryDS.current?.get('recordType'),
        });
      } else {
        this.queryDS.create({}, 0);
        this.setState({
          curImgUrl: '',
          recordType: '',
        });
      }
    });
  };

  // 上一张
  handleShowLast = () => {
    this.queryDS.pre();
    this.setState({
      curImgUrl: this.queryDS.current && this.queryDS.current.get('fileUrl'),
      recordType: this.queryDS.current && this.queryDS.current.get('recordType'),
      fileName: this.queryDS.current && this.queryDS.current.get('fileName'),
    });
  };

  // 下一张
  handleShowNext = () => {
    this.queryDS.next();
    this.setState({
      curImgUrl: this.queryDS.current && this.queryDS.current.get('fileUrl'),
      recordType: this.queryDS.current && this.queryDS.current.get('recordType'),
      fileName: this.queryDS.current && this.queryDS.current.get('fileName'),
    });
  };

  setViewerVisible = () => {
    this.setState({ viewerVisible: false });
  };

  renderArchives = () => {
    const { curImgUrl, recordType, viewerVisible, fileName, tenantId } = this.state;
    if (curImgUrl) {
      const bucketName = 'hivp';
      const tokenUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
        curImgUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;

      if (recordType === 'PDF') {
        return <iframe title="archive" src={tokenUrl} height="600" width="90%" frameBorder="0" />;
      } else if (recordType === 'OFD') {
        return <ArchiveOfdPage recordType={recordType} curImgUrl={tokenUrl} />;
      } else {
        return (
          <div>
            <img
              style={{ maxWidth: '50%' }}
              alt="archiveShow"
              src={tokenUrl}
              onClick={() => this.setState({ viewerVisible: true })}
            />
            <Viewer
              visible={viewerVisible}
              onClose={this.setViewerVisible}
              onMaskClick={this.setViewerVisible}
              images={[{ src: tokenUrl, alt: fileName }]}
            />
          </div>
        );
      }
    }
    return <div />;
  };

  // 下载
  handledDownload = () => {
    const { curImgUrl } = this.state;
    try {
      if (curImgUrl) {
        const aElement = document.createElement('a');
        aElement.href = `${curImgUrl}?response-content-type=application/octet-stream`;
        aElement.download = '';
        aElement.click();
      }
    } catch (e) {
      console.log('handledDownload', e);
    }
  };

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.view.file`).d('档案查看')}>
          <Button
            onClick={() => this.handledDownload()}
            // color={ButtonColor.dark}
            disabled={!this.queryDS.length}
          >
            {intl.get('hzero.common.button.download').d('下载')}
          </Button>
          <Button onClick={() => this.handleShowNext()} disabled={!this.queryDS.length}>
            {intl.get(`${modelCode}.button.next`).d('下一张')}
          </Button>
          <Button onClick={() => this.handleShowLast()} disabled={!this.queryDS.length}>
            {intl.get(`${modelCode}.button.previous`).d('上一张')}
          </Button>
        </Header>
        <Content>
          <Spin dataSet={this.queryDS}>
            <Row>
              <Col span={24} style={{ textAlign: 'center' }}>
                {this.renderArchives()}
              </Col>
            </Row>
            <Form dataSet={this.queryDS} columns={7}>
              <Output name="invoiceCode" />
              <Output name="invoiceNo" />
              <Output name="invoiceDate" />
              <Output name="invoiceAmount" />
              <Output name="invoiceTypeMeaning" colSpan={2} />
              <Output name="recordTypeMeaning" />
              <Output name="documentNumber" />
              <Output name="documentSourceKey" colSpan={2} />
              <Output name="documentRemark" colSpan={2} />
              <Output name="relationInvoiceQuantity" />
            </Form>
          </Spin>
        </Content>
      </>
    );
  }
}
