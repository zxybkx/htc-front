###
 # @Descripttion:
 # @version: 1.0
 # @Author: yang.wang04@hand-china.com
 # @Date: 2020-07-24 10:42:21
 # @LastEditTime: 2020-09-30 16:40:19
 # @Copyright: Copyright (c) 2020, Hand
###
#!/bin/sh

 git pull

 gitPullErrorCode=$?

 if [ 0 -ne $gitPullErrorCode ]; then
   echo "git pull error, try back yarn.lock, and pull again";
   mv yarn.lock "yarn.lock.`date +"%Y-%m-%d_%H-%M-%S"`.bak" # decide yarn.lock has conflict
   git pull;
 fi;

 if [ 0 -ne $? ]; then
   exit "git pull error";
 fi;

 set -e # 报错不继续执行

export BASE_PATH=BUILD_BASE_PATH
export API_HOST=BUILD_API_HOST
export CLIENT_ID=BUILD_CLIENT_ID
export WEBSOCKET_HOST=BUILD_WEBSOCKET_HOST
export PLATFORM_VERSION=BUILD_PLATFORM_VERSION
export BPM_HOST=BUILD_BPM_HOST
#export IM_ENABLE=BUILD_IM_ENABLE

# $UPDATE_MICRO_MODULES UPDATE_MICRO_MODULES 变量如果存在值的话就 增量更新微前端子模块。

if  [[ $UPDATE_MICRO_MODULES =~ "ALL" ]] || [[ ! -n "$UPDATE_MICRO_MODULES" ]] ;then
    rm -rf yarn.lock
    yarn install
    yarn run build:dll
    yarn run transpile # 编译子模块
    yarn build
else
    echo 增量编译子模块 $UPDATE_MICRO_MODULES
    yarn run build:ms $UPDATE_MICRO_MODULES
fi

rm -rf ./html
cp -r ./dist ./html

export BUILD_BASE_PATH=/
export BUILD_API_HOST=http://172.23.16.132:8080
export BUILD_CLIENT_ID=localhost
export BUILD_WFP_EDITOR=""
export BUILD_WEBSOCKET_HOST=ws://172.23.16.132:8080/hpfm/websocket
export BUILD_PLATFORM_VERSION=SAAS
export BUILD_BPM_HOST=http://bpm.jd1.jajabjbj.top
#export BUILD_IM_ENABLE=false
export BUILD_IM_WEBSOCKET_HOST=ws://im.ws.jd1.jajabjbj.top

find ./html -name '*.js' | xargs sed -i "s BUILD_BASE_PATH ${BUILD_BASE_PATH:-/} g"
find ./html -name '*.js' | xargs sed -i "s /BUILD_PUBLIC_URL/ ${BUILD_PUBLIC_URL:-/} g"
find ./html -name '*.html' | xargs sed -i "s /BUILD_PUBLIC_URL/ ${BUILD_PUBLIC_URL:-/} g"
find ./html -name '*.css' | xargs sed -i "s /BUILD_PUBLIC_URL/ ${BUILD_PUBLIC_URL:-/} g"
find ./html -name '*.js' | xargs sed -i "s BUILD_API_HOST $BUILD_API_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_CLIENT_ID $BUILD_CLIENT_ID g"
find ./html -name '*.js' | xargs sed -i "s BUILD_WEBSOCKET_HOST $BUILD_WEBSOCKET_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_PLATFORM_VERSION $BUILD_PLATFORM_VERSION g"
#find ./html -name '*.js' | xargs sed -i "s BUILD_IM_ENABLE $BUILD_IM_ENABLE g"
find ./html -name '*.js' | xargs sed -i "s BUILD_IM_WEBSOCKET_HOST $BUILD_IM_WEBSOCKET_HOST g"
find ./html -name '*.js' | xargs sed -i "s BUILD_TRACE_LOG_ENABLE $BUILD_TRACE_LOG_ENABLE g"
find ./html -name '*.js' | xargs sed -i "s BUILD_CUSTOMIZE_ICON_NAME $BUILD_CUSTOMIZE_ICON_NAME g"

set -e
