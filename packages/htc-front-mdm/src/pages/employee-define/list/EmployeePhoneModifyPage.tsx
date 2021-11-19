/*
 * @Description: 员工修改手机号页面
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-02-07 09:10:12
 * @LastEditTime: 2020-03-4 09:47:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import { Button, DataSet, Form, Output, Spin, Table, TextField, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { remove, toNumber } from 'lodash';
import querystring from 'querystring';
import { RouteComponentProps } from 'react-router-dom';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { saveMobileAndCreateAccount } from '@src/services/employeeDefineService';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { routerRedux } from 'dva/router';
import EmployeePhoneModifyHeaderDS from '../stores/EmployeePhoneModifyHeaderDS';
import EmployeePhoneModifyLineDS from '../stores/EmployeePhoneModifyLineDS';
import UpdateEmailDS from '../stores/UpdateEmailDS';

const modelCode = 'mdm.employeeDefine';
const tenantId = getCurrentOrganizationId();

interface RouterInfo {
  companyId: any;
  mobile: any;
}

interface EmployeePhoneModifyPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class EmployeePhoneModifyPage extends Component<EmployeePhoneModifyPageProps> {
  state = {
    isDisabled: true,
  };

  linesDS = new DataSet({
    autoQuery: false,
    ...EmployeePhoneModifyLineDS(),
  });

  headerDS = new DataSet({
    autoQuery: true,
    ...EmployeePhoneModifyHeaderDS(),
  });

  updateEmailDS = new DataSet({
    ...UpdateEmailDS({}),
  });

  componentDidMount() {
    const { search } = this.props.location;
    const phoneInfoStr = new URLSearchParams(search).get('phoneInfo');
    if (phoneInfoStr) {
      const phoneInfo = JSON.parse(decodeURIComponent(phoneInfoStr));
      const { email } = phoneInfo;
      this.updateEmailDS = new DataSet({
        ...UpdateEmailDS(email),
      });
    }
    this.linesDS.setQueryParameter('mobile', this.props.match.params.mobile);
    this.linesDS.query().then((res) => {
      if (res && res.length > 0) {
        remove(
          res,
          (item: any) => toNumber(item.companyId) === toNumber(this.props.match.params.companyId)
        );
        if (res && res.length > 0) {
          this.setState({ isDisabled: false });
        }
      }
    });
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.mobile &&
      prevProps.match.params.mobile !== this.props.match.params.mobile
    ) {
      this.linesDS.setQueryParameter('mobile', this.props.match.params.mobile);
      this.linesDS.query().then(() => {
        const resLen = this.linesDS.map((record) => record.toData()).length;
        if (resLen > 1) {
          this.setState({ isDisabled: false });
        }
      });
    }
  }

  async callUpdate(params) {
    const res = getResponse(await saveMobileAndCreateAccount(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      if (res.data && res.data[0]) {
        const { email, mobile } = res.data[0];
        const pathname = `/htc-front-mdm/employee-define/mobile/${this.props.match.params.companyId}/${mobile}`;
        const { search } = this.props.location;
        const phoneInfoStr = new URLSearchParams(search).get('phoneInfo');
        let curCompany = '';
        if (phoneInfoStr) {
          const phoneInfo = JSON.parse(decodeURIComponent(phoneInfoStr));
          const { companyDesc } = phoneInfo;
          curCompany = companyDesc;
        }
        if (this.updateEmailDS.current) {
          this.updateEmailDS.current!.set('email', email);
          this.updateEmailDS.current!.set('UpdateEmail', '');
        }
        const phoneInfo = { email, companyDesc: curCompany };
        this.setState({ isDisabled: true });
        this.props.dispatch(
          routerRedux.push({
            pathname,
            search: querystring.stringify({
              phoneInfo: encodeURIComponent(JSON.stringify(phoneInfo)),
            }),
          })
        );
        this.linesDS.unSelectAll();
      }
    }
  }

  renderModal() {
    return (
      <Form dataSet={this.updateEmailDS}>
        <TextField name="email" />
        <TextField name="UpdateEmail" />
      </Form>
    );
  }

  async handleOk(modal) {
    const validateValue = await this.updateEmailDS.validate(false, false);
    if (!validateValue) return false;
    const email = this.updateEmailDS.current!.get('email');
    const updateEmail = this.updateEmailDS.current!.get('UpdateEmail');
    const curInfo = this.headerDS.current!.toData();
    const { mobile } = this.props.match.params;
    const { updateMobile } = curInfo;
    let companyIds = this.props.match.params.companyId;
    const list = this.linesDS.map((record) => record.toData());
    const selectlist = this.linesDS.selected.map((record) => record.toData());
    remove(
      list,
      (item: any) => toNumber(item.companyId) === toNumber(this.props.match.params.companyId)
    );
    const listLen = list.length;
    const selectLen = selectlist.length;
    if (selectLen > 0) {
      companyIds += ',';
      companyIds += this.linesDS.selected.map((rec) => rec.toData().companyId).join(',');
    }
    const params = {
      organizationId: tenantId,
      mobile,
      updateMobile,
      companyIds,
      email,
      updateEmail,
      selectAllFlag: listLen === selectLen,
      createAccountFlag: 1,
    };
    this.callUpdate(params);
    modal.close();
  }

  // 保存并新建账户
  @Bind()
  async handleSaveMobileAndCreateAccount(createAccountFlag) {
    if (!this.headerDS.current) {
      notification.warning({
        description: '',
        message: '请填写手机号',
      });
      return;
    }
    const validateValue = await this.headerDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    let companyIds = this.props.match.params.companyId;
    const curInfo = this.headerDS.current!.toData();
    const { mobile } = this.props.match.params;
    const { updateMobile } = curInfo;
    if (this.linesDS.selected.length > 0) {
      companyIds += ',';
      companyIds += this.linesDS.selected.map((rec) => rec.toData().companyId).join(',');
    }
    if (createAccountFlag === 1) {
      // 保存并新建
      const modal = Modal.open({
        key: Modal.key(),
        title: intl.get(`${modelCode}.email.title`).d('修改邮箱'),
        destroyOnClose: true,
        closable: true,
        children: this.renderModal(),
        onOk: () => this.handleOk(modal),
      });
    } else {
      const list = this.linesDS.map((record) => record.toData());
      const selectlist = this.linesDS.selected.map((record) => record.toData());
      remove(
        list,
        (item: any) => toNumber(item.companyId) === toNumber(this.props.match.params.companyId)
      );
      const listLen = list.length;
      const selectLen = selectlist.length;
      if (selectLen > 0) {
        companyIds += ',';
        companyIds += this.linesDS.selected.map((rec) => rec.toData().companyId).join(',');
      }
      const params = {
        organizationId: tenantId,
        mobile,
        updateMobile,
        companyIds,
        createAccountFlag,
        selectAllFlag: listLen === selectLen,
      };
      this.callUpdate(params);
    }
  }

  get columns(): ColumnProps[] {
    return [
      { name: 'companyName', width: 500 },
      { name: 'rolesMeaning', width: 200 },
    ];
  }

  render() {
    const { isDisabled } = this.state;
    const { search } = this.props.location;
    const phoneInfoStr = new URLSearchParams(search).get('phoneInfo');
    let curCompany = '';
    if (phoneInfoStr) {
      const phoneInfo = JSON.parse(decodeURIComponent(phoneInfoStr));
      const { companyDesc } = phoneInfo;
      curCompany = companyDesc;
    }
    return (
      <>
        <Header
          backPath="/htc-front-mdm/employee-define"
          title={intl.get(`${modelCode}.title`).d('修改员工手机号')}
        />
        <Content>
          <Spin dataSet={this.headerDS}>
            <Form columns={6} dataSet={this.headerDS} labelWidth={70}>
              <Output
                label={intl.get(`${modelCode}.view.companyDesc`).d('当前公司')}
                required
                value={curCompany}
                colSpan={2}
              />
              <Output
                label={intl.get(`${modelCode}.view.mobile`).d('当前手机号')}
                value={this.props.match.params.mobile}
                required
                colSpan={1}
                labelWidth={150}
              />
              <TextField name="updateMobile" colSpan={1} />
              <Button
                key="new"
                onClick={() => this.handleSaveMobileAndCreateAccount(0)}
                style={{ marginLeft: '-0.4rem', width: '70px', marginRight: '-3rem' }}
                color={ButtonColor.primary}
              >
                {intl.get(`${modelCode}.button.new`).d('保存')}
              </Button>
              <Button
                key="new"
                onClick={() => this.handleSaveMobileAndCreateAccount(1)}
                style={{ marginLeft: '-1rem', width: '130px' }}
                color={ButtonColor.primary}
                disabled={isDisabled}
              >
                {intl.get(`${modelCode}.button.new`).d('保存并新建账户')}
              </Button>
            </Form>
          </Spin>
          <Table
            dataSet={this.linesDS}
            columns={this.columns}
            queryBar={TableQueryBarType.none}
            filter={(record) => record.get('companyId') !== this.props.match.params.companyId}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
