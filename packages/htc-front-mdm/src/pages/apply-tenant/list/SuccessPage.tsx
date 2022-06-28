/**
 * @Description: 租户信息成功结果页
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-19 16:48:22
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { Result } from 'choerodon-ui';

const modelCode = 'hmdm.apply-tenant-result';

export default class ResultPage extends Component {
  render() {
    return (
      <Content>
        <Result
          status="success"
          title={intl
            .get(`${modelCode}.view.info`)
            .d('管理员已收到您的开通申请，请您注意接收邮件开通通知')}
        />
      </Content>
    );
  }
}
