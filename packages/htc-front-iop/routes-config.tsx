import React from 'react';
// import { dynamic } from '@umijs/runtime';
// import React from 'react';
import { loadConfig } from './configure171';

console.log('process.env.ADDITIONAL', process.env.ADDITIONAL)

if (process.env.ADDITIONAL === 'true') {
    loadConfig()
}
export const PageWrapper = () => {
    const PageWrapperComponent = ({ children }: any) => {
        return <>{children}</>;
    };
    return PageWrapperComponent;
};