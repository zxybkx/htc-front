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
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import withProps from 'utils/withProps';
import queryString from 'query-string';
import { Button as PermissionButton } from 'components/Permission';
import { openTab, closeTab } from 'utils/menuTab';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import ExcelExport from 'components/ExcelExport';
import commonConfig from '@common/config/commonConfig';
import {
  Button,
  DataSet,
  DateTimePicker,
  Form,
  Lov,
  Output,
  Select,
  Table,
  TextField,
  Currency,
  Modal,
} from 'choerodon-ui/pro';
import { Col, Row } from 'choerodon-ui';
import { getPresentMenu, base64toBlob } from '@common/utils/utils';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { find, isEmpty, forEach } from 'lodash';
import moment from 'moment';
import { getCurrentEmployeeInfoOut } from '@common/services/commonService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  batchExport,
  refresh,
  batchSubmit,
  batchRemove,
  batchCancelSubmitOrder,
  exportPrintFile,
  batchExportNoZip,
  updatePrintNum,
} from '@src/services/invoiceOrderService';
import { judgeRedFlush } from '@src/services/invoiceReqService';
import InvoiceWorkbenchDS from '../stores/InvoiceWorkbenchDS';

const modelCode = 'hiop.invoice-workbench';
const tenantId = getCurrentOrganizationId();
const API_PREFIX = commonConfig.IOP_API || '';
const permissionPath = `${getPresentMenu().name}.ps`;

interface InvoiceWorkbenchPageProps {
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
    }
  }

  @Bind()
  async handleCompanyChange(value) {
    if (value) {
      const { companyId } = value;
      this.setState({ curCompanyId: companyId });
    }
  }

  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    const { showMore } = this.state;
    if (queryDataSet) {
      const queryMoreArray: JSX.Element[] = [];
      queryMoreArray.push(<DateTimePicker name="invoiceDate" />);
      queryMoreArray.push(<DateTimePicker name="invoiceDateTo" />);
      queryMoreArray.push(<DateTimePicker name="submitDate" />);
      queryMoreArray.push(<DateTimePicker name="submitDateTo" />);
      /*---*/
      queryMoreArray.push(<Lov name="employeeNameObj" />);
      queryMoreArray.push(<TextField name="invoiceSourceFlag" />);
      queryMoreArray.push(<Select name="purchaseInvoiceFlag" />);
      queryMoreArray.push(<Select name="invoiceVariety" />);
      /*---*/
      queryMoreArray.push(<TextField name="buyerName" colSpan={2} />);
      queryMoreArray.push(<Select name="printFlag" />);
      queryMoreArray.push(<Currency name="invoiceAmount" />);
      queryMoreArray.push(<TextField name="sellerName" colSpan={2} />);
      queryMoreArray.push(<TextField name="invoiceCode" />);
      queryMoreArray.push(<TextField name="invoiceNo" />);
      return (
        <>
          <Form columns={4} dataSet={queryDataSet}>
            <Lov
              name="companyObj"
              colSpan={2}
              onChange={(value) => this.handleCompanyChange(value)}
            />
            <Output name="employeeDesc" colSpan={1} />
            <Output name="taxpayerNumber" colSpan={1} />
            {/*---*/}
            <Output name="addressPhone" colSpan={2} />
            <Output name="bankNumber" colSpan={2} />
            {/*---*/}
            <Select name="invoiceState" />
            <Select name="billingType" />
            <Select name="invoiceSourceType" />
            <TextField name="invoiceSourceOrder" />
            {/*---*/}
            <DateTimePicker name="creationDate" />
            <DateTimePicker name="creationDateTo" />
            <Select name="orderStatus" />
            <TextField name="orderNumber" />
            {showMore && queryMoreArray}
          </Form>
          <Row type="flex" justify="space-between">
            <Col span={18}>{buttons}</Col>
            <Col span={6} style={{ textAlign: 'end', marginBottom: '2px' }}>
              <Button onClick={() => this.setState({ showMore: !showMore })}>
                {showMore
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                onClick={() => {
                  queryDataSet.reset();
                  queryDataSet.create();
                }}
              >
                {intl.get(`${modelCode}.button.reset`).d('重置')}
              </Button>
              <Button color={ButtonColor.primary} onClick={() => dataSet.query()}>
                {intl.get(`${modelCode}.button.save`).d('查询')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return <></>;
  }

  // 导出
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

  // 导入
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
          action: intl.get(`${modelCode}.view.invoiceReqImport`).d('开票订单导入'),
          tenantId,
          args: argsParam,
        }),
      });
    }
  }

  // 刷新状态（批量）
  @Bind()
  async batchFresh() {
    const list = this.props.invoiceWorkbenchDS.selected.map((record) => record.toData());
    const unSubmit = find(list, (item) => item.orderStatus !== 'C' && item.orderStatus !== 'I');
    if (unSubmit) {
      return notification.warning({
        description: '',
        message: intl
          .get(`${modelCode}.view.unSubmit`)
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
          message: intl.get(`${modelCode}.view.success`).d('刷新成功'),
        });
        this.props.invoiceWorkbenchDS.query();
      }
    }
  }

  // 刷新状态（单条）
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
        message: intl.get(`${modelCode}.view.success`).d('刷新成功'),
      });
      this.props.invoiceWorkbenchDS.query();
    }
  }

  // 手工开票
  @Bind()
  handleManualInvoice() {
    const { dispatch } = this.props;
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    if (queryDataSet) {
      const curInfo = queryDataSet.current!.toData();
      const { companyObj } = curInfo;
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/invoice-workbench/invoiceOrder/invoiceOrder/${companyObj.companyId}`,
          // search: querystring.stringify({
          //   companyInfo: encodeURIComponent(JSON.stringify(companyObj)),
          // }),
        })
      );
    }
  }

  // 数据权限分配
  @Bind()
  handlePermission() {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    const selectedList = this.props.invoiceWorkbenchDS.selected
      .map((rec) => rec.get('invoicingOrderHeaderId'))
      .join(',');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/permission-assign/ORDER/${curCompanyId}/${selectedList}`,
      })
    );
  }

  // 批量提交
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
          .get(`${modelCode}.view.unSubmit`)
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
          message: intl.get(`${modelCode}.view.success`).d('批量提交成功'),
        });
      }
      this.props.invoiceWorkbenchDS.query();
    }
  }

  // 批量取消
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
          .get(`${modelCode}.view.unCancel`)
          .d('存在非开具中或非异常状态发票，无法批量取消'),
      });
    }
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
        cancelOrderHeaderList,
      };
      const res = getResponse(await batchCancelSubmitOrder(params));
      if (res) {
        notification.success({
          description: '',
          message: intl.get(`${modelCode}.view.success`).d('取消成功'),
        });
        this.props.invoiceWorkbenchDS.query();
      }
    }
  }

  // 批量删除
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
        message: intl.get(`${modelCode}.view.unSubmit`).d('存在非新建或取消状态发票，无法批量删除'),
      });
    }
    const params = {
      tenantId,
      invoicingOrderHeaderList,
    };
    const res = getResponse(await batchRemove(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.success`).d('删除成功'),
      });
      this.props.invoiceWorkbenchDS.query();
    }
  }

  // 空白废开具
  @Bind()
  handleBlankInvoiceVoid() {
    const { dispatch } = this.props;
    const { curCompanyId } = this.state;
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-workbench/invoiceVoid/${curCompanyId}`,
      })
    );
  }

  // 发票作废
  @Bind()
  handleInvoiceVoid(record) {
    const { dispatch } = this.props;
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    const companyId = record.get('companyId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-workbench/invoiceLineVoid/${invoicingOrderHeaderId}/${companyId}`,
      })
    );
  }

  // 发票红冲
  @Bind()
  async handleInvoiceRed(record) {
    const { dispatch } = this.props;
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
      dispatch(
        routerRedux.push({
          pathname: `/htc-front-iop/invoice-workbench/invoiceRedFlush/${invoicingOrderHeaderId}/${companyId}`,
        })
      );
    }
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
    // this.props.invoiceWorkbenchDS.query();
  }

  // 导出打印文件/打印发票
  @Bind()
  async handleExport(type) {
    const exportOrderHeaderList = this.props.invoiceWorkbenchDS.selected.map((record) =>
      record.toData()
    );
    const incompatible = find(exportOrderHeaderList, (item) => item.orderStatus !== 'F');
    const tips = type === 0 ? '无法导出打印文件' : '无法打印发票';
    if (incompatible) {
      return notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.incompatible`).d(`存在非完成状态发票，${tips}`),
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
          .get(`${modelCode}.view.unInvoiceState`)
          .d(`存在发票种类为电子普票或电子专票的发票，${tips}`),
      });
    }
    const unBillType = find(exportOrderHeaderList, (item) =>
      ['3', '4', '5'].includes(item.billingType)
    );
    if (unBillType) {
      return notification.warning({
        description: '',
        message: intl.get(`${modelCode}.view.unInvoiceState`).d(`存在作废的发票，${tips}`),
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
          exportOrderHeaderList,
        };
      } else {
        params = {
          tenantId,
          companyCode,
          employeeNumber,
          allCheckFlag,
          exportOrderHeaderList,
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
  }

  // 编辑/查看
  @Bind()
  editAndView(record) {
    const { dispatch } = this.props;
    const invoicingOrderHeaderId = record.get('invoicingOrderHeaderId');
    dispatch(
      routerRedux.push({
        pathname: `/htc-front-iop/invoice-workbench/edit/invoiceOrder/${record.get(
          'companyId'
        )}/${invoicingOrderHeaderId}`,
      })
    );
  }

  // 提交订单
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
        message: intl.get(`${modelCode}.view.success`).d('提交成功'),
      });
    }
    this.props.invoiceWorkbenchDS.query();
  }

  // 行打印文件
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
              message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
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
        // const blob = new Blob([res]); // 字节流
        // if (window.navigator.msSaveBlob) {
        //   try {
        //     window.navigator.msSaveBlob(blob, item);
        //   } catch (e) {
        //     notification.error({
        //       description: '',
        //       message: intl.get(`${modelCode}.view.ieUploadInfo`).d('下载失败'),
        //     });
        //   }
        // } else {
        //   const aElement = document.createElement('a');
        //   const blobUrl = window.URL.createObjectURL(blob);
        //   aElement.href = blobUrl; // 设置a标签路径
        //   aElement.download = item;
        //   aElement.click();
        //   window.URL.revokeObjectURL(blobUrl);
        // }
      });
      const printElement = document.createElement('a');
      printElement.href = 'Webshell://'; // 设置a标签路径
      printElement.click();
    }
  }

  // 单条删除
  @Bind()
  async handleSingleDelete(record) {
    const data = record.toData();
    const params = {
      tenantId,
      invoicingOrderHeaderList: [data],
    };
    const res = getResponse(await batchRemove(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.success`).d('删除成功'),
      });
      this.props.invoiceWorkbenchDS.query();
    }
  }

  // 单条取消
  @Bind()
  async handleSingleCancel(record) {
    const data = record.toData();
    const { queryDataSet } = this.props.invoiceWorkbenchDS;
    const { companyId, companyCode, employeeNumber } = data;
    const employeeId = queryDataSet && queryDataSet.current!.get('employeeId');
    const params = {
      tenantId,
      companyId,
      companyCode,
      employeeId,
      employeeNumber,
      cancelOrderHeaderList: [data],
    };
    const res = getResponse(await batchCancelSubmitOrder(params));
    if (res) {
      notification.success({
        description: '',
        message: intl.get(`${modelCode}.view.success`).d('取消成功'),
      });
      this.props.invoiceWorkbenchDS.query();
    }
  }

  // 票面预览
  @Bind()
  previewInvoice(record) {
    const headerId = record.get('invoicingOrderHeaderId');
    const employeeId = record.get('employeeId');
    const { dispatch } = this.props;
    const pathname = `/htc-front-iop/invoice-workbench/invoice-view/ORDER/${headerId}/${employeeId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          invoiceInfo: encodeURIComponent(
            JSON.stringify({
              backPath: '/htc-front-iop/invoice-workbench/list',
            })
          ),
        }),
      })
    );
  }

  @Bind()
  operationsRender(record) {
    const orderStatus = record.get('orderStatus');
    const invoiceVariety = record.get('invoiceVariety');
    const orderProgress = record.get('orderProgress');
    const invoiceState = record.get('invoiceState');
    const billingType = record.get('billingType');
    const invoiceDate = record.get('invoiceDate');
    const invoiceMonth = moment(invoiceDate).month();
    const nowMonth = moment().month();
    const monthAbled = invoiceMonth < nowMonth;
    const renderPermissionButton = (params) => (
      <PermissionButton
        type="c7n-pro"
        funcType={FuncType.flat}
        onClick={params.onClick}
        color={ButtonColor.primary}
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
    const operators = [
      {
        key: 'editAndView',
        ele: (
          <a onClick={() => this.editAndView(record)}>
            {intl.get(`${modelCode}.editAndView`).d('编辑/查看')}
          </a>
        ),
        len: 5,
        title: intl.get(`${modelCode}.editAndView`).d('编辑/查看'),
      },
    ];
    const submitInvoiceBtn = {
      key: 'submitInvoice',
      ele: renderPermissionButton({
        onClick: () => this.submitInvoice(record),
        permissionCode: 'submit-invoice',
        permissionMeaning: '按钮-提交订单',
        title: intl.get(`${modelCode}.submitInvoice`).d('提交订单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.submitInvoice`).d('提交订单'),
    };
    const cancelInvoiceBtn = {
      key: 'cancelInvoice',
      ele: renderPermissionButton({
        onClick: () => this.handleSingleCancel(record),
        permissionCode: 'cancel-invoice',
        permissionMeaning: '按钮-取消订单',
        title: intl.get(`${modelCode}.cancelInvoice`).d('取消订单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.cancelInvoice`).d('取消订单'),
    };
    const printDocBtn = {
      key: 'printDoc',
      ele: renderPermissionButton({
        onClick: () => this.handledDownload(record),
        permissionCode: 'print-doc',
        permissionMeaning: '按钮-打印文件',
        title: intl.get(`${modelCode}.printDoc`).d('打印文件'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.printDoc`).d('打印文件'),
    };
    const invoiceInvalidBtn = {
      key: 'invoiceInvalid',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceVoid(record),
        permissionCode: 'invoice-invalid',
        permissionMeaning: '按钮-发票作废',
        title: intl.get(`${modelCode}.invoiceInvalid`).d('发票作废'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.invoiceInvalid`).d('发票作废'),
    };
    const invoiceRedBtn = {
      key: 'invoiceRed',
      ele: renderPermissionButton({
        onClick: () => this.handleInvoiceRed(record),
        permissionCode: 'invoice-red',
        permissionMeaning: '按钮-发票红冲',
        title: intl.get(`${modelCode}.invoiceRed`).d('发票红冲'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.invoiceRed`).d('发票红冲'),
    };
    const invoicePreviewBtn = {
      key: 'invoicePreview',
      ele: renderPermissionButton({
        onClick: () => this.previewInvoice(record),
        permissionCode: 'invoice-preview',
        permissionMeaning: '按钮-票面预览',
        title: intl.get(`${modelCode}.invoicePreview`).d('票面预览'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.invoicePreview`).d('票面预览'),
    };
    const deleteInvoiceBtn = {
      key: 'deleteInvoice',
      ele: renderPermissionButton({
        onClick: () => this.handleSingleDelete(record),
        permissionCode: 'delete-invoice',
        permissionMeaning: '按钮-删除订单',
        title: intl.get(`${modelCode}.deleteInvoice`).d('删除订单'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.deleteInvoice`).d('删除订单'),
    };
    const freshStateBtn = {
      key: 'freshState',
      ele: renderPermissionButton({
        onClick: () => this.singleFresh(record),
        permissionCode: 'fresh-state',
        permissionMeaning: '按钮-刷新状态',
        title: intl.get(`${modelCode}.freshState`).d('刷新状态'),
      }),
      len: 6,
      title: intl.get(`${modelCode}.freshState`).d('刷新状态'),
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
      !monthAbled
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

  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      { name: 'orderStatus' },
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
      { name: 'orderNumber', width: 260 },
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
        width: 180,
        renderer: ({ record }) => this.operationsRender(record),
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
  }

  get buttons(): Buttons[] {
    const BatchButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
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
    return [
      <BatchButtons
        key="permissionFresh"
        onClick={() => this.batchFresh()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.fresh`).d('刷新状态')}
        permissionCode="permission-fresh"
        permissionMeaning="按钮-刷新状态"
      />,
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
        {intl.get(`${modelCode}.manualInvoice`).d('手工开票')}
      </PermissionButton>,
      <BatchButtons
        key="dataPermission"
        onClick={() => this.handlePermission()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.dataPermission`).d('数据权限分配')}
        permissionCode="data-permission"
        permissionMeaning="按钮-数据权限分配"
      />,
      <BatchButtons
        key="batchSubmit"
        onClick={() => this.handleBatchSubmit()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.batchSubmit`).d('批量提交')}
        permissionCode="batch-submit"
        permissionMeaning="按钮-批量提交"
      />,
      <BatchButtons
        key="batchCancel"
        onClick={() => this.handleBatchCancel()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.batchCancel`).d('批量取消')}
        permissionCode="batch-cancel"
        permissionMeaning="按钮-批量取消"
      />,
      <BatchButtons
        key="batchDelete"
        onClick={() => this.handleBatchDelete()}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.batchDelete`).d('批量删除')}
        permissionCode="batch-delete"
        permissionMeaning="按钮-批量删除"
      />,
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
        {intl.get(`${modelCode}.blankWaste`).d('空白废开具')}
      </PermissionButton>,
      <BatchButtons
        key="exportPrint"
        onClick={() => this.handleExport(0)}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.export`).d('导出打印文件')}
        permissionCode="export-print"
        permissionMeaning="按钮-导出打印文件"
      />,
      <BatchButtons
        key="invoicePrint"
        onClick={() => this.handleExport(1)}
        dataSet={this.props.invoiceWorkbenchDS}
        title={intl.get(`${modelCode}.invoicePrint`).d('打印发票')}
        permissionCode="invoice-print"
        permissionMeaning="按钮-打印发票"
      />,
    ];
  }

  render() {
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('销项发票控制台')}>
          <ExcelExport
            requestUrl={`${API_PREFIX}/v1/${tenantId}/invoicing-order-headers/export`}
            queryParams={() => this.exportParams()}
          />
          <Button onClick={() => this.handleBatchExport()}>
            {intl.get(`${modelCode}.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.invoiceWorkbenchDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
