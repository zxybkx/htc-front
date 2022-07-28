import React from 'react';
import { configure } from 'choerodon-ui';
import { loadConfig } from '@hzerojs/plugin-hzero-layout/browsers/clients/utils/c7nUiConfig';

configure({
  // tooltipPlacement: 'bottomRight',
  // defaultActiveFirstOption: false,
});

if (process.env.ADDITIONAL === 'true') {
  loadConfig(configure);
}
export const PageWrapper = () => {
  return ({ children }: any) => {
    return <>{children}</>;
  };
};
