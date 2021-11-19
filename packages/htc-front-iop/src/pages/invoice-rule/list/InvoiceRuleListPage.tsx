import React, { Component } from 'react';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import { Dispatch } from 'redux';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DataSet, Form, Button, Lov, Output, Table, Spin } from 'choerodon-ui/pro';
import { Row, Col, Divider } from 'choerodon-ui';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { base64toBlob } from '@common/utils/utils';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getRegistry } from '@src/services/invoiceOrderService';
import InvoiceRuleHeaderForm from './InvoiceRuleHeaderForm';
import InvoiceRuleHeaderDS from '../stores/InvoiceRuleHeaderDS';
import InvoiceRuleLinesDS from '../stores/InvoiceRuleLinesDS';

const modelCode = 'hiop.invoice-rule';
const tenantId = getCurrentOrganizationId();

interface InvoiceRuleListPageProps {
  dispatch: Dispatch<any>;
}

@formatterCollections({
  code: [modelCode],
})
export default class InvoiceRuleListPage extends Component<InvoiceRuleListPageProps> {
  state = { curCompanyId: '' };

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

  async componentDidMount() {
    const res = await getCurrentEmployeeInfoOut({ tenantId });
    if (res && res.content) {
      const empInfo = res.content[0];
      const { queryDataSet } = this.invoiceHeaderDS;
      if (queryDataSet && queryDataSet.current) {
        queryDataSet.current!.set({ companyObj: empInfo });
        this.handleQueryNew();
      }
    }
  }

  // 查询为空则新建
  @Bind()
  async handleQueryNew() {
    const { queryDataSet } = this.invoiceHeaderDS;
    if (queryDataSet) {
      const validateValue = await queryDataSet.validate(false, false);
      if (!validateValue) {
        this.setState({ curCompanyId: '' });
        return;
      }
    }
    const companyInfo = queryDataSet && queryDataSet.current!.get('companyObj');
    if (companyInfo && companyInfo.companyId) {
      this.invoiceHeaderDS.query().then(() => {
        if (this.invoiceHeaderDS.length === 0) {
          this.invoiceHeaderDS.create(
            {
              companyId: companyInfo.companyId,
              companyName: companyInfo.companyName,
            },
            0
          );
        }
      });
    }
    this.setState({ curCompanyId: companyInfo && companyInfo.companyId });
  }

  /**
   * 行信息
   */
  get lineColumns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'operationTypeCode', editor: true, width: 140 },
      { name: 'employeeNumObj', editor: true, width: 140 },
      { name: 'employeeName', width: 140 },
      { name: 'qualifiedAuditorObj', editor: true, width: 400 },
      { name: 'applyBusinessCode', editor: true, width: 150 },
      // { name: 'purchaseInvoiceFlag', editor: true, width: 100 },
      { name: 'limitInvoiceTypeObj', editor: true, width: 400 },
      { name: 'defaultInvoiceTypeObj', editor: true, width: 160 },
      { name: 'limitExtensionCodeObj', editor: true, width: 120 },
      { name: 'printFileDownloadPath', editor: true, width: 250 },
      { name: 'enabledFlag', editor: true, renderer: ({ value }) => enableRender(value) },
    ];
  }

  /**
   * 保存
   * @returns
   */
  @Bind()
  async handleSave() {
    const {
      inventoryRemindLimit,
      inventoryRemindEmail,
      inventoryRemindPhone,
    } = this.invoiceHeaderDS.current?.toData();
    if (inventoryRemindLimit && !inventoryRemindEmail && !inventoryRemindPhone) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.inventoryRemind`)
          .d('填写了发票库存提醒，则需填写邮件或短信提醒值'),
      });
      return;
    }
    const res = await this.invoiceHeaderDS.submit(false, false);
    if (res === undefined) {
      notification.warning({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.noChange').d('请先修改数据'),
      });
    }
  }

  /**
   * 新增行
   * @returns
   */
  @Bind()
  handleAddLine() {
    const currentData = this.invoiceHeaderDS.current;
    if (currentData) {
      const rulesHeaderId = currentData.get('rulesHeaderId');
      const companyId = currentData.get('companyId');
      const companyName = currentData.get('companyName');
      this.invoiceLinesDS.create({ rulesHeaderId, companyId, companyName }, 0);
    } else {
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.newHeader`).d('请先新增头数据'),
      });
    }
  }

  // 修改注册表
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
      const blob = new Blob([base64toBlob(res.data)]);
      if (window.navigator.msSaveBlob) {
        try {
          window.navigator.msSaveBlob(blob, 'protocol.reg');
        } catch (e) {
          notification.error({
            description: '',
            message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
          });
        }
      } else {
        const aElement = document.createElement('a');
        const blobUrl = window.URL.createObjectURL(blob);
        aElement.href = blobUrl; // 设置a标签路径
        aElement.download = 'protocol.reg';
        aElement.click();
        window.URL.revokeObjectURL(blobUrl);
      }
      notification.info({
        description: '',
        message: intl.get(`${modelCode}.view.printInfo`).d('文件下载完成后，请双击运行文件'),
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
      <Button icon="playlist_add" key="add" onClick={() => this.handleAddLine()}>
        {intl.get('hzero.common.button.add ').d('新增')}
      </Button>,
      TableButtonType.delete,
      <Button key="editRegistry" onClick={() => this.editRegistry()}>
        {intl.get('hzero.common.button.editRegistry ').d('下载注册表文件')}
      </Button>,
    ];
  }

  render() {
    const { curCompanyId } = this.state;
    return (
      <PageHeaderWrapper
        title={intl.get(`${modelCode}.title`).d('开票规则维护')}
        header={
          <Button
            onClick={() => this.handleSave()}
            color={ButtonColor.dark}
            disabled={!curCompanyId}
          >
            {intl.get('hzero.common.btn.save').d('保存')}
          </Button>
        }
      >
        <Row type="flex" align="middle">
          <Col span={20}>
            <Form dataSet={this.invoiceHeaderDS.queryDataSet} columns={2}>
              <Lov name="companyObj" onChange={() => this.handleQueryNew()} />
              <Output name="employeeDesc" />
            </Form>
          </Col>
          <Col span={4}>
            <Button color={ButtonColor.primary} onClick={() => this.handleQueryNew()}>
              {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
            </Button>
          </Col>
        </Row>
        <Divider />
        <Spin dataSet={this.invoiceHeaderDS}>
          <InvoiceRuleHeaderForm dataSet={this.invoiceHeaderDS} />
        </Spin>
        <Table
          dataSet={this.invoiceLinesDS}
          columns={this.lineColumns}
          buttons={this.lineButtons}
          style={{ height: 200 }}
        />
      </PageHeaderWrapper>
    );
  }
}
