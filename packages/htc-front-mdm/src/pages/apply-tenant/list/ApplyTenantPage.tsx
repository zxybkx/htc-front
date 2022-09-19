/**
 * @Description: 租户信息
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2022-01-17 17:17:23
 * @LastEditTime: 2020 -06-20 10:18
 * @Copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Dispatch } from 'redux';
import { Header } from 'components/Page';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Buttons, Commands } from 'choerodon-ui/pro/lib/table/Table';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { API_HOST } from 'utils/config';
import { Card, Popconfirm } from 'choerodon-ui';
import { RouteComponentProps } from 'react-router-dom';
import {
  Button,
  DataSet,
  DatePicker,
  Form,
  Icon,
  Modal,
  notification,
  Select,
  Spin,
  Table,
  TextField,
  Upload,
} from 'choerodon-ui/pro';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react-lite';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { getAccessToken, getResponse } from 'utils/utils';
import { isString } from 'lodash';
import commonConfig from '@htccommon/config/commonConfig';
import {
  deleteFilesInfo,
  downloadFiles,
  downloadTemplate,
  downloadTemplateInfo,
  queryUploadInfo,
  saveInfo,
} from '@src/services/projectApplicationService';
import { downLoadFiles } from '@htccommon/utils/utils';
import ApplyTenantDS from '../stores/ApplyTenantDS';
import ApplyTenantListDS from '../stores/ApplyTenantListDS';
import styles from '../instruction.module.less';

const modelCode = 'hmdm.apply-tenant';
const HMDM_API = commonConfig.MDM_API;
const acceptType = [
  '.pdf',
  '.jpg',
  '.png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  '.doc',
  '.docx',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface RouterInfo {}

interface ProjectApplicationPageProps extends RouteComponentProps<RouterInfo> {
  dispatch: Dispatch<any>;
}

export default class ApplyTenantPage extends Component<ProjectApplicationPageProps> {
  state = {
    showButtons: true,
    uniqueCode: undefined,
  };

  applyTenantListDS = new DataSet({
    autoQuery: false,
    ...ApplyTenantListDS(),
  });

  applyTenantDS = new DataSet({
    autoQuery: false,
    ...ApplyTenantDS(this.props.location),
    feedback: {
      loadFailed: () => {
        this.props.history.push('/public/htc-front-mdm/apply/invalid-result');
      },
    },
    children: {
      applyCompanyList: this.applyTenantListDS,
    },
  });

  singleUpload;

  saveSingleUpload = node => {
    this.singleUpload = node;
  };

  async componentDidMount() {
    const res = await this.applyTenantDS.query();
    if (res && res.systemCompanyId) {
      this.setState({ showButtons: false });
    }
    this.setState({ uniqueCode: res && res.uniqueCode });
  }

  /**
   * 自定义查询条
   */
  @Bind()
  renderQueryBar(props) {
    const { buttons } = props;
    return (
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ display: 'inline' }}>
          <b>{intl.get(`${modelCode}.invoiceOrderCardTwo`).d('公司信息')}</b>
        </h3>
        {buttons}
      </div>
    );
  }

  /**
   * 行信息编辑回调
   * @params {object} record - 行记录
   */
  @Bind()
  handleEdit(record) {
    this.openModal(record, false);
  }

  /**
   * 返回表格行
   * @params {*[]}
   */
  get columns(): ColumnProps[] {
    const { search } = this.props.location;
    const linksType = new URLSearchParams(search).get('linksType');
    const commonCommand = ({ record }): Commands[] => {
      return [
        <span className="action-link" key="action">
          <a onClick={() => this.handleEdit(record)}>
            {intl.get(`${modelCode}.button.edit`).d('编辑')}
          </a>
        </span>,
      ];
    };
    const type1 = [
      { name: 'openFunc', width: 200 },
      { name: 'companyCode' },
      { name: 'companyName', width: 200 },
      { name: 'companyShort' },
      { name: 'companyTaxNumber', width: 130 },
      { name: 'addressPhone', width: 250 },
      { name: 'openBankAccount', width: 150 },
      { name: 'openStartDate' },
      { name: 'openEndDate' },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: commonCommand,
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
    const type2 = [
      { name: 'companyCode' },
      { name: 'companyName', width: 200 },
      { name: 'companyShort' },
      { name: 'companyTaxNumber', width: 130 },
      { name: 'addressPhone', width: 250 },
      { name: 'openBankAccount', width: 150 },
      { name: 'competentCode', width: 150 },
      { name: 'companyAdmin' },
      { name: 'adminPhone', width: 130 },
      { name: 'adminEmail', width: 130 },
      { name: 'openFunc', width: 200 },
      { name: 'openStartDate' },
      { name: 'openEndDate' },
      { name: 'remark', width: 130 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: commonCommand,
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
    const type3 = [
      { name: 'companyCode' },
      { name: 'companyName', width: 200 },
      { name: 'companyShort' },
      { name: 'companyTaxNumber', width: 130 },
      { name: 'addressPhone', width: 250 },
      { name: 'openBankAccount', width: 150 },
      { name: 'competentCode', width: 150 },
      { name: 'companyAdmin' },
      { name: 'adminPhone', width: 130 },
      { name: 'adminEmail', width: 130 },
      { name: 'openFunc', width: 200 },
      { name: 'openStartDate' },
      { name: 'openEndDate' },
      { name: 'dueRemind', width: 160 },
      { name: 'download' },
      { name: 'upload' },
      { name: 'remark', width: 130 },
      {
        name: 'operation',
        header: intl.get('hzero.common.action').d('操作'),
        width: 80,
        command: commonCommand,
        lock: ColumnLock.right,
        align: ColumnAlign.center,
      },
    ];
    if (linksType === '1') {
      return [
        {
          header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
          width: 60,
          renderer: ({ record }) => {
            return record ? record.index + 1 : '';
          },
        },
        ...type1,
      ];
    }
    if (linksType === '2') {
      return [
        {
          header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
          width: 60,
          renderer: ({ record }) => {
            return record ? record.index + 1 : '';
          },
        },
        ...type2,
      ];
    }
    if (linksType === '3') {
      return [
        {
          header: intl.get(`${modelCode}.view.orderSeq`).d('序号'),
          width: 60,
          renderer: ({ record }) => {
            return record ? record.index + 1 : '';
          },
        },
        ...type3,
      ];
    }
    return [];
  }

  /**
   * 删除回调
   */
  @Bind()
  async handleDelete() {
    this.applyTenantListDS.delete(this.applyTenantListDS.selected);
  }

  /**
   * 保存回调
   * @params {object} modal-modal对象
   */
  @Bind()
  async handleCreate(modal) {
    const res = await this.applyTenantListDS.submit();
    if (res && res.content) {
      modal.close();
    }
  }

  /**
   * 取消回调
   * @params {object} record-行记录
   * @params {object} modal-modal对象
   * @params {boolean} isNew true-新建 false-编辑
   */
  @Bind()
  handleCancel(record, modal, isNew) {
    if (isNew) {
      this.applyTenantListDS.remove(record);
    } else {
      this.applyTenantListDS.reset();
    }
    modal.close();
  }

  /**
   * 保存并新增回调
   * @params {object} modal-modal对象
   */
  @Bind()
  async saveAndCreate(modal) {
    const res = await this.applyTenantListDS.submit();
    if (res && res.content) {
      modal.close();
      this.handleAdd();
    }
  }

  /**
   * 返回新增/编辑modal
   * @params {object} record-行记录
   * @params {boolean} isNew true-新建 false-编辑
   */
  @Bind()
  openModal(record, isNew) {
    const modal = Modal.open({
      title: isNew
        ? intl.get(`${modelCode}.view.addCompany`).d('新增公司')
        : intl.get(`${modelCode}.view.editCompany`).d('编辑公司'),
      drawer: true,
      children: (
        <Form record={record}>
          <TextField name="companyCode" />
          <TextField name="companyName" />
          <TextField name="companyShort" />
          <TextField name="companyTaxNumber" />
          <TextField name="addressPhone" />
          <TextField name="openBankAccount" />
          <TextField name="competentCode" />
          <TextField name="companyAdmin" />
          <TextField name="adminPhone" />
          <TextField name="adminEmail" />
          <Select name="openFunc" />
          <DatePicker name="openStartDateObj" />
          <Select name="dueRemind" />
          <TextField name="remark" />
        </Form>
      ),
      footer: (
        <div>
          <Button color={ButtonColor.primary} onClick={() => this.handleCreate(modal)}>
            {intl.get(`${modelCode}.completed`).d('保存')}
          </Button>
          {isNew && (
            <Button onClick={() => this.saveAndCreate(modal)}>
              {intl.get(`${modelCode}.completed`).d('保存并新增')}
            </Button>
          )}
          <Button onClick={() => this.handleCancel(record, modal, isNew)}>
            {intl.get(`${modelCode}.modalColse`).d('取消')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 新增回调
   */
  @Bind()
  handleAdd() {
    const uniqueCode = this.applyTenantDS.current!.get('uniqueCode');
    this.openModal(this.applyTenantListDS.create({ uniqueCode }, 0), true);
  }

  /**
   * 返回表格行按钮
   * @returns {*[]}
   */
  get buttons(): Buttons[] {
    const { showButtons } = this.state;
    const HeaderButtons = observer((props: any) => {
      const isDisabled = props.dataSet!.selected.length === 0;
      return (
        <Button
          key={props.key}
          icon={props.icon}
          onClick={props.onClick}
          disabled={isDisabled}
          funcType={FuncType.link}
          color={ButtonColor.primary}
        >
          {props.title}
        </Button>
      );
    });
    if (showButtons) {
      return [
        <Button
          onClick={this.handleAdd}
          icon="add"
          key="add"
          funcType={FuncType.link}
          style={{ marginLeft: 10 }}
        >
          {intl.get('hzero.common.button.add ').d('新增')}
        </Button>,
        <HeaderButtons
          key="delete"
          icon="delete"
          onClick={() => this.handleDelete()}
          dataSet={this.applyTenantListDS}
          title={intl.get(`${modelCode}.button.delete`).d('删除')}
        />,
      ];
    } else {
      return [];
    }
  }

  /**
   * 提交回调
   */
  @Bind()
  async handleSubmit() {
    const validateValue = await Promise.all(
      this.applyTenantDS.map(record => record.validate(true, false))
    );
    if (validateValue.some(item => !item)) {
      notification.error({
        description: '',
        message: intl.get('hzero.common.notification.invalid').d('数据校验不通过！'),
      });
      return;
    }
    const data = this.applyTenantDS.map(record => record.toData(true));
    const res = getResponse(await saveInfo(data));
    if (res) {
      this.props.history.push('/public/htc-front-mdm/apply/success-result');
    }
  }

  /**
   * 退出回调
   */
  @Bind()
  handleExit() {
    window.location.href = 'about:blank';
    window.close();
  }

  /**
   * 返回填写说明modal
   */
  @Bind()
  showInstruction() {
    const modal = Modal.open({
      children: (
        <>
          <h2 style={{ textAlign: 'center' }}>汇税通服务接入申请填写说明</h2>
          <div style={{ margin: '0 20px' }}>
            <h3>一、租户信息</h3>
            <div className={styles.block}>
              <span>
                请按照合同签订内容填写租户信息，包括：合同客户全称、租户管理员、管理员手机号、管理员邮箱；
              </span>
              <br />
              <span>请填写汉得交付立项项目编号、合同号、对接客户系统、收款情况等信息。</span>
            </div>
            <h3>二、公司信息</h3>
            <div className={styles.block}>
              <span>请填写合同中包含的公司、税号信息，以及各公司开通功能信息。</span>
              <br />
            </div>
            <span className={styles.text}>谢谢！</span>
            <br />
            <div className={styles.bottom}>
              <span>汇税通运营与支持组</span>
              <br />
              <span>联系人：马永尚</span>
              <br />
              <span>联系电话：17853130482</span>
            </div>
          </div>
        </>
      ),
      footer: (
        <div>
          <Button onClick={() => modal.close()} color={ButtonColor.primary}>
            {intl.get(`${modelCode}.modalColse`).d('确定')}
          </Button>
        </div>
      ),
    });
  }

  /**
   * 上传附件成功回调
   */
  handleUploadSuccess = response => {
    if (isString(response)) {
      Modal.destroyAll();
      this.getUploadInfo();
    } else {
      const multipleData = JSON.parse(response);
      const res = getResponse(multipleData);
      notification.error({
        description: '',
        message: res && res.message,
      });
    }
  };

  /**
   * 失败回调
   */
  handleFnError = response => {
    notification.error({
      description: '',
      message: response,
    });
  };

  /**
   * base64数据下载
   * @params {string} name-文件名
   * @params {string} text-base64数据
   */
  @Bind()
  downLoadFile(name, text) {
    const fileList = [
      {
        data: text,
        fileName: name,
      },
    ];
    downLoadFiles(fileList);
    // const blob = new Blob([base64toBlob(text)]);
    // if ((window.navigator as any).msSaveBlob) {
    //   try {
    //     (window.navigator as any).msSaveBlob(blob, name);
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
    //   aElement.download = name;
    //   aElement.click();
    //   window.URL.revokeObjectURL(blobUrl);
    // }
  }

  /**
   * 下载模板
   * @params {object} item-文件信息
   */
  @Bind()
  async handleDownLoad(item) {
    if (item.templateInfos) {
      this.downLoadFile(item.templateName, item.templateInfos);
    } else {
      const { templateType } = item;
      const res = getResponse(await downloadTemplate({ templateType }));
      if (res) {
        this.downLoadFile(item.templateName, res);
      }
    }
  }

  /**
   * 下载导入模板
   */
  @Bind()
  async handleDownloadTemplate() {
    const res = getResponse(await downloadTemplateInfo());
    if (res) {
      const modal = Modal.open({
        title: intl.get(`${modelCode}.view.downloadTemplate`).d('下载模板'),
        bodyStyle: { background: '#D5DAE0', padding: '10px' },
        children: (
          <div>
            {res.map((item: any) => (
              <div
                key={item.templateType}
                onClick={() => this.handleDownLoad(item)}
                style={{ cursor: 'pointer' }}
              >
                <p>
                  {item.templateName}
                  <Icon style={{ color: '#3889FF', float: 'right' }} type="download_black-o" />
                </p>
              </div>
            ))}
          </div>
        ),
        footer: (
          <div>
            <Button onClick={() => modal.close()} color={ButtonColor.primary}>
              {intl.get(`${modelCode}.modalClose`).d('返回')}
            </Button>
          </div>
        ),
      });
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
   * @params {string} uniqueCode
   * @params {string} fileUrl
   */
  @Bind()
  async deleteUploadFile(uniqueCode, fileUrl) {
    await deleteFilesInfo({ uniqueCode, fileUrl });
    Modal.destroyAll();
    this.getUploadInfo();
  }

  /**
   * 返回上传附件modal
   * @params {string} uniqueCode
   * @params {string} fileUrl
   */
  @Bind()
  async getUploadInfo() {
    const { uniqueCode } = this.state;
    const res = await queryUploadInfo({ uniqueCode });
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: {
        uniqueCode,
      },
      multiple: false,
      showUploadBtn: false,
      showUploadList: false,
      partialUpload: false,
      id: 'upload',
      onUploadSuccess: this.handleUploadSuccess,
      onUploadError: this.handleFnError,
    };
    const modal = Modal.open({
      title: intl.get(`${modelCode}.view.uploadAttachment`).d('上传附件'),
      bodyStyle: { background: '#D5DAE0', padding: '10px' },
      children: (
        <div>
          <Upload
            {...uploadProps}
            accept={acceptType}
            action={`${API_HOST}${HMDM_API}/v1/apply-items/customer-upload-files`}
          />
          {res &&
            !res.failed &&
            res.map((item: any) => (
              <div key={item.fileUrl} style={{ marginTop: 10 }}>
                <p style={{ cursor: 'pointer' }}>
                  {item.fileName}
                  <Popconfirm
                    title={intl.get(`${modelCode}.view.uploadAttachment`).d('确定删除吗？')}
                    onConfirm={() => this.deleteUploadFile(uniqueCode, item.fileUrl)}
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
          <Button onClick={() => modal.close()} color={ButtonColor.primary}>
            {intl.get(`${modelCode}.modalClose`).d('返回')}
          </Button>
        </div>
      ),
    });
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
        this.applyTenantDS.query();
      }
    } catch (err) {
      notification.error({
        description: err.message,
        message: intl.get(`${modelCode}.view.uploadInvalid`).d('上传返回数据无效'),
      });
    }
  };

  /**
   * 返回header按钮
   */
  @Bind()
  renderHeaderBts() {
    const { uniqueCode } = this.state;
    const uploadProps = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Authorization: `bearer ${getAccessToken()}`,
      },
      data: { uniqueCode },
      multiple: false,
      showUploadBtn: false,
      showUploadList: false,
      partialUpload: false,
      id: 'import',
      onUploadSuccess: this.handleImportSuccess,
      onUploadError: this.handleFnError,
    };
    return (
      <>
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
        <Button onClick={() => this.handleDownloadTemplate()} style={{ marginRight: 10 }}>
          {intl.get(`${modelCode}.uploadExcel`).d('下载导入模板')}
        </Button>
        <Button onClick={() => this.showInstruction()}>
          {intl.get(`${modelCode}.instructions`).d('填写说明')}
        </Button>
        <Button onClick={() => this.getUploadInfo()}>
          {intl.get(`${modelCode}.uploadAttachment`).d('上传附件')}
        </Button>
      </>
    );
  }

  render() {
    const { search } = this.props.location;
    const linksType = new URLSearchParams(search).get('linksType');
    const queryMoreArray: JSX.Element[] = [];
    queryMoreArray.push(<TextField name="customerAdmin" />);
    queryMoreArray.push(<TextField name="projectNumber" />);
    queryMoreArray.push(<TextField name="contractNumber" />);
    queryMoreArray.push(<TextField name="customerSystem" />);
    queryMoreArray.push(<TextField name="createItem" />);
    queryMoreArray.push(<TextField name="pmsContractNumber" />);
    queryMoreArray.push(<TextField name="deliveryName" />);
    queryMoreArray.push(<TextField name="collection" />);
    return (
      <>
        <Header title={intl.get(`${modelCode}.title`).d('汇税通客户申请平台')}>
          {this.renderHeaderBts()}
        </Header>
        <div style={{ overflow: 'auto' }}>
          <Card style={{ marginTop: 10 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>
                <b>{intl.get(`${modelCode}.tenantInfo`).d('租户信息')}</b>
              </h3>
            </div>
            <Spin dataSet={this.applyTenantDS}>
              <Form dataSet={this.applyTenantDS} columns={4}>
                <TextField name="contractCustomerName" />
                <TextField name="customerPhone" />
                <TextField name="customerEmail" />
                {linksType !== '1' && queryMoreArray}
              </Form>
            </Spin>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Table
              buttons={this.buttons}
              dataSet={this.applyTenantListDS}
              columns={this.columns}
              queryBar={this.renderQueryBar}
              style={{ height: 400 }}
            />
          </Card>
          <div style={{ margin: 10 }}>
            <Button color={ButtonColor.primary} onClick={() => this.handleSubmit()}>
              {intl.get(`${modelCode}.submit`).d('提交')}
            </Button>
            <Button onClick={() => this.handleExit()}>
              {intl.get(`${modelCode}.exit`).d('退出')}
            </Button>
          </div>
        </div>
      </>
    );
  }
}
