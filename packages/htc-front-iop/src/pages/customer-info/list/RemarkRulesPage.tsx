/**
 * @Description:备注规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-09 10:34:21
 * @LastEditTime: 2021-09-29 15:36:51
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Button, CheckBox, DataSet, Form, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import RemarkRulesHeaderDS from '../stores/RemarkRulesHeaderDS';

interface InvoiceQueryTableProps {
  customerInformationId: number; // 客户信息行Id
  onCloseModal: any; // 关闭modal
}

@formatterCollections({
  code: ['hiop.customerInfo', 'htc.common'],
})
export default class InvoiceQueryTable extends Component<InvoiceQueryTableProps> {
  remarkRulesHeaderDS = new DataSet({
    autoQuery: true,
    ...RemarkRulesHeaderDS(this.props),
  });

  /**
   * 保存备注规则
   */
  @Bind()
  handleSaveRemark() {
    this.remarkRulesHeaderDS.submit();
    this.props.onCloseModal();
  }

  render() {
    return (
      <>
        <Form dataSet={this.remarkRulesHeaderDS} columns={2}>
          <TextField name="remarksRulePrefix" />
          <CheckBox name="enableSourceAsDynamic" />
          <TextField name="remarksRulePrefix1" />
          <CheckBox name="enableSourceAsDynamic1" />
          <TextField name="remarksRulePrefix2" />
          <CheckBox name="enableSourceAsDynamic2" />
          <TextField name="remarksRulePrefix3" />
          <CheckBox name="enableSourceAsDynamic3" />
          <TextField name="remarksRulePrefix4" />
          <CheckBox name="enableSourceAsDynamic4" />
        </Form>
        <Button style={{ float: 'right' }} onClick={this.handleSaveRemark}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </>
    );
  }
}
