import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getResponse } from 'utils/utils';
import { urlTojpg } from '@src/services/invoicesService';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import ArchiveViewDS from '../stores/ArchiveViewDS';

const modelCode = 'hivp.invoices.archiveView';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface ArchiveViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@connect()
export default class ArchiveViewPage extends Component<ArchiveViewPageProps> {
  state = {
    recordType: '',
    curImgUrl: '',
    backPath: '',
    viewerVisible: false,
    fileName: 'archive',
  };

  queryDS = new DataSet({
    autoQuery: false,
    ...SubPageInvoicesHeadersDS({
      invoicePoolHeaderId: this.props.match.params.sourceHeaderId,
    }),
  });

  queryDocDS = new DataSet({
    autoQuery: false,
    ...ArchiveViewDS(),
  });

  componentDidMount() {
    const { sourceCode, sourceHeaderId } = this.props.match.params;
    const { search } = this.props.location;
    const invoiceInfoStr = new URLSearchParams(search).get('invoiceInfo');
    if (invoiceInfoStr) {
      const invoiceInfo = JSON.parse(decodeURIComponent(invoiceInfoStr));
      this.setState({
        backPath: invoiceInfo.backPath,
      });
      // 来自单据关联
      if (invoiceInfo.documentNumber) {
        this.queryDocDS.setQueryParameter('documentNumber', invoiceInfo.documentNumber);
        this.queryDocDS.setQueryParameter('documentTypeCode', invoiceInfo.documentTypeCode);
        this.queryDocDS.setQueryParameter('systemCode', invoiceInfo.systemCode);
        this.queryDocDS.setQueryParameter('sourceCode', sourceCode);
        this.queryDocDS.setQueryParameter('invoicePoolHeaderId', sourceHeaderId);
        this.queryDocDS.query();
      }
    }
    if (this.props.match.params.sourceCode === 'BILL_POOL') {
      this.queryDS = new DataSet({
        autoQuery: false,
        ...SubPageBillHeadersDS({
          billPoolHeaderId: sourceHeaderId,
        }),
      });
    }
    this.queryDS.query().then(async () => {
      const recordType = this.queryDS.current && this.queryDS.current.get('recordType');
      let curImgUrl = this.queryDS.current && this.queryDS.current.get('fileUrl');
      const companyCode = this.queryDS.current && this.queryDS.current.get('companyCode');
      const employeeNumber = this.queryDS.current && this.queryDS.current.get('employeeNum');
      if (recordType === 'OFD') {
        const params = {
          tenantId,
          companyCode,
          employeeNumber,
          file: curImgUrl,
          encryptCode: 0,
        };
        const pdfRes = getResponse(await urlTojpg(params));
        if (pdfRes && pdfRes.status === '1000') {
          curImgUrl = pdfRes.data;
        }
      }
      this.setState({
        curImgUrl,
        recordType,
        fileName: this.queryDS.current && this.queryDS.current.get('fileName'),
      });
    });
  }

  // 上一张
  handleShowLast = () => {
    this.queryDS.pre();
    this.setState({
      curImgUrl: this.queryDS.current && this.queryDS.current.get('fileUrl'),
      recordType: this.queryDS.current && this.queryDS.current.get('recordType'),
      fileName: this.queryDS.current && this.queryDS.current.get('fileName'),
    });
  };

  // 上一张
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
    const { curImgUrl, recordType, viewerVisible, fileName } = this.state;
    if (curImgUrl) {
      const bucketName = 'hivp';
      const tokenUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
        curImgUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;

      if (recordType === 'PDF') {
        return <iframe title="archive" src={tokenUrl} height="600" width="90%" frameBorder="0" />;
      } else if (recordType === 'OFD') {
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
              onClick={() => {
                this.setState({ viewerVisible: true });
              }}
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
    const { backPath } = this.state;
    return (
      <>
        <Header backPath={backPath} title={intl.get(`${modelCode}.title`).d('档案查看')} />
        <Content>
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
            {/* <Output name="invoiceType" colSpan={2} /> */}
            {this.props.match.params.sourceCode === 'BILL_POOL' ? (
              <Output name="billType" colSpan={2} />
            ) : (
              <Output name="invoiceType" colSpan={2} />
            )}
            <Output name="recordType" />
          </Form>
          <Form dataSet={this.queryDocDS} columns={7}>
            <Output name="documentNumber" />
            <Output name="documentSourceKey" colSpan={2} />
            <Output name="documentRemark" colSpan={2} />
            <Output name="relationInvoiceQuantity" />
          </Form>
        </Content>
      </>
    );
  }
}
