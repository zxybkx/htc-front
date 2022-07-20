/**
 * @Description:全发票明细
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-07-28 15:03:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { Col, Divider, Icon, Row } from 'choerodon-ui';
import { parseOfdDocument, renderOfdByScale, setPageScale } from 'ofd.js';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { ofdInvoiceResolver } from '../../../services/commonService';

const modelCode = 'htc.invoicesOfd';

interface ArchiveOfdPageProps {
  recordType: String;
  curImgUrl: String;
}

@formatterCollections({
  code: [modelCode, 'htc.common'],
})

export default class ArchiveOfdPage extends Component<ArchiveOfdPageProps> {
  componentDidMount() {
    if (this.props.recordType === 'OFD') {
      this.renderArchives();
    }
  }

  componentDidUpdate() {
    if (this.props.recordType === 'OFD') {
      this.renderArchives();
    }
  }

  renderArchives = () => {
    const { curImgUrl, recordType } = this.props;
    const that = this;
    if (recordType === 'OFD') {
      setPageScale(5);
      parseOfdDocument({
        ofd: curImgUrl,
        success(res) {
          // 输出ofd每页的div
          // const divs = renderOfd(1000, res[0]);
          const divs = renderOfdByScale(res[0]);
          that.displayOfdDiv(divs, res[0]);
        },
        fail(error) {
          notification.warning({
            message: intl.get(`${modelCode}.view.openOFDFail`).d('OFD打开失败'),
            description: error,
          });
        },
      });
      return null;
    }
  };

  displayOfdDiv = (divs, result) => {
    const contentDiv = document.getElementById('ofdImgDiv');
    if (contentDiv) {
      contentDiv.innerHTML = '';
      for (const div of divs) {
        contentDiv.appendChild(div);
      }
      for (const ele of document.getElementsByName('seal_img_div')) {
        this.addEventOnSealDiv(
          ele,
          JSON.parse(ele.dataset.sesSignature || ''),
          // JSON.parse(ele.dataset.signedInfo || ''),
          result
        );
      }
    }
  };

  addEventOnSealDiv = (div, sesSignature, result) => {
    const { curImgUrl } = this.props;
    const ofdInvoiceResolverParams = { ofdUrl: curImgUrl };
    div.addEventListener('click', () => {
      Modal.open({
        key: Modal.key,
        title: intl.get(`${modelCode}.view.ofd.signTitle`).d('验章'),
        maskClosable: true,
        destroyOnClose: true,
        closable: true,
        children: this.renderModal(sesSignature),
        footer: null,
      });
      setPageScale(2);
      let signDiv;
      const scaleDivs = renderOfdByScale(result);
      for (const scaleDiv of scaleDivs) {
        signDiv = scaleDiv.lastChild.previousSibling;
        signDiv.setAttribute('style', '');
      }
      document.getElementById('ofdSignDiv')!.appendChild(signDiv);
      setTimeout(() => {
        // 签章信息
        ofdInvoiceResolver(ofdInvoiceResolverParams).then((res) => {
          if (res) {
            document.getElementById('isModified')!.innerHTML = res.isModified
              ? intl.get(`${modelCode}.view.ofd.modified`).d('本签章文档内容已被修改。')
              : intl
                  .get(`${modelCode}.view.ofd.unModified`)
                  .d('自应用本签章以来，文档内容未被修改。');
            document.getElementById('signatureDate')!.innerHTML = res.signatureDate;
            document.getElementById('company')!.innerHTML = res.company;
            document.getElementById('startTime')!.innerHTML = res.startTime;
            document.getElementById('endTime')!.innerHTML = res.endTime;
            document.getElementById('issuer')!.innerHTML = res.issuer;
            document.getElementById('authorizedTo')!.innerHTML = res.authorizedTo;
            // 有效验证
            // const checkResp = digestCheck((global as any).toBeChecked.get(signedInfo.signatureID));
            document
              .getElementById('checkValid')!
              .setAttribute('style', res.isValid ? 'display:block' : 'display:none');
            document
              .getElementById('checkInvalid')!
              .setAttribute('style', !res.isValid ? 'display:block' : 'display:none');
          }
        });
      }, 1000);
    });
  };

  renderModal = (sesSignature) => {
    return (
      <div>
        <Row>
          <Col span={4}>
            <div id="ofdSignDiv" />
          </Col>
          <Col span={16} style={{ padding: '10px' }}>
            <b>{sesSignature.cert.commonName}</b>
          </Col>
          <Col span={4} style={{ padding: '10px' }}>
            <div id="checkValid" style={{ display: 'none' }}>
              <Icon type="check_circle" style={{ color: 'green' }} />
              {intl.get(`${modelCode}.view.ofd.efficient`).d('有效')}
            </div>
            <div id="checkInvalid" style={{ display: 'block' }}>
              {intl.get(`${modelCode}.view.ofd.checking`).d('查验中...')}
            </div>
          </Col>
        </Row>
        <Divider dashed />
        <Row>
          <Col span={24}>
            <div id="isModified" style={{ marginBottom: '10px' }} />
          </Col>
        </Row>
        <Row style={{ margin: '10px auto' }}>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.signatureDate`).d('签章时间:')}</Col>
          <Col span={20} id="signatureDate" />
        </Row>
        <Row>
          <Col span={24} style={{ margin: '10px auto', color: 'gray' }}>
            {intl.get(`${modelCode}.view.ofd.signInfo`).d('签章印章相关信息')}
          </Col>
        </Row>
        <Row>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.company`).d('厂商：')}</Col>
          <Col span={20} id="company" />
        </Row>
        <Row>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.startTime`).d('起始时间：')}</Col>
          <Col span={20} id="startTime" />
        </Row>
        <Row>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.endTime`).d('结束时间：')}</Col>
          <Col span={20} id="endTime" />
        </Row>
        <Row>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.issuer`).d('颁布者：')}</Col>
          <Col span={20} id="issuer" />
        </Row>
        <Row>
          <Col span={4}>{intl.get(`${modelCode}.view.ofd.authorizedTo`).d('授权给：')}</Col>
          <Col span={20} id="authorizedTo" />
        </Row>
      </div>
    );
  };

  render() {
    return <div id="ofdImgDiv" style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }} />;
  }
}
