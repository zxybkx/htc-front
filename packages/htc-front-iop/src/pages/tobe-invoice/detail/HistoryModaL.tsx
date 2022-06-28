/**
 * @Description:生成申请
 * @version: 1.0
 * @Author: xinyan.zhou@hand-china.com
 * @Date: 2021-06-21 15:46:22
 * @LastEditTime: 2021-11-22 15:32:15
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Col, Row, Timeline } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import HistoryDS from '../stores/HistoryModalDS';
import styles from '../history.module.less';

const { Item: TimelineItem } = Timeline;

interface InvoiceHistoryPageProps {
  batchNo: string;
  sourceLineNumber: string;
  sourceHeadNumber: string;
  prepareInvoiceId: number;
}

@connect()
@formatterCollections({
  code: ['hiop.tobeInvoice', 'hiop.redInvoiceInfo'],
})
export default class InvoiceHistoryPage extends Component<InvoiceHistoryPageProps> {
  state = {
    listData: [],
  };

  tableDS = new DataSet({
    autoQuery: false,
    ...HistoryDS(this.props),
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
    const { batchNo, sourceHeadNumber, sourceLineNumber } = this.props;
    return (
      <>
        <div className={styles.invoice}>
          <Row className={styles.grid}>
            <Col span={24} style={{ marginBottom: 10 }}>
              <span>{intl.get('hiop.tobeInvoice.view.batchNumber').d('批次号：')}</span>
              <span className={styles.invoiceInfo}>{batchNo}</span>
            </Col>
            <Col span={12}>
              <span>{intl.get('hiop.tobeInvoice.view.sourceHeadNumber').d('来源单据号：')}</span>
              <span className={styles.invoiceInfo}>{sourceHeadNumber}</span>
            </Col>
            <Col span={12}>
              <span>{intl.get('hiop.tobeInvoice.view.sourceLineNumber').d('来源单据行号：')}</span>
              <span className={styles.invoiceInfo}>{sourceLineNumber}</span>
            </Col>
          </Row>
        </div>
        <Spin dataSet={this.tableDS} />
        {listData && !isEmpty(listData) && (
          <Timeline className={styles.list}>
            {listData.map((item: any) => {
              return (
                <TimelineItem>
                  <div>
                    <span className={styles.employee}>{item.employeeName}</span>&emsp;
                    <span>{item.operationDate}</span>
                  </div>
                  <div className={styles.info}>
                    <span>
                      {intl.get('hiop.tobeInvoice.view.operationType').d('类型：')}
                      {item.operationType}
                    </span>
                    <br />
                    <span style={{ marginTop: '5px' }}>
                      {intl.get('hiop.tobeInvoice.view.operationEvent').d('事件：')}
                      {item.operationEvent}
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
