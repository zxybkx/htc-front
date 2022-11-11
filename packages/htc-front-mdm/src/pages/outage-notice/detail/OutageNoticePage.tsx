/**
 * @Description: 停机信息维护
 * @Author: huishan.yu<huishan.yu@hand-china.com>
 * @Date: 2021-09-17 10:16:53
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-17 10:16:53
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Button, DataSet, DatePicker, Form, Switch, TextArea, TextField } from 'choerodon-ui/pro';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import OutageNoticeDS from '../stores/OutageNoticeDS';

interface OutageNoticeDetailPageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hmdm.outageNotice', 'hiop.invoiceRule'],
})
export default class OutageNoticePage extends Component<OutageNoticeDetailPageProps> {
  outageNoticeDS = new DataSet({
    autoQuery: true,
    ...OutageNoticeDS(),
  });

  /**
   * 发布/保存回调
   * @params {number} type 0-保存 1-发布
   */
  async handleSaveNotice(type) {
    this.outageNoticeDS.current!.set('type', type);
    const res = await this.outageNoticeDS.submit();
    if (res === false) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('校验不通过！'),
      });
    }
  }

  render() {
    return (
      <>
        <Header
          title={intl
            .get('hmdm.outageNotice.title.shutdownInformationMaintenance')
            .d('停机信息维护')}
        >
          <Button
            color={ButtonColor.primary}
            type={ButtonType.button}
            onClick={() => this.handleSaveNotice(1)}
          >
            {intl.get('hzero.common.btn.release').d('发布')}
          </Button>
          <Button
            color={ButtonColor.primary}
            type={ButtonType.button}
            onClick={() => this.handleSaveNotice(0)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Form columns={4} dataSet={this.outageNoticeDS}>
            <TextField name="noticeTitle" colSpan={2} />
            <DatePicker newLine name="startDate" />
            <DatePicker name="endDate" />
            <Switch newLine name="isEnable" />
            <Switch newLine name="sendEmail" />
            <Switch labelWidth={200} name="sendEmailToAdmin" />
            <TextArea name="specialEmail" newLine colSpan={2} labelWidth={150} />
            <TextArea name="noticeContext" newLine colSpan={2} labelWidth={150} />
          </Form>
        </Content>
      </>
    );
  }
}
