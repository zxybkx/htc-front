import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Form, Output, Button } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getResponse,
  // isTenantRoleLevel,
} from 'utils/utils';
// import { urlTojpg, fileStream } from '@src/services/invoicesService';
import { fileStream } from '@src/services/invoicesService';
import { downLoadFiles } from '@htccommon/utils/utils';
import SubPageBillHeadersDS from '@src/pages/bill-pool/stores/SubPageBillHeadersDS';
import SubPageInvoicesHeadersDS from '@src/pages/invoices/stores/SubPageInvoicesHeadersDS';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { toLower } from 'lodash';
// import { downloadFile, DownloadFileParams } from 'hzero-front/lib/services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import ArchiveViewDS from '../stores/ArchiveViewDS';

const modelCode = 'hivp.invoicesArchiveUpload';
const tenantId = getCurrentOrganizationId();
const bucketName = 'hivp';
interface RouterInfo {
  sourceCode: string;
  sourceHeaderId: any;
}
interface ArchiveViewPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode, 'htc.common'],
})
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
      // const companyCode = this.queryDS.current && this.queryDS.current.get('companyCode');
      // const employeeNumber = this.queryDS.current && this.queryDS.current.get('employeeNum');
      const fileName = this.queryDS.current && this.queryDS.current.get('fileName');

      const fileUrl = this.queryDS.current && this.queryDS.current.get('fileUrl');
      const res = getResponse(await fileStream({ tenantId, fileUrl, fileType: recordType }));
      console.log('res', res);
      if (res && res.status === '1000') {
        curImgUrl = res.data;
      }
      // if (recordType === 'OFD') {
      //   const params = {
      //     tenantId,
      //     companyCode,
      //     employeeNumber,
      //     file: curImgUrl,
      //     encryptCode: 0,
      //   };
      //   const pdfRes = getResponse(await urlTojpg(params));
      //   if (pdfRes && pdfRes.status === '1000') {
      //     curImgUrl = pdfRes.data;
      //   }
      // }
      // if(!fileName) {
      //   const fileUrl = this.queryDS.current && this.queryDS.current.get('fileUrl');
      //   const res = getResponse(await fileStream({tenantId, fileUrl, fileType: recordType}));
      //   if(res){
      //     curImgUrl = res.data;
      //   }
      // }
      this.setState({
        curImgUrl,
        recordType,
        fileName,
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

  // 下载
  @Bind()
  handledDownload() {
    const { curImgUrl, recordType } = this.state;
    let suffix;
    if (recordType === 'OFD') {
      suffix = 'jpg';
    } else {
      suffix = recordType === 'PDF' ? 'pdf' : toLower(recordType);
    }
    const fileList = [
      {
        data: curImgUrl,
        fileName: `档案系统调阅档案.${suffix}`,
      },
    ];
    downLoadFiles(fileList, 0);
    // if(fileName) {
    //   const fileUrl = this.queryDS.current && this.queryDS.current.get('fileUrl');
    //   const queryParams = [
    //     { name: 'url', value: encodeURIComponent(fileUrl) },
    //     { name: 'bucketName', value: bucketName },
    //   ];
    //   const tempTenantId = isTenantRoleLevel() ? `${tenantId}/` : '';
    //   const api = `${HZERO_FILE}/v1/${tempTenantId}files/download`;
    //   downloadFile({
    //     requestUrl: api,
    //     queryParams,
    //   } as DownloadFileParams).then(result => {
    //     // 获取返回信息，不做处理
    //     getResponse(result, null);
    //   });
    // } else {
    //   let suffix;
    //   if(recordType === 'OFD') {
    //     suffix = 'jpg';
    //   } else {
    //     suffix = recordType === 'PDF' ? 'pdf' : toLower(recordType);
    //   }
    //   const aElement = document.createElement('a');
    //   aElement.href = `data:image/jpeg;base64,${curImgUrl}`; // 设置a标签路径
    //   aElement.download = `档案系统调阅档案.${suffix}`;
    //   aElement.click();
    // }
  }

  setViewerVisible = () => {
    this.setState({ viewerVisible: false });
  };

  renderArchives = () => {
    const { curImgUrl, recordType, viewerVisible, fileName } = this.state;
    if (curImgUrl) {
      const tokenUrl = `${HZERO_FILE}/v1/${tenantId}/file-preview/by-url?url=${encodeURIComponent(
        curImgUrl
      )}&bucketName=${bucketName}&access_token=${getAccessToken()}`;

      if (recordType === 'PDF') {
        return (
          <iframe
            title="archive"
            src={fileName ? tokenUrl : `data:image/jpeg;base64,${curImgUrl}`}
            height="600"
            width="90%"
            frameBorder="0"
          />
        );
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
              images={[
                { src: `data:image/jpeg;base64,${curImgUrl}`, alt: fileName || '档案系统调阅档案' },
              ]}
            />
          </div>
        );
      } else {
        return (
          <div>
            <img
              style={{ maxWidth: '50%' }}
              alt="archiveShow"
              src={fileName ? tokenUrl : `data:image/jpeg;base64,${curImgUrl}`}
              onClick={() => {
                this.setState({ viewerVisible: true });
              }}
            />
            <Viewer
              visible={viewerVisible}
              onClose={this.setViewerVisible}
              onMaskClick={this.setViewerVisible}
              images={[
                {
                  src: fileName ? tokenUrl : `data:image/jpeg;base64,${curImgUrl}`,
                  alt: fileName || '档案系统调阅档案',
                },
              ]}
            />
          </div>
        );
      }
    }
    return <div />;
  };

  test = () => {
    const { curImgUrl } = this.state;
    return (
      <iframe
        title="archive"
        src={`data:image/jpeg;base64,${curImgUrl}`}
        height="600"
        width="90%"
        frameBorder="0"
      />
    );
  };

  render() {
    const { backPath } = this.state;
    return (
      <>
        <Header backPath={backPath} title={intl.get(`${modelCode}.view.file`).d('档案查看')}>
          <Button color={ButtonColor.primary} onClick={() => this.handledDownload()}>
            {intl.get('hzero.common.button.download').d('下载')}
          </Button>
        </Header>
        <Content>
          <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
              {this.test()}
            </Col>
          </Row>
          <Form dataSet={this.queryDS} columns={7}>
            <Output name="invoiceCode" />
            <Output name="invoiceNo" />
            <Output name="invoiceDate" />
            <Output name="invoiceAmount" />
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
