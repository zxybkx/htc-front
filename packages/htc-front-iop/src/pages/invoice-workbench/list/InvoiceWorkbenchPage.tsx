/**
 * @Description:开票订单页面
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2020-12-10 11:18:22
 * @LastEditTime: 2021-03-04 17:07:11
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import withProps from 'utils/withProps';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { closeTab, openTab } from 'utils/menuTab';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { RouteComponentProps } from 'react-router-dom';
import ExcelExport from 'components/ExcelExport';
import { Col, Dropdown, Icon, Menu, Row, Tag } from 'choerodon-ui';
import commonConfig from '@htccommon/config/commonConfig';
import {
  Button,
  Currency,
  DataSet,
  DateTimePicker,
  Form,
  Lov,
  Modal,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { base64toBlob, getPresentMenu } from '@htccommon/utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { find, forEach, isEmpty } from 'lodash';
import moment from 'moment';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  batchCancelSubmitOrder,
  batchExport,
  batchExportNoZip,
  batchRemove,
  batchSubmit,
  exportPrintFile,
  refresh,
  updatePrintNum,
} from '@src/services/invoiceOrderService';
import { judgeRedFlush } from '@src/services/invoiceReqService';
import MenuItem from 'choerodon-ui/lib/menu/MenuItem';
import InvoiceWorkbenchDS from '../stores/InvoiceWorkbenchDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceWorkbenchPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  invoiceWorkbenchDS: DataSet;
}

@withProps(
  () => {
    const invoiceWorkbenchDS = new DataSet({
      autoQuery: false,
      ...InvoiceWorkbenchDS(),
    });
    return { invoiceWorkbenchDS };
  },
  { cacheState: true }
)
@connect()
@formatterCollections({
  code: ['hiop.invoiceWorkbench', 'htc.common', 'hiop.tobeInvoice'],
})
export default class InvoiceWorkbenchPage extends Component<InvoiceWorkbenchPageProps> {
  state = {
    curCompanyId: undefined,
    showMore: false,
  };

  async componentDidMount() {
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const res = await getCurrentEmployeeInfoOut({ tenantId });
      let curCompanyId = queryDataSet.current!.get('companyId');
      if (res && res.content) {
        const empInfo = res.content[0];
        if (empInfo && !curCompanyId) {
          queryDataSet.current!.set({ companyObj: empInfo });
          curCompanyId = empInfo.companyId;
        }
      }
      this.setState({ curCompanyId });
      this.props.invoiceWorkbenchDS.query(this.props.invoiceWorkbenchDS.currentPage || 0);
    }
  }

  /**
   * 公司改变回调
   * @params {object} value-当前值
   */
  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  /**
   * 自定义查询条
   * @params {object} value-当前值
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { showMore } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [];
      queryMoreArray.push(<TextField name="orderNumber" />);
      queryMoreArray.push(<Select name="invoiceSourceType" />);
      queryMoreArray.push(<Currency name="invoiceAmount" />);
      queryMoreArray.push(<TextField name="invoiceCode" />);

      queryMoreArray.push(<TextField name="invoiceNo" />);
      queryMoreArray.push(<Select name="printFlag" />);
      queryMoreArray.push(<DateTimePicker name="submitDates" />);
      // queryMoreArray.push(<DateTimePicker name="submitDate" />);
      // queryMoreArray.push(<DateTimePicker name="submitDateTo" />);

      queryMoreArray.push(<Select name="purchaseInvoiceFlag" />);
      queryMoreArray.push(<Select name="billingType" />);

      queryMoreArray.push(<TextField name="buyerName" colSpan={2} />);
      queryMoreArray.push(<Lov name="employeeNameObj" />);
      queryMoreArray.push(<TextField name="sellerName" colSpan={2} />);
      queryMoreArray.push(<TextField name="invoiceSourceFlag" />);

      return (
        <>
          <Row type="flex" style={{ flexWrap: 'nowrap' }}>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <Lov name="companyObj" onChange={(value) => this.handleCompanyChange(value)} />
                <TextField name="taxpayerNumber" />
                <TextField name="employeeDesc" />

                <DateTimePicker name="creatDate" />
                {/* <DateTimePicker name="creationDate" />
                <DateTimePicker name="creationDateTo" /> */}
                <DateTimePicker name="invoiceDates" />
                {/* <DateTimePicker name="invoiceDate" />
                <DateTimePicker name="invoiceDateTo" /> */}

                {/* <TextField name="bankNumber" /> */}
                {/* <TextField name="addressPhone"/> */}
                <TextField name="invoiceSourceOrder" />
                <Select name="invoiceState" />
                <Select name="orderStatus" />
                <Select name="invoiceVariety" />

                {showMore && queryMoreArray}
              </Form>
            </Col>
            <Col span={4} style={{ minWidth: '190px', textAlign: 'end' }}>
              <Button
                funcType={FuncType.link}
                onClick={() => this.setState({ showMore: !showMore })}
              >
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  {showMore ? <Icon type="expand_more" /> : <Icon type="expand_less" />}
                </span>
              </Button>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={18} style={{ marginBottom: '10px' }}>
              {buttons}
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  /**
   * 导出
   */
  @Bind()
  exportParams() {
    const queryParams =
      this.props.invoiceWorkbenchDS.queryDataSet!.map((data) => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const { companyObj, ...otherData } = queryParams[0];
    const _queryParams = {
      ...companyObj,
      ...otherData,
    };
    return { ..._queryParams } || {};
  }

  /**
   * 导入
   */
  @Bind()
  async handleBatchExport() {
    const code = 'HIOP.INVOICINGORDER';
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNum = queryDataSet && queryDataSet.current?.get('employeeNumber');
    const params = {
      companyCode,
      employeeNum,
      tenantId,
    };
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify(params);
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get('hiop.invoiceWorkbench.title.import').d('开票订单导入'),
          tenantId,
          args: argsParam,
        }),
      });
    }
  }

  /**
   * 批量刷新状态回调
   */
  @Bind()
  async batchFresh() {
    const list = this.props.invoiceWorkbenchDS.selected.map((record) => record.toData());
    const unSubmit = find(list, (item) => item.orderStatus !== 'C' && item.orderStatus !== 'I');
    if (unSubmit) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.batchFresh')
          .d('存在非提交、开具中状态发票，无法刷新状态'),
      });
    }
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyId, employeeId } = curInfo;
      const params = {
        tenantId,
        companyId,
        employeeId,
        refreshOrderHeaderList: list,
      };
      const res = getResponse(await refresh(params));
      if (res) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.props.invoiceWorkbenchDS.query();
      }
    }
  }

  /**
   * 刷新状态（单条）
   * @params {object} record-行记录
   */
  @Bind()
  async singleFresh(record) {
    const data = record.toData();
    const { companyId, employeeId } = data;
    const params = {
      tenantId,
      companyId,
      employeeId,
      refreshOrderHeaderList: [data],
    };
    const res = getResponse(await refresh(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.invoiceWorkbenchDS.query();
    }
  }

  /**
   * 手工开票回调
   */
  @Bind()
  handleManualInvoice() {
    const { history } = this.props;
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyObj } = curInfo;
      history.push(
        `/htc-front-iop/invoice-workbench/invoice-order/invoiceOrder/${companyObj.companyId}`
      );
    }
  }

  /**
   * 数据权限分配
   */
  @Bind()
  handlePermission() {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.invoiceWorkbenchDS.selected
      .map((rec) => rec.get('invoicingOrderHeaderId'))
      .join(',');
    history.push(`/htc-front-iop/permission-assign/ORDER/${curCompanyId}/${selectedList}`);
  }

  /**
   * 批量提交
   */
  @Bind()
  async handleBatchSubmit() {
    const submitOrderHeaderList = this.props.invoiceWorkbenchDS.selected.map((record) =>
      record.toData()
    );
    const unNew = find(
      submitOrderHeaderList,
      (item) => item.orderStatus !== 'N' && item.orderStatus !== 'Q'
    );
    if (unNew) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.batchSubmit')
          .d('存在非新建或取消状态的发票，无法批量提交'),
      });
    }
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyId, employeeId, employeeNumber, companyEmployeeName } = curInfo;
      const params = {
        tenantId,
        companyId,
        employeeId,
        employeeNumber,
        employeeName: companyEmployeeName,
        submitOrderHeaderList,
      };
      const res = getResponse(await batchSubmit(params));
      if (res) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
      }
      this.props.invoiceWorkbenchDS.query();
    }
  }

  /**
   * 批量取消
   */
  @Bind()
  async handleBatchCancel() {
    const cancelOrderHeaderList = this.props.invoiceWorkbenchDS.selected.map((record) =>
      record.toData()
    );
    const unCancel = find(
      cancelOrderHeaderList,
      (item) => item.orderStatus !== 'E' && item.orderStatus !== 'I'
    );
    if (unCancel) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.batchCancel')
          .d('存在非开具中或非异常状态发票，无法批量取消'),
      });
    }
    this.handleCancel(cancelOrderHeaderList);
  }

  /**
   * 批量删除
   */
  @Bind()
  async handleBatchDelete() {
    const invoicingOrderHeaderList = this.props.invoiceWorkbenchDS.selected.map((record) =>
      record.toData()
    );
    const unNew = find(
      invoicingOrderHeaderList,
      (item) => item.orderStatus !== 'N' && item.orderStatus !== 'Q'
    );
    if (unNew) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.batchDelete')
          .d('存在非新建或取消状态发票，无法批量删除'),
      });
    }
    this.handledDeleteOrder(invoicingOrderHeaderList);
  }

  /**
   * 空白废开具
   */
  @Bind()
  handleBlankInvoiceVoid() {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    history.push(`/htc-front-iop/invoice-workbench/invoice-void/${curCompanyId}`);
  }

  /**
   * 发票作废
   * @params {object} record-行记录
   */
  @Bind()
  handleInvoiceVoid(record) {
    const { history } = this.props;
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    const companyId = record.get('companyId');
    history.push(
      `/htc-front-iop/invoice-workbench/invoice-line-void/${invoicingOrderHeaderId}/${companyId}`
    );
  }

  /**
   * 发票红冲
   * @params {object} record-行记录
   */
  @Bind()
  async handleInvoiceRed(record) {
    const { history } = this.props;
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    const companyId = record.get('companyId');
    const params = {
      tenantId,
      orderHeaderId: invoicingOrderHeaderId,
    };
    const res = await judgeRedFlush(params);
    if (res && res.failed) {
      notification.error({
        description: '',
        message: res && res.message,
      });
    } else {
      history.push(
        `/htc-front-iop/invoice-workbench/invoice-red-flush/${invoicingOrderHeaderId}/${companyId}`
      );
    }
  }

  /**
   * 导出打印
   * @params {array} list-文件数据
   */
  @Bind()
  printZip(list) {
    forEach(list, (item, key) => {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      const zipName = `${date}-${key}`;
      const blob = new Blob([base64toBlob(item)]);
      if (window.navigator.msSaveBlob) {
        try {
          window.navigator.msSaveBlob(blob, `${zipName}.zip`);
        } catch (e) {
          notification.error({
            description: '',
            message: intl.get('hzero.common.notification.download.error').d('下载失败'),
          });
        }
      } else {
        const aElement = document.createElement('a');
        const blobUrl = window.URL.createObjectURL(blob);
        aElement.href = blobUrl; // 设置a标签路径
        aElement.download = `${zipName}.zip`;
        aElement.click();
        window.URL.revokeObjectURL(blobUrl);
      }
    });
  }

  /**
   * 导出打印文件/打印发票
   * @params {number} type 0-导出打印文件 1-打印发票/打印清单
   * @params {array} printType-打印类型
   */
  @Bind()
  async handleExport(type, printType) {
    const exportOrderHeaderList = this.props.invoiceWorkbenchDS.selected.map((record) =>
      record.toData()
    );
    const incompatible = find(exportOrderHeaderList, (item) => item.orderStatus !== 'F');
    const tips = type === 0 ? '无法导出打印文件' : '无法打印发票';
    if (incompatible) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.status.batchExport', { tips })
          .d(`存在非完成状态发票，${tips}`),
      });
    }
    const unInvoiceState = find(
      exportOrderHeaderList,
      (item) => item.invoiceVariety === '51' || item.invoiceVariety === '52'
    );
    if (unInvoiceState) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.type.batchExport', { tips })
          .d(`存在发票种类为电子普票或电子专票的发票，${tips}`),
      });
    }
    const unBillType = find(exportOrderHeaderList, (item) =>
      ['3', '4', '5'].includes(item.billingType)
    );
    if (unBillType) {
      return notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceWorkbench.notification.error.invalid.batchExport', { tips })
          .d(`存在作废的发票，${tips}`),
      });
    }
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData(true);
      const { companyCode, employeeNumber, allCheckFlag } = curInfo;
      let params = {};
      if (allCheckFlag === 'Y') {
        params = {
          tenantId,
          ...curInfo,
          printType,
          exportOrderHeaderList,
        };
      } else {
        params = {
          tenantId,
          companyCode,
          employeeNumber,
          allCheckFlag,
          exportOrderHeaderList,
          printType,
        };
      }
      // 导出打印(zip)
      if (type === 0) {
        const res = await batchExport(params);
        if (res && res.status === '1000') {
          const { data } = res;
          if (isEmpty(data.skipList)) {
            // 导出打印
            this.printZip(data.invoiceTypeMap);
          } else {
            Modal.confirm({
              children: `您本次选择的发票${data.skipList.join('、')}存在断号，是否批量导出打印？`,
            }).then((button) => {
              if (button === 'ok') {
                // 导出打印
                updatePrintNum(params);
                this.printZip(data.invoiceTypeMap);
              }
            });
          }
        } else {
          notification.error({
            description: '',
            message: res && res.message,
          });
        }
      } else {
        // 打印发票
        const res = getResponse(await batchExportNoZip(params));
        let regName = 'Webshell1://';
        if (printType) {
          if (printType === 'INVOICE') {
            regName = 'Webshell2://';
          } else if (printType === 'LIST') {
            regName = 'Webshell3://';
          }
        }
        if (res) {
          res.forEach((item) => {
            const blob = new Blob([base64toBlob(item.data)]);
            if (window.navigator.msSaveBlob) {
              try {
                window.navigator.msSaveBlob(blob, item.fileName);
              } catch (e) {
                notification.error({
                  description: '',
                  message: intl.get('hzero.common.notification.error').d('下载失败'),
                });
              }
            } else {
              const aElement = document.createElement('a');
              const blobUrl = window.URL.createObjectURL(blob);
              aElement.href = blobUrl; // 设置a标签路径
              aElement.download = item.fileName;
              aElement.click();
              window.URL.revokeObjectURL(blobUrl);
            }
          });
          const printElement = document.createElement('a');
          printElement.href = regName; // 设置a标签路径
          printElement.click();
        }
      }
    }
  }

  /**
   * 编辑/查看
   * @params {object} record-行记录
   */
  @Bind()
  editAndView(record) {
    const { history } = this.props;
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    history.push(
      `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${record.get(
        'companyId'
      )}/${invoicingOrderHeaderId}`
    );
  }

  /**
   * 提交订单
   * @params {object} record-行记录
   */
  @Bind()
  async submitInvoice(record) {
    const data = record.toData();
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    const { companyId } = data;
    const employeeId = queryDataSet && queryDataSet.current!.get('employeeId');
    const employeeNumber = queryDataSet && queryDataSet.current!.get('employeeNumber');
    const employeeName = queryDataSet && queryDataSet.current!.get('curEmployeeName');
    const params = {
      tenantId,
      companyId,
      employeeId,
      employeeNumber,
      employeeName,
      submitOrderHeaderList: [data],
    };
    const res = getResponse(await batchSubmit(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
    }
    this.props.invoiceWorkbenchDS.query();
  }

  /**
   * 行打印文件
   * @params {object} record-行记录
   */
  @Bind()
  async handledDownload(record) {
    const lineData = record.toData();
    const params = {
      tenantId,
      exportOrderHeader: lineData,
    };
    const res = getResponse(await exportPrintFile(params));
    if (res && res.data) {
      const { fileName } = res;
      const names = fileName.split('/');
      names.forEach((item) => {
        const blob = new Blob([base64toBlob(res.data)]);
        if (window.navigator.msSaveBlob) {
          try {
            window.navigator.msSaveBlob(blob, item);
          } catch (e) {
            notification.error({
              description: '',
              message: intl.get('hzero.common.notification.error').d('操作失败'),
            });
          }
        } else {
          const aElement = document.createElement('a');
          const blobUrl = window.URL.createObjectURL(blob);
          aElement.href = blobUrl; // 设置a标签路径
          aElement.download = item;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      });
      const printElement = document.createElement('a');
      printElement.href = 'Webshell://'; // 设置a标签路径
      printElement.click();
    }
  }

  /**
   * 删除订单
   * @params {array} records-选中的行记录数组
   */
  @Bind()
  async handledDeleteOrder(records) {
    Modal.confirm({
      title: intl
        .get('hiop.invoiceWorkbench.view.deleteHint')
        .d('删除后将无法恢复，是否确定删除？'),
      onOk: async () => {
        const params = {
          tenantId,
          invoicingOrderHeaderList: records,
        };
        const res = getResponse(await batchRemove(params));
        if (res) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.props.invoiceWorkbenchDS.query();
        }
      },
    });
  }

  /**
   * 取消订单调接口
   * @params {array} records-选中的行记录数组
   */
  @Bind()
  async handleCancel(records) {
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyId, companyCode, employeeNumber, employeeId } = curInfo;
      const params = {
        tenantId,
        companyId,
        companyCode,
        employeeId,
        employeeNumber,
        cancelOrderHeaderList: records,
      };
      Modal.confirm({
        title: intl
          .get('hiop.invoiceWorkbench.view.deleteHint')
          .d('取消后您可以重新提交，是否确定取消？'),
        onOk: async () => {
          const res = getResponse(await batchCancelSubmitOrder(params));
          if (res) {
            notification.success({
              description: '',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.props.invoiceWorkbenchDS.query();
          }
        },
      });
    }
  }

  /**
   * 票面预览
   * @params {object} record-行记录
   */
  @Bind()
  previewInvoice(record) {
    const headerId = record.get('invoicingOrderHeaderId');
    const employeeId = record.get('employeeId');
    const { history } = this.props;
    const pathname = `/htc-front-iop/invoice-workbench/invoice-view/ORDER/${headerId}/${employeeId}`;
    history.push({
      pathname,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: '/htc-front-iop/invoice-workbench/list',
          })
        ),
      }),
    });
    // dispatch(
    //   routerRedux.push({
    //     pathname,
    //     search: queryString.stringify({
    //       invoiceInfo: encodeURIComponent(
    //         JSON.stringify({
    //           backPath: '/htc-front-iop/invoice-workbench/list',
    //         })
    //       ),
    //     }),
    //   })
    // );
  }

  /**
   * 返回操作列按钮
   * @params {object} record-行记录
   */
  @Bind()
  operationsRender(record) {
    const orderStatus = record.get('orderStatus');
    const invoiceVariety = record.get('invoiceVariety');
    const orderProgress = record.get('orderProgress');
    const invoiceState = record.get('invoiceState');
    const billingType = record.get('billingType');
    const invoiceDate = record.get('invoiceDate');
    const invoiceMonth = invoiceDate && invoiceDate.substring(0, 7);
    const nowMonth = moment().format('YYYY-MM');
    const renderPermissionButton = (params) => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.link}
        onClick={params.onClick}
        color={ButtonColor.primary}
        style={{ color: 'rgba(56,137,255,0.8)' }}
        permissionList={[
          {
            code: `${permissionPath}.${params.permissionCode}`,
            type: 'button',
            meaning: `${params.permissionMeaning}`,
          },
        ]}
      >
        {params.title}
      </PermissionButton>
    );
    const operators: any[] = [];
    const submitInvoiceBtn = {
      key: 'submitInvoice',
      ele: renderPermissionButton({
        onClick: () => this.submitInvoice(record),
        permissionCode: 'submit-invoice',
        permissionMeaning: '按钮-提交订单',
        title: intl.get('hiop.invoiceWorkbench.button.submitInvoice').d('提交订单'),
      }),
      funcType: FuncType.link,
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.submitInvoice').d('提交订单'),
    };
    const cancelInvoiceBtn = {
      key: 'cancelInvoice',
      ele: renderPermissionButton({
        onClick: () => this.handleCancel([record.toData()]),
        permissionCode: 'cancel-invoice',
        permissionMeaning: '按钮-取消订单',
        title: intl.get('hiop.invoiceWorkbench.button.cancelInvoice').d('取消订单'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.cancelInvoice').d('取消订单'),
    };
    const printDocBtn = {
      key: 'printDoc',
      ele: renderPermissionButton({
        onClick: () => this.handledDownload(record),
        permissionCode: 'print-doc',
        permissionMeaning: '按钮-打印文件',
        title: intl.get('hiop.invoiceWorkbench.button.printDoc').d('打印文件'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.printDoc').d('打印文件'),
    };
    const invoiceInvalidBtn = {
      key: 'invoiceInvalid',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceVoid(record),
        permissionCode: 'invoice-invalid',
        permissionMeaning: '按钮-发票作废',
        title: intl.get('hiop.invoiceWorkbench.button.invoiceInvalid').d('发票作废'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.invoiceInvalid').d('发票作废'),
    };
    const invoiceRedBtn = {
      key: 'invoiceRed',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceRed(record),
        permissionCode: 'invoice-red',
        permissionMeaning: '按钮-发票红冲',
        title: intl.get('hiop.invoiceWorkbench.button.invoiceRed').d('发票红冲'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.invoiceRed').d('发票红冲'),
    };
    const invoicePreviewBtn = {
      key: 'invoicePreview',
      ele: renderPermissionButton({
        onClick: () => this.previewInvoice(record),
        permissionCode: 'invoice-preview',
        permissionMeaning: '按钮-票面预览',
        title: intl.get('hiop.invoiceWorkbench.button.invoicePreview').d('票面预览'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.invoicePreview').d('票面预览'),
    };
    const deleteInvoiceBtn = {
      key: 'deleteInvoice',
      ele: renderPermissionButton({
        onClick: () => this.handledDeleteOrder([record.toData()]),
        permissionCode: 'delete-invoice',
        permissionMeaning: '按钮-删除订单',
        title: intl.get('hiop.invoiceWorkbench.button.deleteInvoice').d('删除订单'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.deleteInvoice').d('删除订单'),
    };
    const freshStateBtn = {
      key: 'freshState',
      ele: renderPermissionButton({
        onClick: () => this.singleFresh(record),
        permissionCode: 'fresh-state',
        permissionMeaning: '按钮-刷新状态',
        title: intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态'),
    };
    // 新建、取消
    if (orderStatus === 'N' || orderStatus === 'Q') {
      operators.push(submitInvoiceBtn, deleteInvoiceBtn);
    }
    // 提交、异常
    if (
      (orderStatus === 'C' && orderProgress === '1000') ||
      orderStatus === 'E' ||
      orderStatus === 'I'
    ) {
      operators.push(cancelInvoiceBtn);
    }
    // 完成
    if (
      ['0', '2', '41'].includes(invoiceVariety) &&
      ['1', '2'].includes(billingType) &&
      ['0', '1', '4', '5'].includes(invoiceState) &&
      orderStatus === 'F' &&
      invoiceMonth === nowMonth
    ) {
      operators.push(invoiceInvalidBtn);
    }
    if (
      ['0', '2', '41'].includes(invoiceVariety) &&
      orderStatus === 'F' &&
      ['1', '2'].includes(billingType)
    ) {
      operators.push(printDocBtn);
    }
    // 完成
    if (['0', '6'].includes(invoiceState) && orderStatus === 'F' && billingType === '1') {
      operators.push(invoiceRedBtn);
    }
    if (orderStatus === 'F') {
      operators.push(invoicePreviewBtn);
    }
    // 提交
    if (orderStatus === 'C' || orderStatus === 'I') {
      operators.push(freshStateBtn);
    }
    const newOperators = operators.filter(Boolean);
    return operatorRender(newOperators, record, { limit: 2 });
  }

  /**
   * 返回表格行
   * @return {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      {
        name: 'orderNumber',
        width: 300,
        renderer: ({ value, record }) => {
          const test = record?.toJSONData();
          let color;
          let style;
          switch (test.orderStatus) {
            case 'N':
              color = '#DBEEFF';
              style = {
                color: '#3889FF',
              };
              break;
            case 'E':
              color = '#FFDCD4';
              style = {
                color: '#FF5F57',
              };
              break;
            case 'F':
              style = {
                color: '#19A633',
              };
              color = '#D6FFD7';
              break;
            case 'C' || 'I':
              style = {
                color: '#FF8F07',
              };
              color = '#FFECC4';
              break;
            default:
              style = {
                color: '#6C6C6C',
              };
              color = '#F0F0F0';
              break;
          }
          return (
            <div style={{ cursor: 'pointer' }} onClick={() => this.editAndView(record)}>
              <Tag color={color} style={style}>
                {record?.getField('orderStatus')?.getText()}
              </Tag>
              <a>{value}</a>
            </div>
          );
        },
      },
      { name: 'billingType' },
      { name: 'invoiceVariety' },
      { name: 'buyerName', width: 230 },
      { name: 'totalExcludingTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalPriceTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalTax', width: 150, align: ColumnAlign.right },
      { name: 'sellerName', width: 230 },
      { name: 'invoiceType', width: 130 },
      { name: 'invoiceCode', width: 120 },
      { name: 'invoiceNo', width: 120 },
      { name: 'invoiceDate', width: 160 },
      { name: 'checkNumber', width: 190 },
      { name: 'remark', width: 160 },
      { name: 'invoiceState' },
      { name: 'electronicReceiverInfo' },
      { name: 'downloadUrl', width: 130 },
      { name: 'printFileDownloadUrl' },
      { name: 'printNum', renderer: ({ value }) => <span>{value}</span> },
      { name: 'purchaseInvoiceFlag' },
      { name: 'listFlag' },
      { name: 'extNumber' },
      { name: 'invoiceSourceType' },
      { name: 'invoiceSourceOrder', width: 230 },
      { name: 'orderProgress', width: 160 },
      { name: 'invoiceSourceFlag', width: 230 },
      { name: 'buyerTaxpayerNumber', width: 190 },
      { name: 'sellerTaxpayerNumber', width: 190 },
      { name: 'blueInvoiceCode', width: 160 },
      { name: 'blueInvoiceNo' },
      { name: 'redMarkReason', width: 130 },
      { name: 'specialRedMark' },
      { name: 'redInfoSerialNumber', width: 130 },
      { name: 'referenceNumber' },
      { name: 'dataPermission' },
      { name: 'paperTicketReceiverName' },
      { name: 'paperTicketReceiverPhone' },
      { name: 'paperTicketReceiverAddress' },
      { name: 'nextDefaultFlag' },
      { name: 'employeeName', width: 130 },
      { name: 'creationDate', width: 190 },
      { name: 'submitterName' },
      { name: 'submitDate', width: 190 },
      { name: 'requestUniqueNumber', width: 140 },
      { name: 'exceptionDesc' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 200,
        renderer: ({ record }) => this.operationsRender(record),
        lock: ColumnLock.right,
      },
    ];
  }

  /**
   * 返回表格头按钮
   * @return {*[]}
   */
  get buttons(): Buttons[] {
    const BatchButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={props.funcType}
          color={props.color}
          style={props.style}
          permissionList={[
            {
              code: `${permissionPath}.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const batchMene = (
      <Menu style={{ marginTop: '24px' }}>
        <MenuItem>
          <BatchButtons
            key="batchSubmit"
            funcType={FuncType.link}
            onClick={() => this.handleBatchSubmit()}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.batchSubmit').d('批量提交')}
            permissionCode="batch-submit"
            permissionMeaning="按钮-批量提交"
          />
        </MenuItem>
        <MenuItem>
          <BatchButtons
            key="batchCancel"
            funcType={FuncType.link}
            onClick={() => this.handleBatchCancel()}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.batchCancel').d('批量取消')}
            permissionCode="batch-cancel"
            permissionMeaning="按钮-批量取消"
          />
        </MenuItem>
        <MenuItem>
          <BatchButtons
            key="batchDelete"
            funcType={FuncType.link}
            onClick={() => this.handleBatchDelete()}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.batchDelete').d('批量删除')}
            permissionCode="batch-delete"
            permissionMeaning="按钮-批量删除"
          />
        </MenuItem>
      </Menu>
    );
    const printingMene = (
      <Menu style={{ marginTop: '24px' }}>
        <MenuItem>
          <BatchButtons
            key="exportPrint"
            onClick={() => this.handleExport(0, null)}
            funcType={FuncType.link}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.export').d('导出打印文件')}
            permissionCode="export-print"
            permissionMeaning="按钮-导出打印文件"
          />
        </MenuItem>
        <MenuItem>
          <BatchButtons
            key="invoiceAndListPrint"
            funcType={FuncType.link}
            onClick={() => this.handleExport(1, 'ALL')}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.invoiceAndListPrint').d('打印发票及清单')}
            permissionCode="invoice-list-print"
            permissionMeaning="按钮-打印发票及清单"
          />
        </MenuItem>
        <MenuItem>
          <BatchButtons
            key="invoicePrint"
            funcType={FuncType.link}
            onClick={() => this.handleExport(1, 'INVOICE')}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.invoicePrint').d('打印发票')}
            permissionCode="invoice-print"
            permissionMeaning="按钮-打印发票"
          />
        </MenuItem>
        <MenuItem>
          <BatchButtons
            key="listPrint"
            funcType={FuncType.link}
            onClick={() => this.handleExport(1, 'LIST')}
            dataSet={this.props.invoiceWorkbenchDS}
            title={intl.get('hiop.invoiceWorkbench.button.listPrint').d('打印清单')}
            permissionCode="list-print"
            permissionMeaning="按钮-打印清单"
          />
        </MenuItem>
      </Menu>
    );
    return [
      <PermissionButton
        type="c7n-pro"
        key="manualInvoice"
        onClick={() => this.handleManualInvoice()}
        permissionList={[
          {
            code: `${permissionPath}.manual-new`,
            type: 'button',
            meaning: '按钮-手工开票',
          },
        ]}
      >
        {intl.get('hiop.invoiceWorkbench.button.manualInvoice').d('手工开票')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="blankWaste"
        onClick={() => this.handleBlankInvoiceVoid()}
        permissionList={[
          {
            code: `${permissionPath}.blank-waste`,
            type: 'button',
            meaning: '按钮-空白废开具',
          },
        ]}
      >
        {intl.get('hiop.invoiceWorkbench.button.blankWaste').d('空白废开具')}
      </PermissionButton>,
      <BatchButtons
        key="dataPermission"
        onClick={() => this.handlePermission()}
        color={ButtonColor.default}
        style={{ color: '#3889FF', borderColor: '#3889FF' }}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get('hiop.invoiceWorkbench.button.dataPermission').d('数据权限分配')}
        permissionCode="data-permission"
        permissionMeaning="按钮-数据权限分配"
      />,
      <Dropdown overlay={batchMene}>
        <Button style={{ color: '#3889FF', borderColor: '#3889FF' }}>
          {intl.get('hiop.invoiceWorkbench.button.batch').d('批量')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <Dropdown overlay={printingMene}>
        <Button>
          {intl.get('hiop.invoiceWorkbench.button.invoicePrintCollection').d('发票打印')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <BatchButtons
        key="permissionFresh"
        color={ButtonColor.default}
        funcType={FuncType.raised}
        onClick={() => this.batchFresh()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get('hiop.invoiceWorkbench.button.fresh').d('刷新状态')}
        permissionCode="permission-fresh"
        permissionMeaning="按钮-刷新状态"
      />,
    ];
  }

  /**
   * 渲染表脚
   */
  @Bind()
  renderFooter(records) {
    let totalPriceTaxAmount = 0; // 合计含税金额
    let totalExcludingTaxAmount = 0; // 合计不含税金额
    let totalTax = 0; // 合计税额
    const pageData = records.map((record) => record.toData());
    pageData.forEach((record: any) => {
      const { billingType } = record;
      if (['1', '2'].includes(billingType)) {
        totalPriceTaxAmount += Number(record.totalPriceTaxAmount) || 0;
        totalExcludingTaxAmount += Number(record.totalExcludingTaxAmount) || 0;
        totalTax += Number(record.totalTax) || 0;
      } else {
        totalPriceTaxAmount -= Number(record.totalPriceTaxAmount) || 0;
        totalExcludingTaxAmount -= Number(record.totalExcludingTaxAmount) || 0;
        totalTax -= Number(record.totalTax) || 0;
      }
    });
    return (
      <div>
        <span>
          {`当前页：合计含税金额：${totalPriceTaxAmount.toFixed(
            2
          )}，合计不含税金额：${totalExcludingTaxAmount.toFixed(2)}，合计税额：${totalTax.toFixed(
            2
          )}`}
        </span>
        <span style={{ float: 'right' }}>累加当前页所有状态的蓝票红票、蓝废红废</span>
      </div>
    );
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.invoiceWorkbench.header').d('销项发票控制台')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.invoiceWorkbenchDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            footer={(records) => this.renderFooter(records)}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
