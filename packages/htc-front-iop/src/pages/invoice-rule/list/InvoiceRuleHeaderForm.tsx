/**
 * @Description: 开票规则表单
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2021-08-26 11:07:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { FunctionComponent } from 'react';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import {
  CheckBox,
  Currency,
  DataSet,
  Form,
  Lov,
  NumberField,
  Select,
  Switch,
  TextField,
  Tooltip as MyTooltip,
} from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { FormLayout } from 'choerodon-ui/pro/lib/form/enum';
import styles from '../invoiceRule.module.less';

interface Props {
  dataSet: DataSet;
}

const InvoiceRuleHeaderForm: FunctionComponent<Props> = (props: Props) => {
  const { dataSet } = props;
  const handleMergeRule = (e) => {
    dataSet.current!.set({ applyCodePriceFlag: e && e.includes('01') ? 'Y' : 'N' });
    dataSet.current!.set({ mergeFlag: e && e.includes('02') ? 'Y' : 'N' });
  };
  return (
    <>
      <Card title={intl.get('hiop.invoiceRule.title.basicInvoiceRule').d('基础开票规则')}>
        <Form dataSet={dataSet} columns={2} labelTooltip={Tooltip.overflow}>
          <Select name="codeTableVersions" />
          <Select name="productType" />
          <Select name="invoiceStyleCode" />
          <CheckBox name="purchaseInvoiceFlag" />
          {/*---*/}
          <Lov name="defaultInvoiceTypeObj" />
          <Select name="limitInvoiceCode" />
          <Lov name="defaultPayeeObj" />
          <CheckBox name="drawerPayeeFlag" />
          {/*---*/}
          <Select name="drawerRulesCode" />
          <Lov name="globalDrawerObj" />
          <Lov name="defaultReviewerObj" />
          <Select name="invoicePrintMethod" />
          {/*---*/}
          <Select name="invoiceCompletionNotice" labelWidth={120} />
          <Select name="invoiceExceptionNotice" labelWidth={190} />
          {/*---*/}
          {/* <Select name="mergeRule" labelWidth={120} onChange={(e) => handleMergeRule(e)} />
          <Select name="businessFieldSplits" labelWidth={190} /> */}
          <Select name="autoApprovalRules" />
          <Select name="qrCodeInvalid" />
        </Form>
      </Card>
      <Card title={intl.get('hiop.invoiceRule.view.mergeRule').d('合并拆分规则')}>
        <Form dataSet={dataSet} columns={2} labelTooltip={Tooltip.overflow}>
          <Select name="mergeRules" labelWidth={190} onChange={(e) => handleMergeRule(e)} />
          <Select name="businessFieldSplits" labelWidth={210} />
          <Select name="prepareAutoMerge" />
          <Select name="sourceNumberMerges" />
          <NumberField name="unitPriceTolerance" />
        </Form>
      </Card>
      <Card title={intl.get('hiop.invoiceRule.view.remind').d('发票库存提醒')}>
        <Form dataSet={dataSet} columns={2} labelTooltip={Tooltip.overflow}>
          <NumberField
            name="inventoryRemindLimit"
            formatterOptions={{ options: { useGrouping: false } }}
            labelWidth={130}
          />
          <TextField name="inventoryRemindEmail" />
          <TextField name="inventoryRemindPhone" />
        </Form>
      </Card>
      <Card title={intl.get('hiop.invoiceRule.view.offlineRemind').d('离线发票提醒')}>
        <Form dataSet={dataSet} columns={2} labelTooltip={Tooltip.overflow}>
          <Currency name="offLineAmountLimit" labelWidth={130} />
          {/* <TextField name="offLineRemindPhone" /> */}
          <TextField name="offLineRemindEmail" />
          <NumberField name="offLineTimeLimit" labelWidth={130} />
        </Form>
      </Card>
      <Card title={intl.get('hiop.invoiceRule.view.permissionManage').d('权限管理')}>
        <Form dataSet={dataSet} columns={2} labelTooltip={Tooltip.overflow}>
          <CheckBox name="invoiceApplyFlag" />
          <CheckBox name="invoiceWorkbenchFlag" />
          <Lov name="invoiceRequestListObj" labelWidth={164} />
          <Lov name="invoiceWorkbenchListObj" labelWidth={220} />
          <CheckBox name="invoicePrepareFlag" />
          <CheckBox name="distributionInvoiceFlag" />
          <Lov name="invoicePrepareListObj" labelWidth={164} />
          <CheckBox name="distinguishReviewerFlag" />
        </Form>
      </Card>
      <Card
        title={
          <div>
            {intl.get('hiop.invoiceRule.view.dyRemarkRule').d('动态备注生成规则')}
            <MyTooltip
              placement="topLeft"
              title={intl
                .get('hiop.invoiceRule.view.MyTooltip')
                .d(
                  '维护备注规则的前缀、备注取值字段，使自开票申请单传入的相关字段自动组合生成最终发票开具的备注'
                )}
            >
              <Icon type="help" style={{ fontSize: 16, color: '#D0DA8B' }} />
            </MyTooltip>
          </div>
        }
        extra={
          <div>
            <Form layout={FormLayout.none} dataSet={dataSet} className={styles.switchContainer}>
              <Switch name="enableRulesFlag" />
              {/* <span style={{marginLeft:'10px',fontSize:'14px'}}>已启用</span> */}
            </Form>
          </div>
        }
      >
        <Form dataSet={dataSet} columns={6} labelTooltip={Tooltip.overflow}>
          {/*---*/}
          <CheckBox name="enableApplyOneFlag" colSpan={1} />
          <TextField name="dynamicPrefixOne" colSpan={2} labelWidth={60} />
          <CheckBox name="enableApplyTwoFlag" colSpan={1} />
          <TextField name="dynamicPrefixTwo" colSpan={2} />
          {/*---*/}
          <CheckBox name="enableApplyThreeFlag" newLine />
          <TextField name="dynamicPrefixThree" colSpan={2} />

          <CheckBox name="enableApplyFourFlag" />
          <TextField name="dynamicPrefixFour" colSpan={2} />
        </Form>
      </Card>
    </>
  );
};

export default formatterCollections({
  code: ['hiop.invoiceRule'],
})(InvoiceRuleHeaderForm);
