import React, { Component } from 'react';
import { connect } from 'dva';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Tag, Timeline, Row, Col } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import InvoiceHistoryDS from '../stores/InvoiceHistoryDS';
import styles from '../history.less';

const { Item: TimelineItem } = Timeline;
const modelCode = 'hivp.invoicesHistory';
interface InvoiceHistoryPageProps {
  sourceCode: string;
  sourceHeaderId: string;
  record: any; // 行数据
}

@connect()
@formatterCollections({
  code: [modelCode, 'htc.common', 'hcan.invoiceDetail', 'hivp.bill'],
})
export default class InvoiceHistoryPage extends Component<InvoiceHistoryPageProps> {
  state = {
    listData: [],
  };

  tableDS = new DataSet({
    autoQuery: false,
    ...InvoiceHistoryDS(this.props),
  });

  async componentDidMount() {
    this.tableDS.query().then((res) => {
      if (res && res.length > 0) {
        this.setState({ listData: res });
      }
    });
  }

  render() {
    const { listData } = this.state;
    const { invoiceCode, invoiceNo, invoiceAmount, salerName } = this.props.record;
    const _invoiceAmount = Number(invoiceAmount) || 0;
    return (
      <>
        <div className={styles.invoice}>
          <div style={{ marginLeft: 18, paddingTop: 12 }}>
            <Tag color="#3889FF">{intl.get('htc.common.view.salerName').d('销方名称')}</Tag>
            <span style={{ fontWeight: 'bold' }}>{salerName || '-'}</span>
          </div>
          <Row className={styles.grid}>
            <Col span={10}>
              <span>{intl.get('htc.common.view.invoiceCode').d('发票代码')}：</span>
              <span className={styles.invoiceInfo}>{invoiceCode}</span>
            </Col>
            <Col span={8}>
              <span>{intl.get('htc.common.view.invoiceNo').d('发票号码')}：</span>
              <span className={styles.invoiceInfo}>{invoiceNo}</span>
            </Col>
            <Col span={6}>
              <span>{intl.get('htc.common.view.invoiceAmount').d('发票金额')}：</span>
              <span className={styles.invoiceInfo}>{_invoiceAmount.toFixed(2)}</span>
            </Col>
          </Row>
        </div>
        <Spin dataSet={this.tableDS} />
        {listData && !isEmpty(listData) && (
          <Timeline className={styles.list}>
            {listData.map((item: any) => {
              const { incidentDetail } = item;
              const employeeInfo = incidentDetail.split(/;|；/);
              const splitName = employeeInfo[0].split(/:|：/);
              const detail = employeeInfo[1] || employeeInfo[0];
              const employeeName = splitName[1];
              return (
                <TimelineItem>
                  <div>
                    <span className={styles.employee}>{employeeName}</span>&emsp;
                    <span>{item.incidentDate}</span>
                  </div>
                  <span className={styles.detail}>{detail}</span>
                  <div className={styles.info}>
                    <span>
                      {intl.get('hcan.invoiceDetail.view.type').d('类型')}：{item.incidentType}-
                      {item.incidentTypeMeaning}
                    </span>
                    <br />
                    <span style={{ marginTop: '5px' }}>
                      {intl.get('hzero.common.source').d('来源')}：{item.incidentFrom}-
                      {item.incidentFromMeaning}
                    </span>
                  </div>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </>
    );
  }
}
