module.exports = {
  "packages": [
    {
      "name": "hzero-front-hiam"
    },
    {
      "name": "hzero-front-hpfm"
    },
    {
      "name": "hzero-front-hcnf"
    },
    {
      "name": "hzero-front-hmsg"
    },
    {
      "name": "hzero-front-himp"
    },
    {
      "name": "hzero-front-hfile"
    },
    {
      "name": "hzero-front-hadm"
    },
    {
      "name": "hzero-front-hchg"
    },
    {
      "name": "hzero-front-hrpt"
    },
    {
      "name": "hzero-front-hsdr"
    },
    {
      "name": "hzero-front-hitf"
    },
    {
      "name": "hzero-front-hivc"
    },
    {
      "name": "hzero-front-hocr"
    },
    {
      "name": "hzero-front-hwfp"
    },
  ],
  "hzeroBoot": "hzero-boot/lib/pathInfo",
  // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
  //   console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
  //   config.externals = {
  //     ..config.externals,
  //     jQuery: 'window["jQuery"]',
  //     $: 'window["jQuery"]',
  //   }
  //   return config;
  // },
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
  // dllConfig: { // dllConfig 配置
  //   common: {
  //     priority: 100,
  //     packages: ['react','react-dom','dva','dva/router','dva/saga','dva/fetch','hzero-ui','choerodon-ui','choerodon-ui/pro','core-js'],
  //   },
  //   vendorsGraph: {
  //     packages: ['echarts'],
  //   },
  //   vendors: {
  //     packages: ['lodash','lodash-decorators','react-intl-universal','axios','uuid','numeral','react-cropper','cropperjs',]
  //   }
  // },
  // splitChunks:{ /* ... */} // chunks 优化配置 参考: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
};

