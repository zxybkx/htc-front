/**
 * @Description:项目申请管理
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-14 9:45:22
 * @LastEditTime: 2022-06-20 16:51:22
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';
import { Content, Header } from 'components/Page';
import withProps from 'utils/withProps';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { API_HOST } from 'utils/config';
import { Bind } from 'lodash-decorators';
import { Col, Popconfirm, Row, Tag } from 'choerodon-ui';
import {
  Button,
  DataSet,
  DatePicker,
  DateTimePicker,
  Form,
  Icon,
  Lov,
  Modal,
  notification,
  Select,
  Table,
  TextField,
  Upload,
} from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { observer } from 'mobx-react-lite';
import commonConfig from '@htccommon/config/commonConfig';
import { getAccessToken, getResponse } from 'utils/utils';
import {
  auditItemApply,
  auditNotice,
  deleteFilesInfo,
  downloadFiles,
  exportInfos,
  queryUploadInfo,
} from '@src/services/projectApplicationService';
import { base64toBlob } from '@htccommon/utils/utils';
import ProjectApplicationDS, { LinkDS } from '../stores/ProjectApplicationDS';

const modelCode = 'hmdm.project-application';
const HMDM_API = commonConfig.MDM_API;

interface ProjectApplicationPageProps extends RouteComponentProps {
  dispatch: Dispatch<any>;
  projectApplicationDS: DataSet;
}

@withProps(
  () => {
    const projectApplicationDS = new DataSet({
      autoQuery: false,
      ...ProjectApplicationDS(),
    });
    return { projectApplicationDS };
  },
  { cacheState: true }
)
export default class ProjectApplicationPage extends Component<ProjectApplicationPageProps> {
  state = {};

  linkDS = new DataSet({
    // autoCreate: true,
    autoQuery: false,
    ...LinkDS(),
  });

  /**
   * 自定义查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { queryDataSet, buttons, dataSet } = props;
    if (queryDataSet) {
      return (
        <>
          <Row type="flex" style={{ flexWrap: 'nowrap' }}>
            <Col span={20}>
              <Form columns={3} dataSet={queryDataSet}>
                <TextField name="contractCustomerName" />
                <TextField name="companyTaxNumber" />
                <TextField name="phoneOrEmail" />
                <DateTimePicker name="creationDateObj" />
                <DateTimePicker name="openTenantDateObj" />
                <Select name="subAccountStatus" />
                <Select name="sourceType" />
                <Select name="openFunc" />
                <Lov name="tenantObj" />
              </Form>
            </Col>
            <Col span={4} style={{ minWidth: '190px', textAlign: 'end' }}>
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

  // @Bind()
  // editRecord(record, type) {
  //   this.openModal(record, type);
  // }

  /**
   * 查看详情
   * @params {object} record-行记录
   */
  @Bind()
  gotoDetail(record) {
    const { history } = this.props;
    const tenantId = record.get('tenantId');
    const uniqueCode = record.get('uniqueCode');
    history.push(`/htc-front-mdm/project-application/tenant-detail/${tenantId}/${uniqueCode}`);
  }

  /**
   * 下载文件处理
   * @params {string} name-文件名
   * @params {string} name-文件内容
   */
  @Bind()
  downLoadFile(name, text) {
    const blob = new Blob([base64toBlob(text)]);
    if ((window.navigator as any).msSaveBlob) {
      try {
        (window.navigator as any).msSaveBlob(blob, name);
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
      aElement.download = name;
      aElement.click();
      window.URL.revokeObjectURL(blobUrl);
    }
  }

  /**
   * 上传附件-下载
   * @params {object} item-文件对象
   */
  @Bind()
  async downLoadUploadFile(item) {
    const res = getResponse(await downloadFiles({ fileUrl: item.fileUrl }));
    if (res) {
      this.downLoadFile(item.fileName, res);
    }
  }

  /**
   * 上传附件-删除
   * @params {number} uniqueCode-行uniqueCode
   * @params {object} fileUrl-文件对象
   * @params {object} record-行记录
   */
  @Bind()
  async deleteUploadFile(uniqueCode, fileUrl, record) {
    await deleteFilesInfo({ uniqueCode, fileUrl });
    Modal.destroyAll();
    this.showAttachment(record);
  }

  /**
   * 上传附件-删除
   * @params {object} record-行记录
   */
  @Bind()
  async showAttachment(record) {
    const uniqueCode = record.get('uniqueCode');
    const res = getResponse(await queryUploadInfo({ uniqueCode }));
    if (res) {
      const modal = Modal.open({
        title: intl.get(`${modelCode}.view.downloadAttachment`).d('下载附件'),
        bodyStyle: { background: '#D5DAE0', padding: '10px' },
        children: (
          <div>
            {res.map((item: any) => (
              <div key={item.fileUrl} style={{ marginTop: 10 }}>
                <p style={{ cursor: 'pointer' }}>
                  {item.fileName}
                  <Popconfirm
                    title={intl.get(`${modelCode}.view.uploadAttachment`).d('确定删除吗？')}
                    onConfirm={() => this.deleteUploadFile(uniqueCode, item.fileUrl, record)}
                    okText={intl.get('hzero.common.button.ok').d('确定')}
                    cancelText={intl.get('hzero.common.button.cancel').d('取消')}
                  >
                    <Icon style={{ color: 'red', float: 'right' }} type="delete" />
                  </Popconfirm>
                  <Icon
                    style={{ color: '#3889FF', float: 'right', marginRight: '10px' }}
                    type="download_black-o"
                    onClick={() => this.downLoadUploadFile(item)}
                  />
                </p>
              </div>
            ))}
          </div>
        ),
        footer: (
          <div>
            <Button onClick={() => modal.close()}>
              {intl.get(`${modelCode}.modalClose`).d('取消')}
            </Button>
          </div>
        ),
      });
    }
  }

  /**
   * 返回表格行
   * @returns {*[]}
   */
  get columns(): ColumnProps[] {
    return [
      {
        header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
        width: 60,
        renderer: ({ record }) => {
          return record ? record.index + 1 : '';
        },
      },
      {
        name: 'contractCustomerName',
        width: 300,
        renderer: ({ value, record }) => {
          const subAccountStatus = record?.get('subAccountStatus');
          let color;
          let textColor;
          switch (subAccountStatus) {
            case '1':
              color = '#FFECC4';
              textColor = '#FF9D23';
              break;
            case '2':
              color = '#D6FFD7';
              textColor = '#19A633';
              break;
            case '3':
              color = '#F0F0F0';
              textColor = '#959595';
              break;
            default:
              color = '';
              textColor = '';
              break;
          }
          return (
            <div>
              <Tag color={color} style={{ color: textColor }}>
                {record?.getField('subAccountStatus')?.getText()}
              </Tag>
              <a onClick={() => this.gotoDetail(record)}>{value}</a>
            </div>
          );
        },
      },
      { name: 'creationDate', width: 120 },
      { name: 'customerAdmin' },
      { name: 'customerPhone', width: 130 },
      { name: 'customerEmail' },
      { name: 'projectNumber' },
      { name: 'contractNumber' },
      { name: 'collection' },
      { name: 'deliveryName' },
      { name: 'customerSystem' },
      { name: 'linksCode' },
      { name: 'systemTenantCode' },
      { name: 'tenantId' },
      { name: 'subAccount' },
      { name: 'subAccountPwd' },
      {
        name: 'downloadAttachment',
        width: 150,
        title: intl.get(`${modelCode}.view.downloadAttachment`).d('下载附件'),
        renderer: ({ record }) => (
          <Button color={ButtonColor.primary} onClick={() => this.showAttachment(record)}>
            {intl.get(`${modelCode}.view.downloadAttachment`).d('下载附件')}
          </Button>
        ),
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 160,
        command: ({ record }): Commands[] => {
          const subAccountStatus = record?.get('subAccountStatus');
          if (subAccountStatus === '1') {
            return [
              <Button funcType={FuncType.link} onClick={() => this.openModal(record, 2)}>
                {intl.get(`${modelCode}.button.edit`).d('编辑')}
              </Button>,
              <Button funcType={FuncType.link} onClick={() => this.handleSubmit(record)}>
                {intl.get(`${modelCode}.button.submit`).d('提交')}
              </Button>,
            ];
          } else if (subAccountStatus === '2') {
            return [
              <Button funcType={FuncType.link} onClick={() => this.openModal(record, 3)}>
                {intl.get(`${modelCode}.button.edit`).d('查看')}
              </Button>,
              <Button funcType={FuncType.link} onClick={() => this.sendNotification(record)}>
                {intl.get(`${modelCode}.button.sendNotification`).d('发送通知')}
              </Button>,
            ];
          } else {
            return [
              <Button funcType={FuncType.link} onClick={() => this.openModal(record, 3)}>
                {intl.get(`${modelCode}.button.edit`).d('查看')}
              </Button>,
            ];
          }
        },
        lock: ColumnLock.right,
      },
    ];
  }

  /**
   * 提交
   * @params {object} record-行记录
   */
  @Bind()
  async handleSubmit(record) {
    const data = record.toData();
    const res = getResponse(await auditItemApply(data));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
    }
  }

  /**
   * 发送通知
   * @params {object} record-行记录
   */
  @Bind()
  async sendNotification(record) {
    const data = record.toData();
    const res = getResponse(await auditNotice(data));
    if (res) {
      notification.success({
        description: '',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
    }
  }

  /**
   * 取消生成邀请链接
   * @params {object} modal
   */
  @Bind()
  linkCancel(modal) {
    this.linkDS.reset();
    modal.close();
  }

  /**
   * 生成邀请链接推送
   */
  @Bind()
  handlePush() {
    this.linkDS.submit();
  }

  /**
   * 返回生成邀请链接modal
   */
  @Bind()
  handleGenerateInviteLink() {
    const record = this.linkDS.create({}, 0);
    const modal = Modal.open({
      title: intl.get('hzero.common.button.save').d('生成邀请链接'),
      children: (
        <Form record={record}>
          <Select name="linksType" />
          <DatePicker name="linksAccountObj" />
          <TextField name="phone" />
          <TextField name="email" />
          <Lov name="tenantObject" />
          <Lov name="companyNameObject" />
          <TextField name="linksCode" />
          <Select name="validityDay" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handlePush()}>
            {intl.get(`${modelCode}.push`).d('推送')}
          </Button>
          <Button onClick={() => this.linkCancel(modal)}>
            {intl.get(`${modelCode}.modalColse`).d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    this.props.projectApplicationDS.delete(this.props.projectApplicationDS.selected);
  }

  /**
   * 保存
   * @params {object} modal
   */
  @Bind()
  async handleCreate(modal) {
    const res = await this.props.projectApplicationDS.submit();
    if (res && res.content) {
      modal.close();
    }
  }

  /**
   * 保存并新增
   * @params {object} modal
   */
  @Bind()
  async saveAndCreate(modal) {
    const res = await this.props.projectApplicationDS.submit();
    if (res && res.content) {
      modal.close();
      this.createRecord();
    }
  }

  /**
   * 取消
   * @params {object} record-行记录
   * @params {object} modal
   * @params {number} type 1-新增 2-编辑 3-查看
   */
  @Bind()
  handleCancel(record, modal, type) {
    if (type === 1) {
      this.props.projectApplicationDS.remove(record);
    } else {
      this.props.projectApplicationDS.reset();
    }
    modal.close();
  }

  /**
   * 返回新增/编辑/查看Modal
   * @params {object} record-行记录
   * @params {number} type 1-新增 2-编辑 3-查看
   */
  @Bind()
  openModal(record, type) {
    let title = '';
    if (type === 1) {
      title = '新增';
    } else if (type === 2) {
      title = '编辑';
    } else {
      title = '查看';
    }
    const modal = Modal.open({
      title,
      drawer: true,
      children: (
        <Form record={record} disabled={type === 3} labelTooltip={Tooltip.overflow}>
          <Select name="subAccountStatus" />
          <TextField name="contractCustomerName" />
          <TextField name="customerAdmin" />
          <TextField name="customerPhone" />
          <TextField name="customerEmail" />
          <TextField name="projectNumber" />
          <TextField name="contractNumber" />
          <TextField name="collection" />
          <TextField name="deliveryName" />
          <TextField name="customerSystem" />
          <TextField name="systemTenantCode" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleCreate(modal)}>
            {intl.get(`${modelCode}.completed`).d('保存')}
          </Button>
          <Button onClick={() => this.saveAndCreate(modal)}>
            {intl.get(`${modelCode}.completed`).d('保存并新增')}
          </Button>
          <Button onClick={() => this.handleCancel(record, modal, type)}>
            {intl.get(`${modelCode}.modalColse`).d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 新增
   */
  @Bind()
  createRecord() {
    this.openModal(this.props.projectApplicationDS.create({}, 0), 1);
  }

  /**
   * 返回表格头按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const BatchButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          onClick={props.onClick}
          disabled={isDisabled}
          color={props.color}
          style={props.style}
          funcType={FuncType.raised}
        >
          {props.title}
        </Button>
      );
    });
    return [
      <Button onClick={this.createRecord}>{intl.get('hzero.common.button.add').d('新增')}</Button>,
      <Button
        key="generateInviteLink"
        onClick={this.handleGenerateInviteLink}
        color={ButtonColor.default}
        style={{ color: '#3889FF', borderColor: '#3889FF' }}
      >
        {intl.get('hzero.common.button.generateInviteLink').d('生成邀请链接')}
      </Button>,
      <BatchButtons
        key="batchDelete"
        onClick={this.handleDelete}
        color={ButtonColor.default}
        title={intl.get('hzero.common.button.batchDelete').d('删除')}
        dataSet={this.props.projectApplicationDS}
      />,
    ];
  }

  /**
   * 导出
   */
  @Bind()
  async handleExport() {
    const queryParams =
      this.props.projectApplicationDS.queryDataSet!.map(data => data.toData()) || {};
    for (const key in queryParams[0]) {
      if (queryParams[0][key] === '' || queryParams[0][key] === null) {
        delete queryParams[0][key];
      }
    }
    const res = getResponse(await exportInfos(queryParams[0]));
    if (res) {
      this.downLoadFile('项目申请列表.xlsx', res);
    }
  }

  /**
   * 导入成功回调
   */
  handleImportSuccess = response => {
    try {
      const multipleData = JSON.parse(response);
      const res = getResponse(multipleData);
      if (res) {
        notification.success({
          description: '',
          message: intl.get(`${modelCode}.view.uploadInvalid`).d('导入成功'),
        });
        this.props.projectApplicationDS.query();
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
    }
  };

  /**
   * 导入失败回调
   */
  handleImportError = response => {
    notification.error({
      description: '',
      message: response,
    });
  };

  render() {
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {},
      multiple: false,
      showUploadBtn: false,
      showUploadList: false,
      partialUpload: false,
      id: 'import',
      onUploadSuccess: this.handleImportSuccess,
      onUploadError: this.handleImportError,
    };
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('项目申请管理')}>
          <Button onClick={() => this.handleExport()}>
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
          <Upload
            {...uploadProps}
            accept={[
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-excel',
            ]}
            action={`${API_HOST}${HMDM_API}/v1/apply-items/import-tenant-info`}
          >
            {intl.get(`${modelCode}.import`).d('导入')}
          </Upload>
        </Header>
        <Content>
          <Table
            buttons={this.buttons}
            dataSet={this.props.projectApplicationDS}
            columns={this.columns}
            queryBar={this.renderQueryBar}
            style={{ height: 400 }}
          />
        </Content>
      </>
    );
  }
}
