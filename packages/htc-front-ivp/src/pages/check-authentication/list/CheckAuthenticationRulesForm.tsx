/*
 * @Description: 进项发票规则维护
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-10-09 14:51:37
 * @LastEditTime: 2022-10-26 11:21:40
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import {
  CheckBox,
  DataSet,
  Form,
  Lov,
  Select,
  TextField,
  DatePicker,
  Tooltip as MyTooltip,
  Button,
} from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';

interface Props {
  dataSet: DataSet;
  manualDataSet: DataSet;
}

const InvoiceRuleHeaderForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet, manualDataSet } = props;
  const reset = () => {
    const { companyCode, companyId, employeeNumber }: any = manualDataSet.toData()[0];
    manualDataSet.reset();
    const { current } = manualDataSet;
    if (current) {
      current.set({
        companyId,
        companyCode,
        employeeNumber,
      });
    }
  };

  return (
    <>
      <Card
        title={
          <div>
            {intl.get('hivp.checkRule.panelTitle.manual').d('勾选认证手动数据获取')}
            <MyTooltip
              placement="right"
              title={intl
                .get('hivp.checkRule.panelTitle.manualTip')
                .d(
                  '输入需要查询的条件，手动获取对应最新各勾选认证状态的发票数据到勾选底账，可在勾选认证功能和报表查看'
                )}
            >
              <Icon
                type="help"
                style={{ marginLeft: '6px', fontSize: 16, color: 'rgb(7, 63, 247)' }}
              />
            </MyTooltip>
          </div>
        }
      >
        <Form dataSet={manualDataSet} columns={4} labelTooltip={Tooltip.overflow}>
          <DatePicker name="invoiceDate" />
          <DatePicker name="invoiceTickDate" />
          <DatePicker name="invoiceInDate" />
          <div>
            <Button color={ButtonColor.primary} type={ButtonType.submit}>
              {intl.get('hivp.checkRule.button.getCheckInvoice').d('获取勾选发票')}
            </Button>
            <Button onClick={reset}>{intl.get('hivp.checkRule').d('重置')}</Button>
          </div>
        </Form>
        <Form dataSet={manualDataSet} columns={4} labelTooltip={Tooltip.overflow}>
          <Select name="deductionType" />
          <Select name="checkStatus" />
          <Select name="certificationStatus" />
          <TextField name="invoiceCode" />
          <TextField name="invoiceNo" />
          <TextField name="sellerTaxpayerNumber" />
          <Select name="certifiedQueryState" />
          <Lov name="certifiedQueryMonthObj" />
        </Form>
        <Form dataSet={manualDataSet} columns={4} labelTooltip={Tooltip.overflow}>
          <Select name="invoiceStyle" maxTagCount={2} maxTagTextLength={2} />
          <Select name="redTicketFlag" />
          <Select name="invoiceStatus" colSpan={2} />
        </Form>
      </Card>
      <Card
        title={
          <div>
            {intl.get('hivp.checkRule.panelTitle.automatic').d('勾选认证自动规则维护')}
            <MyTooltip
              placement="right"
              title={intl
                .get('hivp.checkRule.panelTitle.automaticTip')
                .d(
                  '设置自动获取勾选底账到勾选认证底账库，每日定时获取可勾选，已勾选发票和已认证发票，包含不抵扣勾选发票，可在勾选功能和报表查看。'
                )}
            >
              <Icon
                type="help"
                style={{ marginLeft: '6px', fontSize: 16, color: 'rgb(7, 63, 247)' }}
              />
            </MyTooltip>
          </div>
        }
      >
        <Form dataSet={dataSet} columns={3} labelTooltip={Tooltip.overflow}>
          <CheckBox name="autoDayGetAccounts" />
          <Select name="autoDayGetTime" labelWidth={160} />
        </Form>
        <Form dataSet={dataSet} columns={3} labelTooltip={Tooltip.overflow}>
          <CheckBox name="autoStatisticsSign" />
          <TextField name="mailbox" labelWidth={160} />
          <Select
            name="autoStatisticsTime"
            help={intl
              .get('hivp.checkRule.tip.autoStatisticsTimeTip')
              .d(
                '选择自动统计及确签时间，则会在所属期内所选日期凌晨自动统计；选择时间为操作截止时间前的时间选择，自动统计或确签后会发送结果到接收邮箱。'
              )}
            showHelp={ShowHelp.tooltip}
          />
          <CheckBox name="autoSignatureSign" />
          <TextField name="confirmPassword" />
          <Select name="autoSignatureTime" />
        </Form>
      </Card>
      <Card
        title={
          <div>
            {intl.get('hivp.checkRule.panelTitle.report').d('抵扣报表统计规则维护')}
            <MyTooltip
              placement="right"
              title={intl
                .get('hivp.checkRule.panelTitle.reportTip')
                .d(
                  '维护抵扣应抵报表的默认统计规则，维护的规则将默认带入到抵扣报表页面，支持在报表页面修改'
                )}
            >
              <Icon
                type="help"
                style={{ marginLeft: '6px', fontSize: 16, color: 'rgb(7, 63, 247)' }}
              />
            </MyTooltip>
          </div>
        }
      >
        <Form dataSet={dataSet} columns={3} labelTooltip={Tooltip.overflow}>
          <Lov name="systemCodeObj" maxTagCount={2} maxTagTextLength={2} />
          <Lov name="documentTypeCodeObj" maxTagCount={2} maxTagTextLength={2} />
          <Select name="accountStatus" />
          <Select name="invoiceType" maxTagCount={2} maxTagTextLength={2} />
        </Form>
      </Card>
      <Card
        title={intl.get('hivp.checkRule.panelTitle.incomingInvoiceRules').d('进项发票规则维护')}
      >
        <Form dataSet={dataSet} columns={3}>
          <CheckBox name="relationConFlag" />
          <CheckBox name="accountConFlag" />
        </Form>
      </Card>
    </>
  );
};

export default formatterCollections({
  code: ['hivp.checkRule'],
})(InvoiceRuleHeaderForm);
