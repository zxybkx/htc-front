/**
 * @Description:商品信息页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-04-08 10:16:35
 * @LastEditTime: 2021-12-14 14:11:35
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { RouteComponentProps } from 'react-router-dom';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { Button, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import CommodityMapListDS from '../stores/CommodityMapListDS';
import AssignCommodity from './AssignCommodityListPage';

interface CommodityInfoPageProps extends RouteComponentProps {
  match: any;
}

@formatterCollections({
  code: ['hiop.customerInfo', 'htc.common', 'hiop.invoiceWorkbench', 'hiop.invoiceReq'],
})
export default class CommodityPage extends Component<CommodityInfoPageProps> {
  state = { recordData: {} as any };

  commodityMapListDS = new DataSet({
    autoQuery: false,
    ...CommodityMapListDS(),
  });

  async componentDidMount() {
    const { search } = this.props.location;
    const recordDataStr = new URLSearchParams(search).get('recordData');
    if (recordDataStr) {
      const recordData = JSON.parse(decodeURIComponent(recordDataStr));
      const { companyCode, customerName, customerInformationId } = recordData;
      this.commodityMapListDS.setQueryParameter('companyCode', companyCode);
      this.commodityMapListDS.setQueryParameter('customerName', customerName);
      this.commodityMapListDS.setQueryParameter('customerInformationId', customerInformationId);
      this.commodityMapListDS.query();
      this.setState({ recordData });
    }
  }

  /**
   * 商品映射新增行
   */
  @Bind()
  commodityAddLine() {
    const { search } = this.props.location;
    const recordDataStr = new URLSearchParams(search).get('recordData');
    if (recordDataStr) {
      const companyInfo = JSON.parse(decodeURIComponent(recordDataStr));
      const {
        customerInformationId,
        companyId,
        companyCode,
        customerName,
        customerCode,
        invoiceType,
      } = companyInfo;
      const record = this.commodityMapListDS.create(
        {
          companyId,
          companyCode,
          customerInformationId,
          customerCode,
          customerName,
          invoiceType,
        },
        0
      );
      record.setState('editing', true);
    }
  }

  /**
   * 商品分配
   */
  @Bind()
  assignCommodity() {
    const { recordData } = this.state;
    const goodsMappingList = this.commodityMapListDS.selected.map(record => record.toData());
    const { companyCode, taxpayerNumber, customerInformationId } = recordData;
    const customerInfo = {
      companyCode,
      taxpayerNumber,
      goodsMappingList,
      customerInformationId,
    };
    const modal = Modal.open({
      title: intl.get('hiop.customerInfo.title.assignCommodity').d('分配商品映射'),
      drawer: true,
      closable: true,
      size: 'large',
      children: <AssignCommodity {...customerInfo} onCloseModal={() => modal.close()} />,
      footer: null,
    });
  }

  /**
   * 删除商品
   */
  @Bind()
  handleDeleteCommodity() {
    const record = this.commodityMapListDS.selected;
    this.commodityMapListDS.delete(record);
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get commodityBtn(): Buttons[] {
    const DistributionBtn = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button key="add" icon="add" onClick={() => this.commodityAddLine()}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <DistributionBtn
        key="distribution"
        onClick={() => this.assignCommodity()}
        dataSet={this.commodityMapListDS}
        title={intl.get('hiop.customerInfo.button.synchronize').d('分配')}
      />,
      <DistributionBtn
        key="delete"
        onClick={() => this.handleDeleteCommodity()}
        dataSet={this.commodityMapListDS}
        title={intl.get('hzero.common.button.delete').d('删除')}
      />,
    ];
  }

  /**
   * 禁用/启用
   * @params {object} record-行记录
   */
  @Bind()
  handleEnabledFlag(record) {
    if (record.get('enabledFlag') === 0) {
      record.set({ enabledFlag: 1 });
      this.commodityMapListDS.submit();
    } else {
      const title = intl.get('htc.common.notification.disableConfirm').d('确认禁用？');
      Modal.confirm({
        key: Modal.key,
        title,
      }).then(button => {
        if (button === 'ok') {
          record.set({ enabledFlag: 0 });
          this.commodityMapListDS.submit();
        }
      });
    }
  }

  /**
   * 编辑尚品
   * @params {object} record-行记录
   */
  @Bind()
  handleEditCommodity(record) {
    record.setState('editing', true);
  }

  /**
   * 商品取消编辑
   * @params {object} record-行记录
   */
  @Bind()
  handleCancelCommodity(record) {
    if (record.status === 'add') {
      this.commodityMapListDS.remove(record);
    } else {
      record.reset();
      record.setState('editing', false);
    }
  }

  /**
   * 保存商品
   * @params {object} record-行记录
   */
  @Bind()
  async handleSaveCommodity(record) {
    const res = await this.commodityMapListDS.submit();
    if (res && res.content) record.setState('editing', false);
  }

  /**
   * 操作列按钮
   * @params {object} record-行记录
   * @returns {*[]}
   */
  @Bind()
  commands(record) {
    const btns: any = [];
    const enabledFlag = record.get('enabledFlag');
    if (record.getState('editing')) {
      btns.push(
        <a onClick={() => this.handleSaveCommodity(record)}>
          {intl.get('hzero.common.button.save').d('保存')}
        </a>,
        <a onClick={() => this.handleCancelCommodity(record)}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </a>
      );
    } else {
      btns.push(
        <a onClick={() => this.handleEditCommodity(record)}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>,
        <a
          onClick={() => this.handleEnabledFlag(record)}
          style={{ color: enabledFlag === 0 ? 'green' : 'gray' }}
        >
          {enabledFlag === 0
            ? intl.get('hzero.common.button.enable').d('启用')
            : intl.get('hzero.common.button.disable').d('禁用')}
        </a>
      );
    }
    return [
      <span className="action-link" key="action">
        {btns}
      </span>,
    ];
  }

  /**
   * 商品映射行
   * @returns {*[]}
   */
  get commodityColumns(): ColumnProps[] {
    return [
      {
        name: 'projectObj',
        width: 180,
        editor: record => record.getState('editing'),
        renderer: ({ text, record }) => {
          const enabledFlag = record?.get('enabledFlag');
          const enabledText = enabledFlag === 0 ? '禁用' : '启用';
          let color = '';
          let textColor = '';
          switch (enabledFlag) {
            case 0:
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            case 1:
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {enabledText}
              </Tag>
              <span>{text}</span>
            </>
          );
        },
      },
      { name: 'projectName', width: 150, editor: record => record.getState('editing') },
      { name: 'issueName', editor: record => record.getState('editing') },
      { name: 'taxRateObj', editor: record => record.getState('editing') },
      { name: 'model', editor: record => record.getState('editing') },
      { name: 'invoiceType', editor: record => record.getState('editing') },
      { name: 'goodsUnit', editor: record => record.getState('editing') },
      { name: 'goodsUnitPrice', editor: record => record.getState('editing') },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 120,
        renderer: ({ record }) => this.commands(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  render() {
    return (
      <>
        <Header
          backPath="/htc-front-iop/customer-info/list"
          title={intl.get('hiop.invoiceWorkbench.title.commodityInfo').d('商品信息')}
        />
        <Content>
          <Table
            key="commodityMap"
            dataSet={this.commodityMapListDS}
            columns={this.commodityColumns}
            buttons={this.commodityBtn}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
