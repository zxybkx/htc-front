/**
 * @Description: 手工发票查验
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-07-20 16:19:48
 * @LastEditTime: 2020-12-25 11:42:23
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Dispatch } from 'redux';
import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router-dom';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  Button,
  Currency,
  DataSet,
  DatePicker,
  Form,
  Lov,
  Output,
  TextField,
} from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import withProps from 'utils/withProps';
import { isEmpty } from 'lodash';
import { getCurrentEmployeeInfo } from '@htccommon/services/commonService';
import { addToInvoicePool, handleInvoiceCheckApi } from '@src/services/invoiceCheckService';
import InvoiceCheckQueryDS from '../stores/InvoiceCheckQueryDS';
import style from '../invoiceCheck.module.less';

const modelCode = 'hcan.invoice-check';
interface InvoiceCheckQueryPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  queryDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
})
@withProps(
  () => {
    const queryDS = new DataSet({
      autoQuery: false,
      ...InvoiceCheckQueryDS(),
    });
    return { queryDS };
  },
  { cacheState: true }
)
export default class InvoiceCheckQueryPage extends Component<InvoiceCheckQueryPageProps> {
  tenantId = getCurrentOrganizationId();

  componentDidMount() {
    const dsData = this.props.queryDS.toData();
    const params = { tenantId: this.tenantId };
    getCurrentEmployeeInfo(params).then(resp => {
      if (resp && resp.content) {
        if (isEmpty(dsData)) {
          if (resp.content.length === 1) {
            this.props.queryDS
              .getField('companyName')!
              .set('defaultValue', resp.content[0].companyName);
            this.props.queryDS
              .getField('companyCode')!
              .set('defaultValue', resp.content[0].companyCode);
            this.props.queryDS
              .getField('companyId')!
              .set('defaultValue', resp.content[0].companyId);
            this.props.queryDS
              .getField('employeeNumber')!
              .set('defaultValue', resp.content[0].employeeNum);
            this.props.queryDS
              .getField('employeeId')!
              .set('defaultValue', resp.content[0].employeeId);
            this.props.queryDS.create({
              taxpayerIdentificationNumber: resp.content[0].taxpayerNumber,
            });
          } else {
            this.props.queryDS.create();
          }
        }
      }
    });
  }

  /**
   * 查验
   */
  @Bind()
  async handleInvoiceCheck() {
    const validateValue = await this.props.queryDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const queryData = this.props.queryDS.current!.toData(true);
    const params = { tenantId: this.tenantId, ...queryData };
    const res = await handleInvoiceCheckApi(params);
    if (res && res.status === '0001') {
      notification.success({
        description: '',
        message: res.message,
      });
      this.props.queryDS.current!.set({
        checkStatus: res.status,
        invoiceHeaderId: res.data.invoiceHeaderId,
        invoiceType: res.data.invoiceType,
      });
    } else {
      notification.warning({
        description: '',
        message: res.message,
      });
    }
  }

  /**
   * 查看发票明细
   */
  @Bind()
  handleGotoDetailPage() {
    const invoiceHeaderId = this.props.queryDS.current!.get('invoiceHeaderId');
    const invoiceType = this.props.queryDS.current!.get('invoiceType');
    const { history } = this.props;
    const pathname = `/htc-front-chan/invoice-check/detail/${invoiceHeaderId}/${invoiceType}`;
    history.push(pathname);
  }

  /**
   * 添加至发票池
   */
  @Bind()
  async handleAddToInvoicePool() {
    const curData = this.props.queryDS.current!.toData();
    if (curData) {
      const res = await addToInvoicePool({
        tenantId: this.tenantId,
        companyId: curData.companyId,
        companyCode: curData.companyCode,
        companyName: curData.companyName,
        employeeId: curData.employeeId,
        employeeNum: curData.employeeNumber,
        taxpayerNumber: curData.taxpayerIdentificationNumber,
        invoiceHeaderInfoId: curData.invoiceHeaderId,
      });
      if (res && res.status === 'H1014') {
        notification.success({
          description: '',
          message: res.message || '',
        });
      } else {
        notification.warning({
          description: '',
          message: res.message || '',
        });
      }
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleResetQuery() {
    this.props.queryDS.current!.reset();
  }

  render() {
    const ObserverButtons = observer((props: any) => {
      if (props.dataSet.current && props.dataSet.current.get('checkStatus') === '0001') {
        return (
          <Button key={props.key} onClick={props.onClick}>
            {props.title}
          </Button>
        );
      }
      return <></>;
    });
    const MenuContainer = observer((props: any) => {
      if (props.dataSet.current && props.dataSet.current.get('checkStatus') === '0001') {
        return (
          <span style={{ marginLeft: 10 }}>
            <ObserverButtons
              key="viewDetail"
              onClick={this.handleGotoDetailPage}
              dataSet={this.props.queryDS}
              title={intl.get(`${modelCode}.button.viewDetail`).d('查看全票面信息')}
            />
            <ObserverButtons
              key="addPool"
              onClick={this.handleAddToInvoicePool}
              dataSet={this.props.queryDS}
              title={intl.get(`${modelCode}.button.addPool`).d('添加至发票池')}
            />
          </span>
        );
      }
      return <></>;
    });
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('手工发票查验')} />
        <Content className={style.main}>
          <Output
            name="desc"
            renderer={() => {
              return (
                <span className={style.label}>
                  {intl
                    .get(`${modelCode}.view.checkTips`)
                    .d('查验提示：国税查验平台可以查验五年内的发票')}
                </span>
              );
            }}
          />
          <Form dataSet={this.props.queryDS} className={style.form} columns={1}>
            <Lov name="companyObj" />
            <TextField
              name="taxpayerIdentificationNumber"
              help={intl.get(`${modelCode}.view.editAble`).d('(可修改)')}
            />
            <TextField name="invoiceCode" />
            <TextField
              name="invoiceNumber"
              help={intl.get(`${modelCode}.view.required`).d('(必填)')}
            />
            <DatePicker
              name="invoiceDate"
              help={intl.get(`${modelCode}.view.required`).d('(必填)')}
            />
            <Currency
              name="invoiceAmount"
              help={intl
                .get(`${modelCode}.view.amountDesc`)
                .d(
                  '(增值税专用发票、货运增值税专用发票、机动车销售统一发票必填不含税金额；二手车发票必填发票车价合计；全电发票必填含税金额)'
                )}
            />
            <TextField
              name="checkNumber"
              help={intl
                .get(`${modelCode}.view.checkNumDesc`)
                .d('(增值税普通发票（纸质、电子、卷式）、通行费发票必输)')}
            />
            <div>
              <Button key="check" color={ButtonColor.primary} onClick={this.handleInvoiceCheck}>
                {intl.get(`${modelCode}.button.check`).d('查验')}
              </Button>
              <Button key="reset" onClick={this.handleResetQuery}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <MenuContainer dataSet={this.props.queryDS} />
            </div>
          </Form>
        </Content>
      </>
    );
  }
}
