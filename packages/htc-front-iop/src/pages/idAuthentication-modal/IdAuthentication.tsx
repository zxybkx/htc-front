/**
 * @Description: 税控信息-身份认证弹窗
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2023-01-09 15:00
 * @LastEditTime:
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Alert, Icon } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import QRCode from 'qrcode';
import { faceRecognitionQRcode } from '@src/services/taxInfoService';
import styles from './idAuthentication.less';

interface IdAuthenticationProps {
  onCloseModal: any;
  companyCode: string;
  taxpayerNumber: string;
  employeeId: string;
}

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['hiop.taxInfo', 'hiop.invoiceWorkbench', 'htc.common', 'hiop.redInvoiceInfo'],
})
export default class IdAuthentication extends Component<IdAuthenticationProps> {
  state = {
    loading: true,
    invalid: false,
  };

  componentDidMount(): void {
    const img = document.getElementById('qrcode');
    img!.setAttribute('style', 'background: #000; opacity: 0.5');
    this.getQrCode(0);
  }

  interval;

  // 渲染二维码
  @Bind()
  renderOrCode(text) {
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 1,
      width: 200,
    };
    QRCode.toDataURL(text, opts, (err, url) => {
      if (err) throw err;
      const img: any = document.getElementById('qrcode');
      img.src = url;
    });
  }

  /**
   * 获取qrcode_id
   * @params {number} type 0-初始/1-刷新、重新获取
   */
  @Bind()
  async getQrCode(type) {
    clearInterval(this.interval);
    const img = document.getElementById('qrcode');
    if (type === 1) {
      img!.setAttribute('style', 'background: #000; opacity: 0.5');
      this.setState({
        loading: true,
        invalid: false,
      });
    }
    const { companyCode, taxpayerNumber, employeeId } = this.props;
    const params = { tenantId, companyCode, taxpayerNumber, employeeId };
    const text = '加载二维码中...';
    this.renderOrCode(text);
    const res = getResponse(await faceRecognitionQRcode(params));
    if (res && !isEmpty(res)) {
      img!.setAttribute('style', 'background: none');
      this.setState({ loading: false });
      this.renderOrCode(res);
      this.timeFiveMinutes();
    }
  }

  // 计时5分钟
  @Bind()
  timeFiveMinutes() {
    let time = 5 * 60;
    const img = document.getElementById('qrcode');
    this.interval = setInterval(() => {
      time--;
      if (time < 0) {
        this.setState({ invalid: true });
        img!.setAttribute('style', 'background: #000; opacity: 0.1');
        clearInterval(this.interval);
      }
    }, 1000);
  }

  // 认证成功，继续开票
  @Bind()
  handleContinue() {
    clearInterval(this.interval);
    this.props.onCloseModal();
    notification.success({
      description: '',
      message: intl.get('hzero.common.notification.success').d('操作成功'),
    });
  }

  render() {
    const { loading, invalid } = this.state;
    return (
      <>
        <Alert
          message={intl
            .get('hiop.taxInfo.modal.notification.safe')
            .d('为了您开票的安全便捷、稳定可靠，请按照指引完成身份认证处理。')}
          type="info"
          showIcon
        />
        <div className={styles.contain}>
          <span className={styles.topBtn}>
            {intl.get('hiop.taxInfo.modal.button.electronicTax').d('电子税务局APP扫脸认证')}
          </span>
          <p style={{ marginTop: 15, fontSize: '14px' }}>
            {intl.get('hiop.taxInfo.modal.notification.pleaseUse').d('请使用')}
            &nbsp;
            <span style={{ fontWeight: 'bold' }}>
              {intl.get('hiop.taxInfo.modal.notification.taxationAPP').d('上海税务APP')}
            </span>
            &nbsp;
            {intl.get('hiop.taxInfo.modal.notification.scanQRCode').d(' 扫描二维码进行身份认证')}
          </p>
          <div className={styles.qrcode}>
            {loading && (
              <div className={styles.loadInfo}>
                <Icon type="sync" style={{ color: 'rgb(7, 63, 247)' }} />
                <span className={styles.loading}>
                  {intl.get('hiop.taxInfo.modal.notification.loadingQR').d('加载二维码中...')}
                </span>
              </div>
            )}
            {invalid && (
              <div className={styles.invalidInfo}>
                <span className={styles.invalidMessage}>
                  {intl.get('hiop.taxInfo.modal.notification.QRcodeInvild').d('二维码已失效')}
                </span>
                <Button onClick={() => this.getQrCode(1)} icon="sync" color={ButtonColor.primary}>
                  {intl.get('hiop.taxInfo.modal.button.refresh').d('请刷新')}
                </Button>
              </div>
            )}
            <div>
              <img src="" alt="" id="qrcode" />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button color={ButtonColor.primary} onClick={() => this.handleContinue()}>
            {intl.get('hiop.taxInfo.modal.button.continue').d('认证成功，继续开票')}
          </Button>
          <Button color={ButtonColor.primary} onClick={() => this.getQrCode(1)}>
            {intl.get('hiop.taxInfo.modal.button.reAcquire').d('重新获取二维码')}
          </Button>
        </div>
      </>
    );
  }
}
