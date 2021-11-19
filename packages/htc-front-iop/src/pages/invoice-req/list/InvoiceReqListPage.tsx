/**
 * @Description:开票申请
 * @version: 1.0
 * @Author: yang.wang04@hand-china.com
 * @Date: 2020-12-15 16:31:57
 * @LastEditTime: 2021-03-10 17:57:04
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Header, Content } from 'components/Page';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import {
  DataSet,
  Table,
  Lov,
  Button,
  Select,
  TextField,
  Form,
  Output,
  DateTimePicker,
  CheckBox,
  notification,
  Menu,
  Dropdown,
  Icon,
  Modal,
  EmailField,
} from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'utils/intl';
import { openTab, closeTab } from 'utils/menuTab';
import queryString from 'query-string';
import ExcelExport from 'components/ExcelExport';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { forEach, isEmpty } from 'lodash';
import moment from 'moment';
import commonConfig from '@common/config/commonConfig';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import {
  reqSubmit,
  reqCancel,
  reqDelete,
  exportPrintFiles,
  batchMerage,
  cancelMerage,
  exportNotZip,
  runReport,
  judgeRedFlush,
  downloadQrCode,
  sendQrCode,
} from '@src/services/invoiceReqService';
import { getPresentMenu, base64toBlob } from '@common/utils/utils';
import InvoiceReqListDS from '../stores/InvoiceReqListDS';

const modelCode = 'hiop.invoice-req';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceReqListPageProps {
  dispatch: Dispatch<any>;
  reqListDS: DataSet;
}

@formatterCollections({
  code: [modelCode],
})
@connect()
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
  state = { curCompanyId: undefined, sendQrCodeEmail: '' };

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

  // 自定义查询
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, dataSet, buttons } = props;
    if (queryDataSet) {
      return (
        <>
          <Form columns={10} dataSet={queryDataSet}>
            <Lov
              name="companyObj"
              colSpan={4}
              onChange={(value) => this.handleCompanychange(value)}
              clearButton={false}
            />
            <Output name="employeeDesc" colSpan={3} />
            <Output name="taxpayerNumber" colSpan={3} />
            <Output name="companyAddressPhone" colSpan={6} />
            <Output name="bankNumber" colSpan={4} />
            <DateTimePicker name="requestDateFrom" colSpan={2} />
            <DateTimePicker name="requestDateTo" colSpan={2} />
            <DateTimePicker name="reviewDateFrom" colSpan={2} />
            <DateTimePicker name="reviewDateTo" colSpan={2} />
            <Select
              name="invoiceType"
              colSpan={2}
              renderer={({ value, text }) => value && `${value} - ${text}`}
            />
            <Select name="sourceType" colSpan={2} />
            <Select name="requestType" colSpan={2} />
            <Select name="requestStatus" colSpan={2} />
            <TextField name="requestNumber" colSpan={2} />
            <TextField name="sourceNumber" colSpan={2} />
            <TextField name="buyerName" colSpan={4} newLine />
            <TextField name="salerName" colSpan={4} />
            <CheckBox name="deleteFlag" />
            <TextField name="invoiceCode" colSpan={2} newLine />
            <TextField name="invoiceNo" colSpan={2} />
            <Select name="billingType" colSpan={2} />
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={20}>{buttons}</Col>
            <Col span={4} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button
                color={ButtonColor.primary}
                onClick={() => {
                  dataSet.query();
                }}
              >
                {intl.get('hzero.c7nProUI.Table.query_button').d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  @Bind()
  async handleCompanychange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  // 详情
  @Bind()
  handleGotoDetailPage(isCreatePage, record) {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.reqListDS;
    if (queryDataSet) {
      let pathname;
      if (isCreatePage) {
        // 新增页
        const curEmpInfo = queryDataSet.current!.toData();
        pathname = `/htc-front-iop/invoice-req/create/${curEmpInfo.companyId}`;
      } else {
        // 编辑页
        pathname = `/htc-front-iop/invoice-req/detail/${record.get('companyId')}/${record.get(
          'headerId'
        )}`;
      }
      dispatch(
        routerRedux.push({
          pathname,
        })
      );
    }
  }

  // 数据权限分配
  @Bind()
  handleGotoPermissionPage() {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.get('headerId')).join(',');
    const pathname = `/htc-front-iop/permission-assign/REQUEST/${curCompanyId}/${selectedList}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  // 提交申请
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
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    }
  }

  // 取消申请
  @Bind()
  async handleApplyCancel(records) {
    const { queryDataSet } = this.props.reqListDS;
    const employeeId = queryDataSet && queryDataSet.current!.get('employeeId');
    const params = {
      tenantId,
      requisitionHeaderList: records,
      employeeId,
    };
    const res = getResponse(await reqCancel(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    }
  }

  // 删除申请
  @Bind()
  async handleApplyDelete(records) {
    const params = {
      tenantId,
      requisitionHeaderList: records,
    };
    const res = getResponse(await reqDelete(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    }
  }

  // 下载二维码
  @Bind()
  async handleDownloadQrCode() {
    const qrCodeUrl = this.props.reqListDS.current!.get('qrCodeUrl');
    const params = {
      tenantId,
      qrCodeUrl,
    };
    const res = getResponse(await downloadQrCode(params));
    const blob = new Blob([base64toBlob(res.data.fileBase)]);
    if (window.navigator.msSaveBlob) {
      try {
        window.navigator.msSaveBlob(blob);
      } catch (e) {
        notification.error({
          description: '',
          message: intl.get(`${modelCode}.view.message.error`).d('二维码下载失败'),
        });
      }
    } else {
      const aElement = document.createElement('a');
      const blobUrl = window.URL.createObjectURL(blob);
      aElement.href = blobUrl; // 设置a标签路径
      aElement.download = res.data.fileName;
      aElement.click();
      window.URL.revokeObjectURL(blobUrl);
    }
  }

  // 发送二维码
  @Bind()
  async handleSendQrCode() {
    const qrCodeUrl = this.props.reqListDS.current!.get('qrCodeUrl');
    const requisitionNumber = this.props.reqListDS.current!.get('requestNumber');
    const companyName = this.props.reqListDS.current!.get('companyName');
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
      title: intl.get(`${modelCode}.modal.title`).d('收件人邮箱：'),
      center: true,
      children: <EmailField onBlur={(e) => toggleOkDisabled(e, myModal)} />,
      okProps: { disabled: true },
      onOk: async () => {
        const params = {
          tenantId,
          qrCodeUrl,
          email: this.state.sendQrCodeEmail,
          companyName,
          requisitionNumber,
        };
        const res = getResponse(await sendQrCode(params));
        if (res) {
          notification.success({
            description: '',
            message: intl.get('sendQrCode.message.success').d('发送成功'),
          });
        }
      },
    });
  }

  // 查看订单
  @Bind()
  handleViewOrder(headerId) {
    const { dispatch } = this.props;
    const pathname = `/htc-front-iop/invoice-req/order/${headerId}`;
    // openTab({
    //   key: pathname,
    //   path: pathname,
    //   title: intl.get(`${modelCode}.invoiceReq.order.title`).d('开票订单信息'),
    //   closable: true,
    //   type: 'menu',
    // });
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-iop/invoice-req/list',
            })
          ),
        }),
      })
    );
  }

  // 查看发票
  @Bind()
  handleViewInvoice(recordData) {
    const { headerId, sourceType } = recordData;
    const { dispatch } = this.props;
    const pathname = `/htc-front-iop/invoice-req/invoice-view/REQUEST/${headerId}/${sourceType}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-iop/invoice-req/list',
            })
          ),
        }),
      })
    );
  }

  // 批量提交
  @Bind()
  handleBatchApplySubmit() {
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    if (
      selectedList.some((sl) => !['N', 'Q'].includes(sl.requestStatus)) ||
      selectedList.some((sl) => ['Y'].includes(sl.deleteFlag))
    ) {
      notification.warning({
        message: intl.get(`${modelCode}.view.submitInvalid`).d('存在不能提交的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplySubmit(selectedList.map((sl) => sl.headerId));
  }

  @Bind()
  async handleMerage(lists) {
    const { queryDataSet } = this.props.reqListDS;
    const headerIds = lists.map((rec) => rec.headerId).join(',');
    if (queryDataSet) {
      const companyCode = queryDataSet.current!.get('companyCode');
      const employeeNumber = queryDataSet.current!.get('employeeNum');
      const params = {
        tenantId,
        companyCode,
        employeeNumber,
        headerIds,
      };
      const res = await batchMerage(params);
      if (res && res.successFlag) {
        notification.success({
          description: '',
          message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
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

  // 合并
  @Bind()
  async handleBatchMerage() {
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    if (
      selectedList.some(
        (item) =>
          !['N', 'Q'].includes(item.requestStatus) ||
          item.deleteFlag === 'H' ||
          ['7', '8', '9', '10'].includes(item.sourceType)
      )
    ) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.merageCancelInvalid`)
          .d(
            '存在已合并、非新建/取消状态或来源类型为发票红冲/发票作废/空白废/红字信息表的数据，请重新勾选'
          ),
        description: '',
      });
      return;
    }
    this.handleMerage(selectedList);
  }

  @Bind()
  async handleMerCancel(lists) {
    const headerIds = lists.map((rec) => rec.headerId).join(',');
    const params = {
      tenantId,
      headerIds,
    };
    const res = await cancelMerage(params);
    if (res && res.successFlag) {
      notification.success({
        description: '',
        message: intl.get('hadm.hystrix.view.message.title.success').d('操作成功'),
      });
      this.props.reqListDS.query(this.props.reqListDS.currentPage || 0);
    } else {
      notification.warning({
        description: '',
        message: res && res.errorHeadMsg,
      });
    }
  }

  // 取消合并
  @Bind()
  handleMerageCancel() {
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    if (
      selectedList.some(
        (item) => item.deleteFlag === 'Y' || !['N', 'Q'].includes(item.requestStatus)
      )
    ) {
      notification.warning({
        message: intl
          .get(`${modelCode}.view.merageCancelInvalid`)
          .d('存在已取消合并或非新建/取消状态的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleMerCancel(selectedList);
  }

  // 批量取消
  @Bind()
  handleBatchApplyCancel() {
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    if (selectedList.some((sl) => !['N', 'E', 'C'].includes(sl.requestStatus))) {
      notification.warning({
        message: intl.get(`${modelCode}.view.cancelInvalid`).d('存在不能取消的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplyCancel(selectedList);
  }

  // 批量删除
  @Bind()
  handleBatchApplyDelete() {
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    if (selectedList.some((sl) => !['N', 'Q'].includes(sl.requestStatus))) {
      notification.warning({
        message: intl.get(`${modelCode}.view.deleteInvalid`).d('存在不能删除的数据，请重新勾选'),
        description: '',
      });
      return;
    }
    this.handleApplyDelete(selectedList);
  }

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
            message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
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
    // this.props.reqListDS.query();
  }

  // 导出打印文件
  @Bind()
  async handleExportPrintFiles(type) {
    const { queryDataSet } = this.props.reqListDS;
    const selectedList = this.props.reqListDS.selected.map((rec) => rec.toData());
    const companyCode = queryDataSet && queryDataSet.current?.get('companyCode');
    const employeeNumber = queryDataSet && queryDataSet.current?.get('employeeNum');
    if (selectedList.some((sl) => ['N', 'Q'].includes(sl.requestStatus))) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.incompatible.completedQuantity`)
          .d('存在新建/取消状态的发票，无法导出打印文件'),
      });
      return;
    }
    if (!selectedList.some((sl) => sl.completedQuantity > 0)) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.incompatible.completedQuantity`)
          .d('不存在完成的发票，无法导出打印文件'),
      });
      return;
    }
    if (selectedList.some((sl) => ['51', '52'].includes(sl.invoiceType))) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.incompatible.invoiceType`)
          .d('存在发票种类为电子普票或者电子专票发票，无法导出打印文件'),
      });
      return;
    }
    if (selectedList.some((sl) => sl.sourceType === '8')) {
      notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.incompatible.invoiceType`)
          .d('存在作废的发票，无法导出打印文件'),
      });
      return;
    }
    const params = {
      tenantId,
      companyCode,
      employeeNumber,
      invoiceRequisitionHeaderIds: selectedList.map((d) => d.headerId).join(','),
    };
    // 导出打印(zip)
    if (type === 0) {
      const res = await exportPrintFiles(params);
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
      const res = getResponse(await exportNotZip(params));
      if (res) {
        res.forEach((item) => {
          const blob = new Blob([base64toBlob(item.data)]);
          if (window.navigator.msSaveBlob) {
            try {
              window.navigator.msSaveBlob(blob, item.fileName);
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
            aElement.download = item.fileName;
            aElement.click();
            window.URL.revokeObjectURL(blobUrl);
          }
        });
        const printElement = document.createElement('a');
        printElement.href = 'Webshell://'; // 设置a标签路径
        printElement.click();
      }
    }
  }

  // 空白废申请
  @Bind()
  handleBlankInvoiceVoid() {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-req/invoiceVoid/REQUEST/${curCompanyId}`,
      })
    );
  }

  // 作废申请
  @Bind()
  handleInvoiceVoid(record) {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const headerId = record.get('headerId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-req/invoiceMain-void/REQUEST/${headerId}/${curCompanyId}`,
      })
    );
  }

  // 红冲申请
  @Bind()
  async handleInvoiceRed(record) {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const headerId = record.get('headerId');
    const params = {
      tenantId,
      headerId,
    };
    const res = await judgeRedFlush(params);
    if (res && res.failed) {
      notification.error({
        description: '',
        message: res && res.message,
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/invoice-req/invoiceMain-redFlush/REQUEST/${headerId}/${curCompanyId}`,
        })
      );
    }
  }

  // 操作渲染
  @Bind()
  optionsRender(record) {
    const headerId = record.get('headerId');
    const recordData = record.toData();
    const renderPermissionButton = (params) => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.flat}
        onClick={params.onClick}
        color={ButtonColor.primary}
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
        title: intl.get(`${modelCode}.button.applySubmit`).d('提交申请'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.applySubmit`).d('提交申请'),
    };
    const applyCancelBtn = {
      key: 'applyCancel',
      ele: renderPermissionButton({
        onClick: () => this.handleApplyCancel([record.toData()]),
        permissionCode: 'cancel-req',
        permissionMeaning: '按钮-取消申请',
        title: intl.get(`${modelCode}.button.applyCancel`).d('取消申请'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.applyCancel`).d('取消申请'),
    };
    const applyDeleteBtn = {
      key: 'applyDelete',
      ele: renderPermissionButton({
        onClick: () => this.handleApplyDelete([record.toData()]),
        permissionCode: 'delete-req',
        permissionMeaning: '按钮-删除申请',
        title: intl.get(`${modelCode}.button.applyDelete`).d('删除申请'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.applyDelete`).d('删除申请'),
    };
    const viewOrderBtn = {
      key: 'viewOrder',
      ele: renderPermissionButton({
        onClick: () => this.handleViewOrder(headerId),
        permissionCode: 'view-order',
        permissionMeaning: '按钮-查看订单',
        title: intl.get(`${modelCode}.button.viewOrder`).d('查看订单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.viewOrder`).d('查看订单'),
    };
    const viewInvoiceBtn = {
      key: 'viewInvoice',
      ele: (
        <Button
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          onClick={() => this.handleViewInvoice(recordData)}
        >
          {intl.get(`${modelCode}.button.viewInvoice`).d('查看发票')}
        </Button>
      ),
      len: 6,
      title: intl.get(`${modelCode}.button.viewInvoice`).d('查看发票'),
    };
    const invoiceInvalidBtn = {
      key: 'invoiceVoid',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceVoid(record),
        permissionCode: 'invoice-void',
        permissionMeaning: '按钮-发票作废',
        title: intl.get(`${modelCode}.invoiceVoid`).d('发票作废'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.invoiceVoid`).d('发票作废'),
    };
    const invoiceRedBtn = {
      key: 'invoiceRed',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceRed(record),
        permissionCode: 'invoice-red-flush',
        permissionMeaning: '按钮-发票红冲',
        title: intl.get(`${modelCode}.invoiceRed`).d('发票红冲'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.invoiceRed`).d('发票红冲'),
    };
    // 下载二维码
    const downloadQrCodeBtn = {
      key: 'downloadQrCode',
      ele: renderPermissionButton({
        onClick: () => this.handleDownloadQrCode(),
        permissionCode: 'download-qr-code',
        permissionMeaning: '下载二维码',
        title: intl.get(`${modelCode}.button.downloadQrCode`).d('下载二维码'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.downloadQrCode`).d('下载二维码'),
    };
    const sendQrCodeBtn = {
      key: 'sendQrCode',
      ele: renderPermissionButton({
        onClick: () => this.handleSendQrCode(),
        permissionCode: 'send-qr-code',
        permissionMeaning: '发送二维码',
        title: intl.get(`${modelCode}.button.sendQrCode`).d('发送二维码'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.button.sendQrCode`).d('发送二维码'),
    };
    const requestStatus = record.get('requestStatus');
    const deleteFlag = record.get('deleteFlag');
    const orderCount = record.get('orderCount');
    const sourceType = record.get('sourceType');
    const requestType = record.get('requestType');

    if (['N', 'Q'].includes(requestStatus) && deleteFlag === 'N') {
      operators.push(applySubmitBtn);
    }
    // “新建”、“异常”、“提交”
    if (['N', 'E', 'C'].includes(requestStatus) && deleteFlag === 'N') {
      operators.push(applyCancelBtn);
    }
    // “新建”、“取消”
    if (['N', 'Q'].includes(requestStatus) && deleteFlag === 'N') {
      operators.push(applyDeleteBtn);
    }
    // 提交”、“完成”
    if (['C', 'F', 'E'].includes(requestStatus) && deleteFlag === 'N') {
      operators.push(viewOrderBtn);
    }
    // 完成”、“异常”
    if (['F', 'E'].includes(requestStatus) && deleteFlag === 'N') {
      operators.push(viewInvoiceBtn);
    }
    // 发票作废
    if (['F', 'E'].includes(requestStatus) && deleteFlag === 'N' && orderCount === 1) {
      operators.push(invoiceInvalidBtn);
    }
    // 发票红冲
    if (
      ['F', 'E'].includes(requestStatus) &&
      deleteFlag === 'N' &&
      orderCount === 1 &&
      sourceType !== '7'
    ) {
      operators.push(invoiceRedBtn);
    }
    // 生成二维码
    if (requestType === 'PURCHASE_INVOICE_SUBSCRIBE' || requestType === 'SALES_INVOICE_SUBSCRIBE') {
      operators.push(downloadQrCodeBtn, sendQrCodeBtn);
    }
    // const newOperators = operators.filter(Boolean);
    // return operatorRender(newOperators, record, { limit: 2 });
    const btnMenu = (
      <Menu>
        {operators.map((action) => {
          const { key } = action;
          return <Menu.Item key={key}>{action.ele}</Menu.Item>;
        })}
      </Menu>
    );
    return (
      <span className="action-link">
        <a onClick={() => this.handleGotoDetailPage(false, record)}>
          {intl.get(`${modelCode}.button.viewDetail`).d('详情/编辑')}
        </a>
        <Dropdown overlay={btnMenu}>
          <a>
            {intl.get('hzero.common.button.action').d('操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
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
          action: intl.get(`${modelCode}.view.invoiceReqImport`).d('开票申请导入'),
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
    const queryParams = this.props.reqListDS.queryDataSet?.map((data) => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const exportParams = { ...queryParams[0] } || {};
    return exportParams;
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
      if (props.condition === 'batchDelete' || props.condition === 'batchSubmit') {
        isDisabled = !props.dataSet!.selected.some((sl) => sl.get('deleteFlag') !== 'Y');
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
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
    const MerageBtn = observer((props: any) => {
      let isDisabled = props.dataSet!.selected.length < 2;
      if (props.condition === 'batchDelete') {
        isDisabled = !props.dataSet!.selected.some((sl) => sl.get('deleteFlag') !== 'Y');
      }
      return (
        <PermissionButton
          type="c7n-pro"
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
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
        {intl.get(`${modelCode}.button.manualAdd`).d('手工录入')}
      </PermissionButton>,
      <BatchButtons
        key="permissionAssign"
        onClick={this.handleGotoPermissionPage}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.permissionAssign`).d('数据权限分配')}
        permissionCode="permission-assign"
        permissionMeaning="按钮-数据权限分配"
      />,
      <BatchButtons
        key="batchCancel"
        onClick={this.handleBatchApplyCancel}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.batchCancel`).d('批量取消')}
        permissionCode="batch-cancel"
        permissionMeaning="按钮-批量取消"
      />,
      <BatchButtons
        key="batchDelete"
        onClick={this.handleBatchApplyDelete}
        dataSet={this.props.reqListDS}
        condition="batchDelete"
        title={intl.get(`${modelCode}.button.batchDelete`).d('批量删除')}
        permissionCode="batch-delete"
        permissionMeaning="按钮-批量删除"
      />,
      <BatchButtons
        key="batchSubmit"
        onClick={this.handleBatchApplySubmit}
        dataSet={this.props.reqListDS}
        condition="batchSubmit"
        title={intl.get(`${modelCode}.button.batchSubmit`).d('批量提交')}
        permissionCode="batch-submit"
        permissionMeaning="按钮-批量提交"
      />,
      <MerageBtn
        key="batchMerage"
        onClick={this.handleBatchMerage}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.batchMerage`).d('合并')}
        permissionCode="batch-nmerage"
        permissionMeaning="按钮-合并"
      />,
      <BatchButtons
        key="merageCancel"
        onClick={this.handleMerageCancel}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.merageCancel`).d('取消合并')}
        permissionCode="export-meragecancel"
        permissionMeaning="按钮-取消合并"
      />,
      <BatchButtons
        key="exportPrint"
        onClick={() => this.handleExportPrintFiles(0)}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.exportPrint`).d('导出打印文件')}
        permissionCode="export-print"
        permissionMeaning="按钮-导出打印文件"
      />,
      <BatchButtons
        key="invoicePrint"
        onClick={() => this.handleExportPrintFiles(1)}
        dataSet={this.props.reqListDS}
        title={intl.get(`${modelCode}.button.invoicePrint`).d('打印发票')}
        permissionCode="invoice-print"
        permissionMeaning="按钮-打印发票"
      />,
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
        {intl.get(`${modelCode}.button.manualAdd`).d('空白废申请')}
      </PermissionButton>,
    ];
  }

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record, dataSet }) => {
          return dataSet && record ? dataSet.indexOf(record) + 1 : '';
        },
      },
      { name: 'requestStatus' },
      { name: 'sourceType' },
      { name: 'invoiceType' },
      { name: 'requestType', width: 140 },
      { name: 'buyerName', width: 200 },
      { name: 'totalAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalIssuesAmount', width: 150, align: ColumnAlign.right },
      { name: 'totalIssuesTaxAmount', width: 150, align: ColumnAlign.right },
      { name: 'salerName', width: 200 },
      { name: 'billFlag' },
      { name: 'reservationCode', width: 300 },
      { name: 'applicantName' },
      { name: 'authEmployees', width: 200 },
      { name: 'reviewerName' },
      { name: 'reviewDate', width: 160 },
      { name: 'requestNumber', width: 240 },
      { name: 'sourceNumber', width: 240 },
      { name: 'sourceNumber1', width: 120 },
      { name: 'sourceNumber2', width: 120 },
      { name: 'orderNums', width: 300 },
      { name: 'invoiceNums' },
      { name: 'buyerTaxNo', width: 180 },
      { name: 'buyerAddressPhone', width: 300 },
      { name: 'buyerAccount', width: 300 },
      { name: 'buyerType' },
      { name: 'electronicType', width: 120 },
      { name: 'emailPhone', width: 200 },
      { name: 'paperRecipient' },
      { name: 'paperPhone', width: 120 },
      { name: 'paperAddress', width: 200 },
      { name: 'salerTaxNo', width: 180 },
      { name: 'salerAddressPhone', width: 300 },
      { name: 'salerAccount', width: 300 },
      { name: 'salerType' },
      { name: 'creationDate', width: 160 },
      { name: 'deleteFlag' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 180,
        renderer: ({ record }) => this.optionsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  @Bind()
  async getData() {
    await runReport(tenantId);
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('业财票聚合中心')}>
          <Button onClick={() => this.handleImport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/requisition-headers/export`}
            queryParams={() => this.handleGetQueryParams()}
          />
          <PermissionButton
            type="c7n-pro"
            key="getData"
            onClick={() => this.getData()}
            permissionList={[
              {
                code: `${permissionPath}.button.get-data`,
                type: 'button',
                meaning: '按钮-获取数据',
              },
            ]}
          >
            {intl.get(`${modelCode}.button.getData`).d('获取数据')}
          </PermissionButton>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.reqListDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
