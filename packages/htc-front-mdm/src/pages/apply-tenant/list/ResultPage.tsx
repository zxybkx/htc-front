/**
 * @Description: 租户信息失效结果页
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-18 17:06:22
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { Result } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({
  code: ['hmdm.applyTenant'],
})
export default class ResultPage extends Component {
  render() {
    return (
      <Content>
        <Result
          status="warning"
          title={intl
            .get('hmdm.applyTenant.view.message.linkInvalid')
            .d('该链接已失效，请联系汇税通管理员重新申请!')}
        />
      </Content>
    );
  }
}
