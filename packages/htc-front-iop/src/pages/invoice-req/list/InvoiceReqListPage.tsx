/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-03-10 17:57:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Content, Header } from 'components/Page';
import { RouteComponentProps } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import {
  Button,
  CheckBox,
  DataSet,
  DateTimePicker,
  Dropdown,
  EmailField,
  Form,
  Icon,
  Lov,
  Menu,
  Modal,
  notification,
  Select,
  Table,
  TextField,
} from 'choerodon-ui/pro';
import { Col, Row, Tag } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import { closeTab, openTab } from 'utils/menuTab';
import { operatorRender } from 'utils/renderer';
import queryString from 'query-string';
import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { forEach, isEmpty } from 'lodash';
import moment from 'moment';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import commonConfig from '@htccommon/config/commonConfig';
import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
import {
  batchMerage,
  cancelMerage,
  downloadQrCode,
  exportNotZip,
  exportPrintFiles,
  judgeInvoiceVoid,
  judgeRedFlush,
  reqCancel,
  reqDelete,
  reqSubmit,
  runReport,
  sendQrCode,
} from '@src/services/invoiceReqService';
import { getPresentMenu, downLoadFiles } from '@htccommon/utils/utils';
import InvoiceReqListDS from '../stores/InvoiceReqListDS';

const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;
const { Item: MenuItem } = Menu;

interface InvoiceReqListPageProps extends RouteComponentProps {
  reqListDS: DataSet;
}

@formatterCollections({
  code: [
    'hiop.invoiceWorkbench',
    'htc.common',
    'hiop.invoiceReq',
    'hiop.tobeInvoice',
    'hivp.invoices',
  ],
})
@withProps(
  () => {
    const reqListDS = new DataSet({
      autoQuery: false,
      ...InvoiceReqListDS(),
    });
    return { reqListDS };
  },
  { cacheState: true }
)
export default class InvoiceReqListPage extends Component<InvoiceReqListPageProps> {
  state = { curCompanyId: undefined, sendQrCodeEmail: '', queryMoreDisplay: false };

  async componentDidMount() {
    const { queryDataSet } = this.props.reqListDS;
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
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    }
  }

  /**
   * 自定义查询
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    const { queryMoreDisplay } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [
        <DateTimePicker name="reviewDate" />,
        <Select name="requestType" />,
        <Select name="requestStatus" />,
        <TextField name="requestNumber" />,
        <Select name="sourceType" />,
        <TextField name="buyerName" />,
        <TextField name="salerName" />,
        <TextField name="invoiceCode" />,
        <TextField name="invoiceNo" />,
        <Select name="billingType" />,
        <TextField name="sourceNumber1" labelWidth={110} />,
        <TextField name="sourceNumber2" labelWidth={110} />,
        <CheckBox name="deleteFlag" />,
      ];
      return (
        <div style={{ marginBottom: '0.1rem' }}>
          <Row>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet} labelTooltip={Tooltip.overflow}>
                <Lov
                  name="companyObj"
                  onChange={value => this.handleCompanyChange(value)}
                  clearButton={false}
                />
                <TextField name="taxpayerNumber" />
                <TextField name="employeeDesc" />
                <DateTimePicker name="requestDate" />
                <Select
                  name="invoiceType"
                  renderer={({ value, text }) => value && `${value} - ${text}`}
                />
                <TextField name="sourceNumber" />
                {queryMoreDisplay && queryMoreArray}
              </Form>
            </Col>
            <Col span={4} style={{ textAlign: 'end' }}>
              <Button
                funcType={FuncType.link}
                onClick={() => this.setState({ queryMoreDisplay: !queryMoreDisplay })}
              >
                <span>
                  {intl.get('hzero.common.button.option').d('更多')}
                  {queryMoreDisplay ? <Icon type="expand_more" /> : <Icon type="expand_less" />}
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
          {buttons}
        </div>
      );
    }
    return <></>;
  }

  /**
   * 公司改变回调
   */
  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  /**
   * 详情
   * @params {boolean} isCreatePage - 是否新建
   * @params {object} record - 当前记录
   */
  @Bind()
  handleGotoDetailPage(isCreatePage, record) {
    const { history } = this.props;
    const { queryDataSet } = this.props.reqListDS;
    const companyId = record?.get('companyId');
    const headerId = record?.get('headerId');
    const billFlag = record?.get('billFlag');
    if (queryDataSet) {
      let pathname;
      if (isCreatePage) {
        // 新增页
        const curEmpInfo = queryDataSet.current!.toData();
        pathname = `/htc-front-iop/invoice-req/create/${curEmpInfo.companyId}`;
      } else {
        // 编辑页
        pathname = `/htc-front-iop/invoice-req/detail/${companyId}/${headerId}/${billFlag}`;
      }
      history.push(pathname);
    }
  }

  /**
   * 数据权限分配
   */
  @Bind()
  handleGotoPermissionPage() {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.reqListDS.selected.map(rec => rec.get('headerId')).join(',');
    const pathname = `/htc-front-iop/permission-assign/REQUEST/${curCompanyId}/${selectedList}`;
    history.push(pathname);
  }

  /**
   * 详情
   * @params {[]} headerIds - 行id
   */
  @Bind()
  async handleApplySubmit(headerIds) {
    const { queryDataSet } = this.props.reqListDS;
    const employeeId = queryDataSet && queryDataSet.current!.get('employeeId');
    const companyCode = queryDataSet && queryDataSet.current!.get('companyCode');
    if (!employeeId) return;
    const params = {
      tenantId,
      reviewerId: employeeId,
      companyCode,
      requisitionHeaders: headerIds,
    };
    const res = getResponse(await reqSubmit(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    }
  }

  /**
   * 取消申请
   * @params {[]} records - 行数据
   */
  @Bind()
  async handleApplyCancel(records) {
    const { queryDataSet } = this.props.reqListDS;
    const employeeId = queryDataSet && queryDataSet.current!.get('employeeId');
    const params = {
      tenantId,
      requisitionHeaderList: records,
      employeeId,
    };
    Modal.confirm({
      title: intl
        .get('hiop.invoiceWorkbench.message.cancelHint')
        .d('取消后您可以重新提交，是否确定取消？'),
      onOk: async () => {
        const res = getResponse(await reqCancel(params));
        if (res) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
        }
      },
    });
  }

  /**
   * 删除申请
   * @params {[]} records - 行数据
   */
  @Bind()
  async handleApplyDelete(records) {
    Modal.confirm({
      title: intl
        .get('hiop.invoiceWorkbench.message.deleteHint')
        .d('删除后将无法恢复，是否确定删除？'),
      onOk: async () => {
        const params = {
          tenantId,
          requisitionHeaderList: records,
        };
        const res = getResponse(await reqDelete(params));
        if (res) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
        }
      },
    });
  }

  /**
   * 下载二维码
   */
  @Bind()
  async handleDownloadQrCode() {
    const qrCodeUrl = this.props.reqListDS.current!.get('qrCodeUrl');
    const headerId = this.props.reqListDS.current!.get('headerId');
    const companyId = this.props.reqListDS.current!.get('companyId');
    const params = {
      tenantId,
      headerId,
      companyId,
      qrCodeUrl,
    };
    const res = getResponse(await downloadQrCode(params));
    const fileList = [
      {
        data: res.data.fileBase,
        fileName: res.data.fileName,
      },
    ];
    downLoadFiles(fileList, 0);
    // const blob = new Blob([base64toBlob(res.data.fileBase)]);
    // if ((window.navigator as any).msSaveBlob) {
    //   try {
    //     (window.navigator as any).msSaveBlob(blob);
    //   } catch (e) {
    //     notification.error({
    //       description: '',
    //       message: intl.get('hiop.invoiceReq.notification.error.orCode').d('二维码下载失败'),
    //     });
    //   }
    // } else {
    //   const aElement = document.createElement('a');
    //   const blobUrl = window.URL.createObjectURL(blob);
    //   aElement.href = blobUrl; // 设置a标签路径
    //   aElement.download = res.data.fileName;
    //   aElement.click();
    //   window.URL.revokeObjectURL(blobUrl);
    // }
  }

  /**
   * 发送二维码
   */
  @Bind()
  async handleSendQrCode() {
    const qrCodeUrl = this.props.reqListDS.current!.get('qrCodeUrl');
    const requisitionNumber = this.props.reqListDS.current!.get('requestNumber');
    const companyName = this.props.reqListDS.current!.get('companyName');
    const headerId = this.props.reqListDS.current!.get('headerId');
    const companyId = this.props.reqListDS.current!.get('companyId');
    const toggleOkDisabled = (e, modal) => {
      const { value } = e.currentTarget;
      if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
        this.setState({ sendQrCodeEmail: value });
        modal.update({
          okProps: { disabled: false },
        });
      }
    };
    const myModal = Modal.open({
      key: Modal.key(),
      okText: '确定',
      title: intl.get('hiop.invoiceReq.title.receiverEmail').d('收件人邮箱：'),
      center: true,
      children: <EmailField onBlur={e => toggleOkDisabled(e, myModal)} />,
      okProps: { disabled: true },
      onOk: async () => {
        const params = {
          tenantId,
          qrCodeUrl,
          headerId,
          companyId,
          email: this.state.sendQrCodeEmail,
          companyName,
          requisitionNumber,
        };
        const res = getResponse(await sendQrCode(params));
        if (res) {
          notification.success({
            description: '',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
        }
      },
    });
  }

  /**
   * 查看订单
   * @params {number} headerId - 行id
   */
  @Bind()
  handleViewOrder(headerId) {
    const { history } = this.props;
    const pathname = `/htc-front-iop/invoice-req/order/${headerId}`;
    history.push({
      pathname,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: '/htc-front-iop/invoice-req/list',
          })
        ),
      }),
    });
  }

  /**
   * 查看发票
   * @params {object} recordData - 行数据
   */
  @Bind()
  handleViewInvoice(recordData) {
    const { headerId, sourceType } = recordData;
    const { history } = this.props;
    const pathname = `/htc-front-iop/invoice-req/invoice-view/REQUEST/${headerId}/${sourceType}`;
    history.push({
      pathname,
      search: queryString.stringify({
        invoiceInfo: encodeURIComponent(
          JSON.stringify({
            backPath: '/htc-front-iop/invoice-req/list',
          })
        ),
      }),
    });
  }

  /**
   * 批量提交
   */
  @Bind()
  handleBatchApplySubmit() {
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    if (
      selectedList.some(sl => !['N', 'Q'].includes(sl.requestStatus)) ||
      selectedList.some(sl => ['Y'].includes(sl.deleteFlag))
    ) {
      notification.warning({
        message: intl
          .get('hiop.invoiceReq.notification.error.batchSubmit')
          .d('存在不能提交的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplySubmit(selectedList.map(sl => sl.headerId));
  }

  /**
   * 查看发票
   * @params {[]} lists - 行数据
   */
  @Bind()
  async handleMerge(lists) {
    const { queryDataSet } = this.props.reqListDS;
    const headerIds = lists.map(rec => rec.headerId).join(',');
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNum');
      const params = {
        tenantId,
        companyCode,
        employeeNumber,
        headerIds,
      };
      const res = getResponse(await batchMerage(params));
      if (res && res.successFlag) {
        notification.success({
          description: '',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
      } else {
        notification.warning({
          description: '',
          message: res && res.errorHeadMsg,
        });
      }
    }
  }

  /**
   * 合并
   */
  @Bind()
  async handleBatchMerge() {
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    if (
      selectedList.some(
        item =>
          !['N', 'Q'].includes(item.requestStatus) ||
          item.deleteFlag === 'H' ||
          ['7', '8', '9', '10'].includes(item.sourceType)
      )
    ) {
      notification.warning({
        message: intl
          .get('hiop.invoiceReq.notification.error.batchMerge')
          .d(
            '存在已合并、非新建/取消状态或来源类型为发票红冲/发票作废/空白废/红字信息表的数据，请重新勾选'
          ),
        description: '',
      });
      return;
    }
    this.handleMerge(selectedList);
  }

  /**
   * 取消合并回调
   * @params {[]} lists - 行数据
   */
  @Bind()
  async handleMerCancel(lists) {
    const headerIds = lists.map(rec => rec.headerId).join(',');
    const params = {
      tenantId,
      headerIds,
    };
    const res = await cancelMerage(params);
    if (res && res.successFlag) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    } else {
      notification.warning({
        description: '',
        message: res && res.errorHeadMsg,
      });
    }
  }

  /**
   * 取消合并
   */
  @Bind()
  handleMergeCancel() {
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    if (
      selectedList.some(item => item.deleteFlag === 'Y' || !['N', 'Q'].includes(item.requestStatus))
    ) {
      notification.warning({
        message: intl
          .get('hiop.invoiceReq.notification.error.mergeCancel')
          .d('存在已取消合并或非新建/取消状态的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleMerCancel(selectedList);
  }

  /**
   * 批量取消
   */
  @Bind()
  handleBatchApplyCancel() {
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    if (selectedList.some(sl => !['N', 'E', 'C'].includes(sl.requestStatus))) {
      notification.warning({
        message: intl
          .get('hiop.invoiceReq.notification.error.batchCancel')
          .d('存在不能取消的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplyCancel(selectedList);
  }

  /**
   * 批量删除
   */
  @Bind()
  handleBatchApplyDelete() {
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    if (selectedList.some(sl => !['N', 'Q'].includes(sl.requestStatus))) {
      notification.warning({
        message: intl
          .get('hiop.invoiceReq.notification.error.batchDelete')
          .d('存在不能删除的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplyDelete(selectedList);
  }

  /**
   * 导出打印
   * @params {[]} list - 文件list
   */
  @Bind()
  printZip(list) {
    // forEach(list, (item, key) => {
    //   const date = moment().format('YYYY-MM-DD HH:mm:ss');
    //   const zipName = `${date}-${key}`;
    //   const blob = new Blob([base64toBlob(item)]);
    //   if ((window.navigator as any).msSaveBlob) {
    //     try {
    //       (window.navigator as any).msSaveBlob(blob, `${zipName}.zip`);
    //     } catch (e) {
    //       notification.error({
    //         description: '',
    //         message: intl.get('hzero.common.notification.download.error').d('下载失败'),
    //       });
    //     }
    //   } else {
    //     const aElement = document.createElement('a');
    //     const blobUrl = window.URL.createObjectURL(blob);
    //     aElement.href = blobUrl; // 设置a标签路径
    //     aElement.download = `${zipName}.zip`;
    //     aElement.click();
    //     window.URL.revokeObjectURL(blobUrl);
    //   }
    // });
    const fileList: any[] = [];
    forEach(list, (item, key) => {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      const zipName = `${date}-${key}`;
      const file = {
        data: item,
        fileName: `${zipName}.zip`,
      };
      fileList.push(file);
    });
    downLoadFiles(fileList, 0);
  }

  @Bind()
  validateExport(selectedList) {
    if (selectedList.some(sl => ['N', 'Q'].includes(sl.requestStatus))) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceReq.notification.error.status')
          .d('存在新建/取消状态的发票，无法导出打印文件'),
      });
      return false;
    }
    if (!selectedList.some(sl => sl.completedQuantity > 0)) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceReq.notification.error.finish')
          .d('不存在完成的发票，无法导出打印文件'),
      });
      return false;
    }
    if (selectedList.some(sl => ['51', '52'].includes(sl.invoiceType))) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceReq.notification.error.invoiceType')
          .d('存在发票种类为电子普票或者电子专票发票，无法导出打印文件'),
      });
      return false;
    }
    if (selectedList.some(sl => sl.sourceType === '8')) {
      notification.warning({
        description: '',
        message: intl
          .get('hiop.invoiceReq.notification.error.invalid')
          .d('存在作废的发票，无法导出打印文件'),
      });
      return false;
    }
    return true;
  }

  @Bind()
  async handleExportInterface(params) {
    const res = await exportPrintFiles(params);
    if (res && res.status === '1000') {
      const { data } = res;
      if (isEmpty(data.skipList)) {
        // 导出打印
        this.printZip(data.invoiceTypeMap);
      } else {
        Modal.confirm({
          children: `您本次选择的发票${data.skipList.join('、')}存在断号，是否批量导出打印？`,
        }).then(button => {
          if (button === 'ok') {
            // 导出打印
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
  }

  @Bind()
  async printInvoiceInterface(params, printType) {
    const res = getResponse(await exportNotZip(params));
    let regName = 'Webshell1://';
    if (printType) {
      if (printType === 'INVOICE') {
        regName = 'Webshell2://';
      } else if (printType === 'LIST') {
        regName = 'Webshell3://';
      }
    }
    if (res) {
      downLoadFiles(res, 0);
      const printElement = document.createElement('a');
      printElement.href = regName; // 设置a标签路径
      printElement.click();
    }
  }

  /**
   * 导出打印文件
   * @params {number} type 0-导出打印文件 1-打印发票及清单/打印发票/打印清单
   * @params {string} printType 打印类型
   */
  @Bind()
  async handleExportPrintFiles(type, printType) {
    const { queryDataSet } = this.props.reqListDS;
    const selectedList = this.props.reqListDS.selected.map(rec => rec.toData());
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current?.get('employeeNum');
    const validateRes = await this.validateExport(selectedList);
    if (validateRes) {
      const params = {
        tenantId,
        companyCode,
        employeeNumber,
        printType,
        invoiceRequisitionHeaderIds: selectedList.map(d => d.headerId).join(','),
      };
      // 导出打印(zip)
      if (type === 0) {
        this.handleExportInterface(params);
      } else {
        // 打印发票
        this.printInvoiceInterface(params, printType);
      }
    }
  }

  /**
   * 空白废申请
   */
  @Bind()
  handleBlankInvoiceVoid() {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    history.push(`/htc-front-iop/invoice-req/invoice-void/REQUEST/${curCompanyId}`);
  }

  /**
   * 作废申请
   * @params {object} record-行记录
   */
  @Bind()
  async handleInvoiceVoid(record) {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const { queryDataSet } = this.props.reqListDS;
    if (queryDataSet) {
      const currentEmployee = queryDataSet.current!.toData();
      const {
        companyCode,
        employeeNum,
        employeeId,
        employeeName,
        mobile,
        companyName,
      } = currentEmployee;
      const employeeDesc = `${companyCode}-${employeeNum}-${employeeName}-${mobile}`;
      const headerId = record.get('headerId');
      const params = {
        tenantId,
        companyCode,
        employeeId,
        employeeDesc,
        companyName,
        employeeName,
        employeeNumber: employeeNum,
        orderHeaderId: headerId,
        headerId,
      };
      const res = getResponse(await judgeInvoiceVoid(params));
      if (res) {
        history.push(
          `/htc-front-iop/invoice-req/invoice-main-void/REQUEST/${headerId}/${curCompanyId}`
        );
      }
    }
  }

  /**
   * 红冲申请
   * @params {object} record-行记录
   */
  @Bind()
  async handleInvoiceRed(record) {
    const { history } = this.props;
    const { curCompanyId } = this.state;
    const headerId = record.get('headerId');
    const params = {
      tenantId,
      headerId,
    };
    const res = getResponse(await judgeRedFlush(params));
    if (res) {
      history.push(
        `/htc-front-iop/invoice-req/invoice-main-red-flush/REQUEST/${headerId}/${curCompanyId}`
      );
    }
  }

  /**
   * 操作渲染
   * @params {object} record-行记录
   */
  @Bind()
  optionsRender(record) {
    const headerId = record.get('headerId');
    const recordData = record.toData();
    const renderPermissionButton = params => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.link}
        onClick={params.onClick}
        permissionList={[
          {
            code: `${permissionPath}.button.${params.permissionCode}`,
            type: 'button',
            meaning: `${params.permissionMeaning}`,
          },
        ]}
      >
        {params.title}
      </PermissionButton>
    );
    const operators: any = [];
    const applySubmitBtn = {
      key: 'applySubmit',
      ele: renderPermissionButton({
        onClick: () => this.handleApplySubmit([headerId]),
        permissionCode: 'submit-req',
        permissionMeaning: '按钮-提交申请',
        title: intl.get('hiop.invoiceReq.button.applySubmit').d('提交申请'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.applySubmit').d('提交申请'),
    };
    const applyCancelBtn = {
      key: 'applyCancel',
      ele: renderPermissionButton({
        onClick: () => this.handleApplyCancel([record.toData()]),
        permissionCode: 'cancel-req',
        permissionMeaning: '按钮-取消申请',
        title: intl.get('hiop.invoiceReq.button.applyCancel').d('取消申请'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.applyCancel').d('取消申请'),
    };
    const applyDeleteBtn = {
      key: 'applyDelete',
      ele: renderPermissionButton({
        onClick: () => this.handleApplyDelete([record.toData()]),
        permissionCode: 'delete-req',
        permissionMeaning: '按钮-删除申请',
        title: intl.get('hiop.invoiceReq.button.applyDelete').d('删除申请'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.applyDelete').d('删除申请'),
    };
    const viewOrderBtn = {
      key: 'viewOrder',
      ele: renderPermissionButton({
        onClick: () => this.handleViewOrder(headerId),
        permissionCode: 'view-order',
        permissionMeaning: '按钮-查看订单',
        title: intl.get('hiop.invoiceReq.button.viewOrder').d('查看订单'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.viewOrder').d('查看订单'),
    };
    const viewInvoiceBtn = {
      key: 'viewInvoice',
      ele: (
        <Button funcType={FuncType.link} onClick={() => this.handleViewInvoice(recordData)}>
          {intl.get('hiop.invoiceReq.button.viewInvoice').d('查看发票')}
        </Button>
      ),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.viewInvoice').d('查看发票'),
    };
    const invoiceInvalidBtn = {
      key: 'invoiceVoid',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceVoid(record),
        permissionCode: 'invoice-void',
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
        permissionCode: 'invoice-red-flush',
        permissionMeaning: '按钮-发票红冲',
        title: intl.get('hiop.invoiceWorkbench.button.invoiceRed').d('发票红冲'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceWorkbench.button.invoiceRed').d('发票红冲'),
    };
    // 下载二维码
    const downloadQrCodeBtn = {
      key: 'downloadQrCode',
      ele: renderPermissionButton({
        onClick: () => this.handleDownloadQrCode(),
        permissionCode: 'download-qr-code',
        permissionMeaning: '下载二维码',
        title: intl.get('hiop.invoiceReq.button.downloadQrCode').d('下载二维码'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.downloadQrCode').d('下载二维码'),
    };
    const sendQrCodeBtn = {
      key: 'sendQrCode',
      ele: renderPermissionButton({
        onClick: () => this.handleSendQrCode(),
        permissionCode: 'send-qr-code',
        permissionMeaning: '发送二维码',
        title: intl.get('hiop.invoiceReq.button.sendQrCode').d('发送二维码'),
      }),
      len: 6,
      title: intl.get('hiop.invoiceReq.button.sendQrCode').d('发送二维码'),
    };
    const requestStatus = record.get('requestStatus');
    const deleteFlag = record.get('deleteFlag');
    const orderCount = record.get('orderCount');
    const sourceType = record.get('sourceType');
    const requestType = record.get('requestType');
    const invoiceType = record.get('invoiceType');
    const invoiceDate = record.get('invoiceDate');
    const invoiceMonth = invoiceDate && invoiceDate.substring(0, 7);
    const nowMonth = moment().format('YYYY-MM');

    if (deleteFlag === 'N') {
      switch (requestStatus) {
        case 'N':
          operators.push(applySubmitBtn, applyCancelBtn, applyDeleteBtn);
          break;
        case 'Q':
          operators.push(applySubmitBtn, applyDeleteBtn);
          break;
        case 'E':
          operators.push(applyCancelBtn, viewOrderBtn, viewInvoiceBtn);
          break;
        case 'C':
          operators.push(applyCancelBtn, viewOrderBtn);
          break;
        case 'F':
          operators.push(viewInvoiceBtn, viewOrderBtn);
          break;
        default:
          break;
      }
    }
    // 发票作废
    if (
      ['F', 'E'].includes(requestStatus) &&
      ['0', '2', '41'].includes(invoiceType) &&
      !['8', '10'].includes(sourceType) &&
      orderCount === 1 &&
      invoiceMonth === nowMonth &&
      deleteFlag === 'N'
    ) {
      operators.push(invoiceInvalidBtn);
    }
    // 发票红冲
    if (
      ['F', 'E'].includes(requestStatus) &&
      deleteFlag === 'N' &&
      orderCount === 1 &&
      !['7', '8', '10'].includes(sourceType)
    ) {
      operators.push(invoiceRedBtn);
    }
    // 生成二维码
    if (['PURCHASE_INVOICE_SUBSCRIBE', 'SALES_INVOICE_SUBSCRIBE'].includes(requestType)) {
      operators.push(downloadQrCodeBtn, sendQrCodeBtn);
    }
    const newOperators = operators.filter(Boolean);
    return operatorRender(newOperators, record, { limit: 2 });
  }

  /**
   * 导入
   */
  @Bind()
  async handleImport() {
    const code = 'HIOP.INVOICE_APPLICATION';
    const { queryDataSet } = this.props.reqListDS;
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNum = queryDataSet && queryDataSet.current?.get('employeeNum');
    await closeTab(`/himp/commentImport/${code}`);
    if (companyCode) {
      const argsParam = JSON.stringify({ companyCode, employeeNum, tenantId });
      openTab({
        key: `/himp/commentImport/${code}`,
        title: intl.get('hzero.common.button.import').d('导入'),
        search: queryString.stringify({
          prefixPath: API_PREFIX,
          action: intl.get('hiop.invoiceReq.title.import').d('开票申请导入'),
          tenantId,
          args: argsParam,
        }),
      });
    }
  }

  /**
   * 导出
   */
  @Bind()
  handleGetQueryParams() {
    const queryParams = this.props.reqListDS.queryDataSet?.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    return { ...queryParams[0] } || {};
  }

  /**
   * 返回表格操作按钮组
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { curCompanyId } = this.state;
    const btnDisabled = !curCompanyId;
    const BatchButtons = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length === 0;
      const { condition } = props;
      if (condition === 'batchDelete' || condition === 'batchSubmit') {
        isDisabled = !props.dataSet!.selected.some(sl => sl.get('deleteFlag') !== 'Y');
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={condition === 'permissionAssign' ? FuncType.flat : FuncType.link}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const MergeBtn = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length < 2;
      if (props.condition === 'batchDelete') {
        isDisabled = !props.dataSet!.selected.some(sl => sl.get('deleteFlag') !== 'Y');
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.link}
          permissionList={[
            {
              code: `${permissionPath}.button.${props.permissionCode}`,
              type: 'button',
              meaning: `${props.permissionMeaning}`,
            },
          ]}
        >
          {props.title}
        </PermissionButton>
      );
    });
    const batchButtons = [
      <BatchButtons
        key="batchSubmit"
        onClick={this.handleBatchApplySubmit}
        dataSet={this.props.reqListDS}
        condition="batchSubmit"
        title={intl.get('hiop.invoiceWorkbench.button.batchSubmit').d('批量提交')}
        permissionCode="batch-submit"
        permissionMeaning="按钮-批量提交"
      />,
      <BatchButtons
        key="batchCancel"
        onClick={this.handleBatchApplyCancel}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.batchCancel').d('批量取消')}
        permissionCode="batch-cancel"
        permissionMeaning="按钮-批量取消"
      />,
      <BatchButtons
        key="batchDelete"
        onClick={this.handleBatchApplyDelete}
        dataSet={this.props.reqListDS}
        condition="batchDelete"
        title={intl.get('hiop.invoiceWorkbench.button.batchDelete').d('批量删除')}
        permissionCode="batch-delete"
        permissionMeaning="按钮-批量删除"
      />,
    ];
    const mergeButtons = [
      <MergeBtn
        key="batchMerge"
        onClick={this.handleBatchMerge}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceReq.button.batchMerge').d('合并数据')}
        permissionCode="batch-nmerage"
        permissionMeaning="按钮-合并数据"
      />,
      <BatchButtons
        key="mergeCancel"
        onClick={this.handleMergeCancel}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceReq.button.mergeCancel').d('取消合并')}
        permissionCode="export-meragecancel"
        permissionMeaning="按钮-取消合并"
      />,
    ];
    const printButtons = [
      <BatchButtons
        key="exportPrint"
        onClick={() => this.handleExportPrintFiles(0, 'null')}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.export').d('导出打印文件')}
        permissionCode="export-print"
        permissionMeaning="按钮-导出打印文件"
      />,
      <BatchButtons
        key="invoiceAndListPrint"
        onClick={() => this.handleExportPrintFiles(1, 'ALL')}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.invoiceAndListPrint').d('打印发票及清单')}
        permissionCode="invoice-list-print"
        permissionMeaning="按钮-打印发票及清单"
      />,
      <BatchButtons
        key="invoicePrint"
        onClick={() => this.handleExportPrintFiles(1, 'INVOICE')}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.invoicePrint').d('打印发票')}
        permissionCode="invoice-print"
        permissionMeaning="按钮-打印发票"
      />,
      <BatchButtons
        key="listPrint"
        onClick={() => this.handleExportPrintFiles(1, 'LIST')}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.listPrint').d('打印清单')}
        permissionCode="list-print"
        permissionMeaning="按钮-打印清单"
      />,
    ];
    const batchMenu = (
      <Menu>
        {batchButtons.map(action => (
          <MenuItem>{action}</MenuItem>
        ))}
      </Menu>
    );
    const mergeMenu = (
      <Menu>
        {mergeButtons.map(action => (
          <MenuItem>{action}</MenuItem>
        ))}
      </Menu>
    );
    const printMenu = (
      <Menu>
        {printButtons.map(action => (
          <MenuItem>{action}</MenuItem>
        ))}
      </Menu>
    );
    return [
      <PermissionButton
        type="c7n-pro"
        key="add"
        onClick={() => this.handleGotoDetailPage(true, null)}
        disabled={btnDisabled}
        permissionList={[
          {
            code: `${permissionPath}.button.manual-new`,
            type: 'button',
            meaning: '按钮-手工录入',
          },
        ]}
      >
        {intl.get('hiop.invoiceReq.button.manualAdd').d('手工录入')}
      </PermissionButton>,
      <PermissionButton
        type="c7n-pro"
        key="blankWaste"
        onClick={() => this.handleBlankInvoiceVoid()}
        disabled={btnDisabled}
        permissionList={[
          {
            code: `${permissionPath}.button.blank-waste`,
            type: 'button',
            meaning: '按钮-空白废申请',
          },
        ]}
      >
        {intl.get('hiop.invoiceReq.button.blankWaste').d('空白废申请')}
      </PermissionButton>,
      <BatchButtons
        key="permissionAssign"
        onClick={this.handleGotoPermissionPage}
        dataSet={this.props.reqListDS}
        title={intl.get('hiop.invoiceWorkbench.button.dataPermission').d('数据权限分配')}
        permissionCode="permission-assign"
        permissionMeaning="按钮-数据权限分配"
        condition="permissionAssign"
      />,
      <Dropdown overlay={batchMenu}>
        <Button>
          {intl.get('hiop.invoiceWorkbench.button.batch').d('批量')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <Dropdown overlay={mergeMenu}>
        <Button>
          {intl.get('hiop.invoiceReq.button.merge').d('合并')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
      <Dropdown overlay={printMenu}>
        <Button>
          {intl.get('hiop.invoiceWorkbench.button.invoicePrintCollection').d('发票打印')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>,
    ];
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get('htc.common.orderSeq').d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      {
        name: 'requestStatus',
        width: 280,
        renderer: ({ value, text, record }) => {
          const requestNumber = record?.get('requestNumber');
          let color = '';
          let textColor = '';
          switch (value) {
            case 'N':
              color = '#DBEEFF';
              textColor = '#3889FF';
              break;
            case 'F':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case 'C':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case 'E':
              color = '#FFDCD4';
              textColor = '#FF5F57';
              break;
            case 'Q':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            default:
              break;
          }
          return (
            <>
              <Tag color={color} style={{ color: textColor }}>
                {text}
              </Tag>
              <a onClick={() => this.handleGotoDetailPage(false, record)}>{requestNumber}</a>
            </>
          );
        },
      },
      { name: 'sourceType' },
      { name: 'invoiceType' },
      { name: 'requestType', width: 140 },
      { name: 'buyerName', width: 200 },
      { name: 'totalAmount', width: 150 },
      { name: 'totalTaxAmount', width: 150 },
      { name: 'totalIssuesAmount', width: 150 },
      { name: 'totalIssuesTaxAmount', width: 150 },
      { name: 'salerName', width: 200 },
      { name: 'billFlag', width: 120 },
      { name: 'reservationCode', width: 300 },
      { name: 'applicantName' },
      { name: 'authEmployees', width: 200 },
      { name: 'reviewerName' },
      { name: 'reviewDate', width: 160 },
      { name: 'sourceNumber', width: 240 },
      { name: 'sourceNumber1', width: 120 },
      { name: 'sourceNumber2', width: 120 },
      { name: 'orderNums', width: 300 },
      { name: 'invoiceNums' },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'buyerAddressPhone', width: 300 },
      { name: 'buyerAccount', width: 300 },
      { name: 'buyerType', width: 120 },
      { name: 'electronicType', width: 120 },
      { name: 'emailPhone', width: 200 },
      { name: 'paperRecipient' },
      { name: 'paperPhone', width: 120 },
      { name: 'paperAddress', width: 200 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'salerAddressPhone', width: 300 },
      { name: 'salerAccount', width: 300 },
      { name: 'salerType', width: 120 },
      { name: 'systemCode' },
      { name: 'documentTypeCode', width: 120 },
      { name: 'creationDate', width: 160 },
      { name: 'deleteFlag' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 200,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
      },
    ];
  }

  /**
   * 获取数据
   */
  @Bind()
  async getData() {
    await runReport(tenantId);
  }

  render() {
    return (
      <>
        <Header title={intl.get('hiop.invoiceReq.title.invoiceReq').d('业财票聚合中心')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/requisition-headers/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <Button onClick={() => this.handleImport()}>
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.reqListDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 450 }}
          />
        </Content>
      </>
    );
  }
}
