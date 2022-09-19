/**
 * @Description: 开票规则页面
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-11-24 10:56:29
 * @LastEditTime: 2021-08-26 11:07:59
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  Button,
  DataSet,
  Form,
  Lov,
  Modal,
  Select,
  Spin,
  Switch,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { Col, Row, Tabs, Tag } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { downLoadFiles } from '@htccommon/utils/utils';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getRegistry } from '@src/services/invoiceOrderService';
import InvoiceRuleHeaderForm from './InvoiceRuleHeaderForm';
import InvoiceRuleHeaderDS from '../stores/InvoiceRuleHeaderDS';
import InvoiceRuleLinesDS from '../stores/InvoiceRuleLinesDS';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();

enum ModalFnType {
  confirmAndAdd,
  confirm,
}

interface InvoiceRuleListPageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: ['hiop.invoiceRule', 'hiop.invoiceWorkbench', 'htc.common'],
})
export default class InvoiceRuleListPage extends Component<InvoiceRuleListPageProps> {
  state = {
    curCompanyId: '',
  };

  invoiceLinesDS = new DataSet({
    autoQuery: false,
    ...InvoiceRuleLinesDS(),
  });

  invoiceHeaderDS = new DataSet({
    autoQuery: false,
    ...InvoiceRuleHeaderDS(),
    children: {
      linesInfos: this.invoiceLinesDS,
    },
  });

  @Bind()
  async componentDidMount() {
    const res = await getCurrentEmployeeInfoOut({ tenantId });
    if (res && res.content) {
      const empInfo = res.content[0];
      const { queryDataSet } = this.invoiceHeaderDS;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current.set({ companyObj: empInfo });
        this.loadData(empInfo);
        const companyInfo = queryDataSet.current.get('companyObj');
        this.setState({ curCompanyId: companyInfo.companyId });
      }
    }
  }

  @Bind()
  loadData(empInfo) {
    this.invoiceHeaderDS.query().then(() => {
      if (this.invoiceHeaderDS.length === 0) {
        this.invoiceHeaderDS.create(
          {
            companyId: empInfo.companyId,
            companyName: empInfo.companyName,
          },
          0
        );
      }
    });
  }

  /**
   * 行信息
   * @return {*[]}
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'employeeNumObj',
        editor: true,
        width: 180,
        renderer: ({ text, record }) => {
          if (record!.get('enabledFlag') === 1) {
            return (
              <>
                <Tag color="#D6FFD7" style={{ color: '#19A633' }}>
                  {intl.get('htc.common.view.enable').d('已启用')}
                </Tag>
                {text}
              </>
            );
          } else {
            return (
              <>
                <Tag color="#F0F0F0" style={{ color: '#6C6C6C' }}>
                  {intl.get('htc.common.view.disable').d('已禁用')}
                </Tag>
                {text}
              </>
            );
          }
        },
      },
      { name: 'employeeName', width: 140 },
      { name: 'operationTypeCode', editor: true, width: 140 },
      { name: 'qualifiedAuditorObj', editor: true, width: 400 },
      { name: 'applyBusinessCode', editor: true, width: 150 },
      { name: 'limitInvoiceTypeObj', editor: true, width: 400 },
      { name: 'defaultInvoiceTypeObj', editor: true, width: 160 },
      { name: 'limitExtensionCodeObj', editor: true, width: 120 },
      { name: 'printFileDownloadPath', editor: true, width: 250 },
      { name: 'invoiceDownloadPath', editor: true, width: 250 },
      { name: 'listDownloadPath', editor: true, width: 250 },
      { name: 'enabledFlag', editor: true, renderer: ({ value }) => enableRender(value) },
    ];
  }

  /**
   * 发票行保存
   * @params {object} modalCallBack
   */
  @Bind()
  async handleInvoiceLinesSave(modalCallBack) {
    const res = await this.invoiceHeaderDS.submit(false, false);
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
      });
    } else {
      const currentData = this.invoiceHeaderDS.current;
      if (currentData) {
        this.invoiceLinesDS.query().then(() => {
          const rulesHeaderId = currentData.get('rulesHeaderId');
          const companyId = currentData.get('companyId');
          const companyName = currentData.get('companyName');
          const record = this.invoiceLinesDS.create({ rulesHeaderId, companyId, companyName }, 0);
          modalCallBack.update(this.modalConfigObj(record, modalCallBack));
        });
      }
    }
  }

  /**
   * 开票规则保存
   */
  @Bind()
  async handleSaveInvoiceRule() {
    const {
      inventoryRemindLimit,
      inventoryRemindEmail,
      inventoryRemindPhone,
    } = this.invoiceHeaderDS.current?.toData();
    if (inventoryRemindLimit && !inventoryRemindEmail && !inventoryRemindPhone) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceRule.notification.inventoryRemind')
          .d('填写了发票库存提醒，则需填写邮件或短信提醒值'),
      });
      return;
    }
    const fileValids = await this.invoiceHeaderDS.validate();
    if (!fileValids) return false;
    const res = await this.invoiceHeaderDS.submit(false, false);
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('htc.common.notification.noChange').d('请先修改数据'),
      });
    } else {
      const { queryDataSet } = this.invoiceHeaderDS;
      const empInfo = queryDataSet?.current?.get('companyObj');
      this.loadData(empInfo);
    }
  }

  /**
   * 新增行
   */
  @Bind()
  handleAddLine() {
    const currentData = this.invoiceHeaderDS.current;
    if (currentData) {
      const rulesHeaderId = currentData.get('rulesHeaderId');
      const companyId = currentData.get('companyId');
      const companyName = currentData.get('companyName');
      this.openModal(this.invoiceLinesDS.create({ rulesHeaderId, companyId, companyName }, 0));
    } else {
      notification.info({
        description: '',
        message: intl.get('htc.common.validation.addHeader').d('请先新增头数据'),
      });
    }
  }

  /**
   * 删除注册表
   */
  @Bind()
  async deleteRegistry() {
    const currentData = this.invoiceLinesDS.selected;
    this.invoiceLinesDS.delete(currentData);
  }

  /**
   * 修改注册表
   */
  @Bind()
  async editRegistry() {
    const companyCode =
      this.invoiceHeaderDS.queryDataSet &&
      this.invoiceHeaderDS.queryDataSet.current!.get('companyCode');
    const employeeId =
      this.invoiceHeaderDS.queryDataSet &&
      this.invoiceHeaderDS.queryDataSet.current!.get('employeeId');
    const employeeNumber =
      this.invoiceHeaderDS.queryDataSet &&
      this.invoiceHeaderDS.queryDataSet.current!.get('employeeNum');
    const params = {
      tenantId,
      employeeNumber,
      employeeId,
      companyCode,
    };
    const res = getResponse(await getRegistry(params));
    if (res && res.status === '1000') {
      const fileList = [
        {
          data: res.data,
          fileName: 'protocol.reg',
        },
      ];
      downLoadFiles(fileList);
      // const blob = new Blob([base64toBlob(res.data)]);
      // if (window.navigator.msSaveBlob) {
      //   try {
      //     window.navigator.msSaveBlob(blob, 'protocol.reg');
      //   } catch (e) {
      //     notification.error({
      //       description: '',
      //       message: intl.get('hiop.invoiceRule.notification.error.upload').d('下载失败'),
      //     });
      //   }
      // } else {
      //   const aElement = document.createElement('a');
      //   const blobUrl = window.URL.createObjectURL(blob);
      //   aElement.href = blobUrl; // 设置a标签路径
      //   aElement.download = 'protocol.reg';
      //   aElement.click();
      //   window.URL.revokeObjectURL(blobUrl);
      // }
      notification.info({
        description: '',
        message: intl
          .get('hiop.invoiceRule.notification.mess.printInfo')
          .d('文件下载完成后，请双击运行文件'),
      });
    } else {
      notification.warning({
        description: '',
        message: res && res.message,
      });
    }
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get lineButtons(): Buttons[] {
    return [
      <Button key="delete" color={ButtonColor.default} onClick={() => this.deleteRegistry()}>
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
      <Button key="editRegistry" color={ButtonColor.default} onClick={() => this.editRegistry()}>
        {intl.get('hiop.invoiceRule.button.editRegistry').d('下载注册表文件')}
      </Button>,
      <Button icon="playlist_add" onClick={this.handleAddLine}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
    ];
  }

  @Bind()
  setHeaderValue(queryDataSet, value) {
    if (queryDataSet) {
      queryDataSet.current!.set({ companyObj: value });
      if (value) {
        this.invoiceHeaderDS.query().then(() => {
          if (this.invoiceHeaderDS.length === 0) {
            this.invoiceHeaderDS.create(
              {
                companyId: value.companyId,
                companyName: value.companyName,
              },
              0
            );
          }
        });
      }
    }
  }

  @Bind()
  handleModalOk(queryDataSet, oldValue) {
    this.handleSaveInvoiceRule().then(res => {
      if (res === false) {
        queryDataSet?.current!.set({ companyObj: oldValue });
      }
    });
  }

  /**
   * 公司改变回调
   * @params {object} value-当前值
   * @params {object} oldValue-旧值
   */
  @Bind()
  async handleCompanyChange(value, oldValue) {
    const { queryDataSet } = this.invoiceHeaderDS;
    const { current } = this.invoiceLinesDS;
    if (current) current.set({ operationType: undefined });
    if (this.invoiceHeaderDS.dirty) {
      await Modal.confirm({
        title: intl.get('htc.common.view.changeRemind').d('当前页面有修改信息未保存！'),
        children: (
          <span style={{ fontSize: '12px' }}>
            {intl
              .get('hiop.invoiceRule.message.operation')
              .d('点击下方“确定”按钮，即可保存，或点击“取消”放弃保存内容')}
          </span>
        ),
        onOk: async () => {
          this.handleModalOk(queryDataSet, oldValue);
        },
        onCancel: () => {
          this.setHeaderValue(queryDataSet, value);
        },
      });
    } else {
      this.setHeaderValue(queryDataSet, value);
    }
  }

  /**
   * 保存回调
   * @params {object} modalCallBack
   * @params {object} tag-保存/保存并新建
   */
  @Bind()
  async handleModalConfirm(modalCallBack, tag) {
    const validateValue = await this.invoiceLinesDS.validate(false, false);
    if (validateValue) {
      if (tag === ModalFnType.confirmAndAdd) {
        this.handleInvoiceLinesSave(modalCallBack);
      } else {
        this.handleSaveInvoiceRule();
        modalCallBack.close();
      }
    }
  }

  /**
   * modal取消回调
   * @params {object} record-当前值
   * @params {object} modalCallBack
   */
  @Bind()
  async handleModalCancel(record, modalCallBack) {
    modalCallBack.close();
    this.invoiceLinesDS.remove(record);
  }

  /**
   * 渲染modal内容
   * @params {object} record-当前值
   * @params {object} modalCallBack
   */
  @Bind()
  modalConfigObj(record, modalCallBack?) {
    let backObj = {};
    if (record) {
      backObj = {
        ...backObj,
        // closable: true,
        title: intl.get('hiop.invoiceRule.modal.title').d('新增开票人员规则'),
        drawer: true,
        width: 480,
        children: (
          <Form record={record} labelTooltip={Tooltip.overflow}>
            <Lov name="employeeNumObj" />
            <TextField name="employeeName" disabled />
            <Select name="operationTypeCode" />
            <Lov name="qualifiedAuditorObj" />
            <Select name="applyBusinessCode" />
            <Lov name="limitInvoiceTypeObj" />
            <Lov name="defaultInvoiceTypeObj" />
            <Lov name="limitExtensionCodeObj" />
            <TextField name="printFileDownloadPath" />
            <TextField name="invoiceDownloadPath" />
            <TextField name="listDownloadPath" />
            <Switch name="enabledFlag" />
          </Form>
        ),
      };
    }
    if (modalCallBack) {
      backObj = {
        ...backObj,
        footer: () => {
          return (
            <div>
              <Button
                color={ButtonColor.primary}
                onClick={() => this.handleModalConfirm(modalCallBack, ModalFnType.confirm)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                color={ButtonColor.default}
                style={{ color: '#3889FF', borderColor: '#3889FF' }}
                onClick={() => this.handleModalConfirm(modalCallBack, ModalFnType.confirmAndAdd)}
              >
                {intl.get('htc.common.button.saveAndCreate').d('保存并新建')}
              </Button>
              <Button
                color={ButtonColor.default}
                onClick={() => this.handleModalCancel(record, modalCallBack)}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </div>
          );
        },
      };
    }
    return backObj;
  }

  /**
   * 渲染modal
   * @params {object} record-当前值
   */
  @Bind()
  openModal(record) {
    const modalCallBack = Modal.open({
      // closable: true,
      ...this.modalConfigObj(record),
      footer: () => {
        return (
          <div>
            <Button
              color={ButtonColor.primary}
              onClick={() => this.handleModalConfirm(modalCallBack, ModalFnType.confirm)}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              color={ButtonColor.default}
              style={{ color: '#3889FF', borderColor: '#3889FF' }}
              onClick={() => this.handleModalConfirm(modalCallBack, ModalFnType.confirmAndAdd)}
            >
              {intl.get('htc.common.button.saveAndCreate').d('保存并新建')}
            </Button>
            <Button
              color={ButtonColor.default}
              onClick={() => this.handleModalCancel(record, modalCallBack)}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </div>
        );
      },
    });
  }

  render() {
    const { curCompanyId } = this.state;

    return (
      <>
        <Header title={intl.get('hiop.invoiceRule.title.invoiceRule').d('开票规则维护')} />
        <Content style={{ paddingBottom: '60px' }}>
          <Row type="flex">
            <Col span={20}>
              <Form dataSet={this.invoiceHeaderDS.queryDataSet} columns={3}>
                <Lov
                  dataSet={this.invoiceHeaderDS.queryDataSet}
                  name="companyObj"
                  onChange={this.handleCompanyChange}
                />
                <TextField name="taxpayerNumber" />
                <TextField name="employeeDesc" />
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                onClick={() => this.handleSaveInvoiceRule()}
                color={ButtonColor.primary}
                disabled={!curCompanyId}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Col>
          </Row>
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={intl.get('hiop.invoiceRule.title.basicInvoiceRule').d('基础开票规则')}
              key="1"
            >
              <Spin dataSet={this.invoiceHeaderDS}>
                <InvoiceRuleHeaderForm dataSet={this.invoiceHeaderDS} />
              </Spin>
            </TabPane>
            <TabPane
              tab={intl.get('hiop.invoiceRule.title.invoiceStaffInfo').d('开票人员信息')}
              key="2"
            >
              <Table
                dataSet={this.invoiceLinesDS}
                columns={this.lineColumns}
                buttons={this.lineButtons}
                style={{ height: 500 }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
