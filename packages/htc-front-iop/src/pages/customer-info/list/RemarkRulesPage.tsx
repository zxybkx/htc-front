/*
 * @Description:备注规则
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-09 10:34:21
 * @LastEditTime:
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Form, Button, TextField, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { Bind } from 'lodash-decorators';
// import { concat } from 'lodash';
import RemarkRulesHeaderDS from '../stores/RemarkRulesHeaderDS';

const modelCode = 'hiop.invoice-query';

interface InvoiceQueryTableProps {
  customerInformationId: number; // 客户信息行Id
  onCloseModal: any; // 关闭modal
}

export default class InvoiceQueryTable extends Component<InvoiceQueryTableProps> {
  remarkRulesHeaderDS = new DataSet({
    autoQuery: true,
    ...RemarkRulesHeaderDS(this.props),
  });

  @Bind()
  handleSave() {
    this.remarkRulesHeaderDS.submit();
    this.props.onCloseModal();
  }

  render() {
    return (
      <>
        <Form dataSet={this.remarkRulesHeaderDS} columns={2}>
          <TextField name="dynamicRemarksRulePrefix" />
          <CheckBox name="enableApplySourceAsDynamic" />
          <TextField name="dynamicRemarksRulePrefixOne" />
          <CheckBox name="enableApplySourceAsDynamicOne" />
          <TextField name="dynamicRemarksRulePrefixTwo" />
          <CheckBox name="enableApplySourceAsDynamicTwo" />
          <TextField name="dynamicRemarksRulePrefixThree" />
          <CheckBox name="enableApplySourceAsDynamicThree" />
          <TextField name="dynamicRemarksRulePrefixFour" />
          <CheckBox name="enableApplySourceAsDynamicFour" />
        </Form>
        <Button style={{ float: 'right' }} color={ButtonColor.dark} onClick={this.handleSave}>
          {intl.get(`${modelCode}.save`).d('保存')}
        </Button>
      </>
    );
  }
}
