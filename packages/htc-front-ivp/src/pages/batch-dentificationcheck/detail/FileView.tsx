import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { toUpper, set } from 'lodash';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import { urlTojpg } from '@src/services/invoicesService';
import formatterCollections from 'utils/intl/formatterCollections';
import InvoicesHeadersDS from '../stores/FileViewDS';

const modelCode = 'hivp.invoicesArchiveView';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface ArchiveViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}
@formatterCollections({
  code: [modelCode, 'hcan.invoiceDetail', 'hivp.invoicesArchiveUpload'],
})
export default class FileView extends Component<ArchiveViewPageProps> {
  state = {
    recordType: '',
    curImgUrl: '',
    viewerVisible: false,
    fileName: 'archive',
  };

  queryDS = new DataSet({
    autoQuery: false,
    ...InvoicesHeadersDS(),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      const fileType = `${toUpper(invoiceInfo.fileTypeMeaning)}${intl
        .get('hcan.invoiceDetail.view.type')
        .d('类型')}`;
      set(invoiceInfo, 'recordType', fileType);
      this.queryDS.create(invoiceInfo, 0);
      const { companyCode, employeeNum } = invoiceInfo;
      const recordType = invoiceInfo.fileTypeMeaning;
      let curImgUrl = invoiceInfo.fileUrl;
      if (recordType === 'ofd') {
        const params = {
          tenantId,
          companyCode,
          employeeNumber: employeeNum,
          file: curImgUrl,
          encryptCode: 0,
        };
        const pdfRes = getResponse(await urlTojpg(params));
        if (pdfRes && pdfRes.status === '1000') {
          curImgUrl = pdfRes.data;
        }
      }
      this.setState({
        recordType,
        curImgUrl,
        fileName: invoiceInfo.fileName,
      });
    }
  }

  setViewerVisible = () => {
    this.setState({ viewerVisible: false });
  };

  renderArchives = () => {
    const { curImgUrl, recordType, viewerVisible, fileName } = this.state;
    const _recordType = toUpper(recordType);
    if (curImgUrl) {
      const bucketName = 'hivp';
      const tokenUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
        curImgUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;

      if (_recordType === 'PDF') {
        return <iframe title="archive" src={tokenUrl} height="600" width="90%" frameBorder="0" />;
      } else if (_recordType === 'OFD') {
        return (
          <div>
            <img
              style={{ maxWidth: '50%' }}
              alt="archiveShow"
              src={`data:image/jpeg;base64,${curImgUrl}`}
              onClick={() => {
                this.setState({ viewerVisible: true });
              }}
            />
            <Viewer
              visible={viewerVisible}
              onClose={this.setViewerVisible}
              onMaskClick={this.setViewerVisible}
              images={[{ src: `data:image/jpeg;base64,${curImgUrl}`, alt: fileName }]}
            />
          </div>
        );
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

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-ivp/batch-check/list"
          title={intl.get('hivp.invoicesArchiveUpload.path.viewArchives').d('档案查看')}
        />
        <Content>
          <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
              {this.renderArchives()}
            </Col>
          </Row>
          <Form dataSet={this.queryDS} columns={7}>
            <Output name="invoiceCode" />
            <Output name="invoiceNumber" />
            <Output name="invoiceDate" />
            <Output name="amount" />
            <Output name="invoiceType" colSpan={2} />
            <Output name="recordType" />
          </Form>
          <Form columns={7}>
            <Output
              name="documentNumber"
              label={intl.get('hivp.invoicesArchiveUpload.view.documentNumber').d('单据编号')}
            />
            <Output
              name="documentSourceKey"
              colSpan={2}
              label={intl.get('hivp.invoicesArchiveUpload.view.documentSourceKey').d('单据关键字')}
            />
            <Output
              name="documentRemark"
              colSpan={2}
              label={intl.get('hivp.invoicesArchiveUpload.view.documentRemark').d('单据描述')}
            />
            <Output
              name="relationInvoiceQuantity"
              label={intl
                .get('hivp.invoicesArchiveUpload.view.relationInvoiceQuantity')
                .d('关联发票数量')}
            />
          </Form>
        </Content>
      </>
    );
  }
}
