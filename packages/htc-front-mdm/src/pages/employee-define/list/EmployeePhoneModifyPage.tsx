/**
 * @Description: 员工修改手机号页面
 * @version: 1.0
 * @Author: wenqi.ma@hand-china.com
 * @Date: 2020-02-07 09:10:12
 * @LastEditTime: 2020-03-4 09:47:28
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { Button, DataSet, Form, Select, Spin, Table, TextField } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { remove, toNumber } from 'lodash';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { saveMobileAndCreateAccount } from '@src/services/employeeDefineService';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import EmployeePhoneModifyHeaderDS from '../stores/EmployeePhoneModifyHeaderDS';
import EmployeePhoneModifyLineDS from '../stores/EmployeePhoneModifyLineDS';

const modelCode = 'mdm.employeeDefine';
const tenantId = getCurrentOrganizationId();

interface EmployeePhoneModifyPageProps {
  onCloseModal: any;
  mobile: string;
  companyId: any;
  email: string;
  internationalTelCode: string;
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
    ...EmployeePhoneModifyLineDS(this.props),
  });

  headerDS = new DataSet({
    autoQuery: true,
    ...EmployeePhoneModifyHeaderDS(this.props),
  });

  componentDidMount() {
    const { companyId } = this.props;
    this.headerDS.create({}, 0);
    this.linesDS.query().then(res => {
      if (res && res.length > 0) {
        remove(res, (item: any) => toNumber(item.companyId) === toNumber(companyId));
        if (res.length > 0) {
          this.setState({ isDisabled: false });
        }
      }
    });
  }

  /**
   * 保存并新建账户调接口
   * @params {object} params-参数
   */
  async callUpdate(params) {
    const res = getResponse(await saveMobileAndCreateAccount(params));
    if (res) {
      notification.success({
        description: '',
        message: res.message,
      });
      if (res.data && res.data[0]) {
        this.props.onCloseModal();
      }
    }
  }

  /**
   * 保存并新建账户
   * @params {number} createAccountFlag 0-保存 1-保存并新建账户
   */
  @Bind()
  async handleSaveMobileAndCreateAccount(createAccountFlag) {
    const validateValue = await this.headerDS.validate(false, false);
    // 页面校验
    if (!validateValue) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
      return;
    }
    const { email, mobile, companyId } = this.props;
    const list = this.linesDS.map(record => record.toData());
    const selectlist = this.linesDS.selected.map(record => record.toData());
    remove(list, (item: any) => toNumber(item.companyId) === toNumber(companyId));
    const listLen = list.length;
    const selectLen = selectlist.length;
    let companyIds = companyId;
    if (selectLen > 0) {
      companyIds += ',';
      companyIds += this.linesDS.selected.map(rec => rec.toData().companyId).join(',');
    }
    const curInfo = this.headerDS.current!.toData();
    if (createAccountFlag === 1) {
      // 保存并新建
      const updateEmail = this.headerDS.current!.get('updateEmail');
      if (!updateEmail) {
        notification.warning({
          description: '',
          message: '请填写邮箱',
        });
        return;
      }
      const params = {
        ...curInfo,
        organizationId: tenantId,
        mobile,
        companyIds,
        email,
        selectAllFlag: listLen === selectLen,
        createAccountFlag: 1,
      };
      this.callUpdate(params);
    } else {
      // 保存
      const params = {
        ...curInfo,
        organizationId: tenantId,
        mobile,
        companyIds,
        createAccountFlag,
        selectAllFlag: listLen === selectLen,
      };
      this.callUpdate(params);
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [{ name: 'companyName' }, { name: 'rolesMeaning' }];
  }

  render() {
    const { isDisabled } = this.state;
    return (
      <>
        <Content>
          <Spin dataSet={this.headerDS}>
            <Form columns={2} dataSet={this.headerDS}>
              <Select name="internationalTelCode" />
              <TextField name="updateMobile" />
              <TextField name="updateEmail" />
            </Form>
          </Spin>
          <Table
            dataSet={this.linesDS}
            columns={this.columns}
            queryBar={TableQueryBarType.none}
            filter={record => record.get('companyId') !== this.props.companyId}
            // style={{ height: 400 }}
          />
          <div style={{ position: 'absolute', right: '0.3rem', bottom: '0.3rem' }}>
            <Button key="cancel" onClick={() => this.props.onCloseModal()}>
              {intl.get(`${modelCode}.button.cancel`).d('取消')}
            </Button>
            <Button
              key="save"
              onClick={() => this.handleSaveMobileAndCreateAccount(0)}
              color={ButtonColor.primary}
            >
              {intl.get(`${modelCode}.button.save`).d('保存')}
            </Button>
            <Button
              key="saveAndCreate"
              onClick={() => this.handleSaveMobileAndCreateAccount(1)}
              color={ButtonColor.primary}
              disabled={isDisabled}
            >
              {intl.get(`${modelCode}.button.saveAndCreate`).d('保存并新建账户')}
            </Button>
          </div>
        </Content>
      </>
    );
  }
}
