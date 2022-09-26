// /**
//  * @Description: 抵扣统计报表
//  * @version: 1.0
//  * @Author: yang.wang04@hand-china.com
//  * @Date: 2020-11-24 10:56:29
//  * @LastEditTime: 2021-08-26 11:07:59
//  * @Copyright: Copyright (c) 2020, Hand
//  */
// import React, { Component } from 'react';
// import { Dispatch } from 'redux';
// import { Bind } from 'lodash-decorators';
// import formatterCollections from 'utils/intl/formatterCollections';
// import intl from 'utils/intl';
// import { Button, DataSet, Form, Lov, Spin, TextField, Modal } from 'choerodon-ui/pro';
// import { Content, Header } from 'components/Page';
// import { Col, Row } from 'choerodon-ui';
// import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { getCurrentEmployeeInfoOut } from '@htccommon/services/commonService';
// // import CheckRuleHeaderForm from './CheckAuthenticationRulesForm';
// // import CheckAuthenticationRulesDS from '../stores/CheckAuthenticationRulesDS';
// // import CheckAuthenticationManualRulesDS from '../stores/CheckAuthenticationManualRulesDS';
// // import notification from 'utils/notification';

// const tenantId = getCurrentOrganizationId();

// interface CheckRuleListPageProps {
//     dispatch: Dispatch<any>;
// }

// @formatterCollections({
//     code: ['hivp.deductionStatement', 'htc.common'],
// })
// export default class CheckRuleListPage extends Component<CheckRuleListPageProps> {
//     state = {
//         curCompanyId: '',
//     };

//     checkRuleDS = new DataSet({
//         autoQuery: true,
//         autoCreate: true,
//         ...CheckAuthenticationRulesDS(),
//     });

//     checkRuleManualDS = new DataSet({
//         autoQuery: false,
//         autoCreate: true,
//         ...CheckAuthenticationManualRulesDS(),
//     });

//     @Bind()
//     async componentDidMount() {
//         const res = await getCurrentEmployeeInfoOut({ tenantId });
//         if (res && res.content) {
//             const empInfo = res.content[0];
//             const { queryDataSet } = this.checkRuleDS;
//             const { current } = this.checkRuleManualDS;
//             if (queryDataSet && queryDataSet.current) {
//                 queryDataSet.current.set({ companyObj: empInfo });
//                 current!.set('companyId', empInfo.companyId);
//                 // this.loadData(empInfo);
//                 this.setState({ curCompanyId: empInfo.companyId });
//             }
//         }
//     }

//     // @Bind()
//     // loadData(empInfo) {
//     //     this.checkRuleDS.query().then(() => {
//     //         if (this.checkRuleDS.length === 0) {
//     //             this.checkRuleDS.create(
//     //                 {
//     //                     companyId: empInfo.companyId,
//     //                     companyName: empInfo.companyName,
//     //                 },
//     //                 0
//     //             );
//     //         }
//     //     });
//     // }
//     @Bind()
//     async handleCompanyChange(_, oldValue) {

//     }

//     render() {
//         const { curCompanyId } = this.state;
//         return (
//             <>
//                 <Header title={intl.get('hivp.checkRule.title.invoiceRule').d('抵扣统计报表')} />
//                 <Content style={{ paddingBottom: '60px' }}>
//                     <Row type="flex">
//                         <Col span={20}>
//                             <Form dataSet={this.checkRuleDS.queryDataSet} columns={3}>
//                                 <Lov
//                                     dataSet={this.checkRuleDS.queryDataSet}
//                                     name="companyObj"
//                                     onChange={this.handleCompanyChange}
//                                 />
//                                 <TextField name="employeeDesc" />
//                                 <TextField name="taxPeriod" />
//                                 <TextField name="expiredDate" />
//                                 <TextField name="checkDate" />
//                                 <TextField name="taxpayerNumber" />
//                             </Form>
//                         </Col>
//                     </Row>

//                     {/* <Spin dataSet={this.checkRuleDS}>
//                         <CheckRuleHeaderForm
//                             manualDataSet={this.checkRuleManualDS}
//                             dataSet={this.checkRuleDS}
//                         />
//                     </Spin> */}
//                 </Content>
//             </>
//         );
//     }
// }
