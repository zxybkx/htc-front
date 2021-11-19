/*
 * @module -outageNotice :
 * @Author: huishan.yu<huishan.yu@hand-china.com>
 * @Date: 2021-09-17 10:16:53
 * @LastEditors: huishan.yu
 * @LastEditTime: 2021-09-17 10:16:53
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  // RichText,
  TextField,
  Form,
  DatePicker,
  Button,
  Switch,
  TextArea,
  DataSet,
} from 'choerodon-ui/pro';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import OutageNoticeDS, { modelCode } from '../stores/outageNoticeDS';

interface OutageNoticeDetailPageProps {
  dispatch: Dispatch<any>;
}
@connect()
export default class OutageNoticeDetailPage extends Component<OutageNoticeDetailPageProps> {
  outageNoticeDS = new DataSet({
    autoQuery: true,
    ...OutageNoticeDS(),
  });

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
        <Header title={intl.get(`${modelCode}.title`).d('停机信息维护')}>
          <Button
            color={ButtonColor.primary}
            type={ButtonType.button}
            onClick={() => this.handleSaveNotice(1)}
          >
            发布
          </Button>
          <Button
            color={ButtonColor.primary}
            type={ButtonType.button}
            onClick={() => this.handleSaveNotice(0)}
          >
            保存
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
            {/* <RichText
                  label={intl.get(`${modelCode}.view.noticeContext`).d("公告内容")}
                  newLine
                  name='noticeContext'
                  colSpan={3}
                  required
                  style={{height:'4rem'}}
                /> */}
          </Form>
        </Content>
      </>
    );
  }
}
