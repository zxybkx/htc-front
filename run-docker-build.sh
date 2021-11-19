git pull

echo "开始前端打包"
echo "yarn run build:ext-ms htc-mdm,htc-chan.htc-iop,htc-ivp"
rm -rf ./dist-ext/packages
rm -rf ./docker-dev/dist-ext/packages
yarn run build:ext-ms htc-front-mdm
yarn run build:ext-ms htc-front-chan
yarn run build:ext-ms htc-front-ivp
yarn run build:ext-ms htc-front-iop

echo "打包完成，开始程序cp"
echo "cp ./dist-ext/ ./docker-dev/"
cp -r ./dist-ext/packages ./docker-dev/dist-ext/

cd ./docker-dev

echo "容器登录"
docker login -u User6371438 -p User6371438PWD registry.choerodon.com.cn

docker rm -f htc-front

docker rmi -f $(docker images registry.choerodon.com.cn/htc/htc-front -q)


echo "生成本地容器，暂不上传服务器"
echo "docker build --pull -t registry.choerodon.com.cn/htc/htc-front:dev_docker_images ."
docker build --pull -t registry.choerodon.com.cn/htc/htc-front:dev_docker_images .




echo "启动docker"
docker run -it -d --name htc-front \
  -e API_HOST="http://172.23.16.132:8080" \
  -e BUILD_API_HOST="http://172.23.16.132:8080" \
  -e BUILD_BASE_PATH="/" \
  -e BUILD_BPM_HOST="http://172.23.16.132:8080" \
  -e BUILD_CLIENT_ID="hone-front-dev" \
  -e BUILD_PLATFORM_VERSION="SAAS" \
  -e BUILD_WEBSOCKET_HOST="ws://172.23.16.132:8080/hpfm/websocket" \
  -e INVOICE_CHECK_API_SERVER="/hcan" \
  -e GOTO_INVOICE_CHECK_ROUTE="htc-front-chan" \
  -p 4368:80 \
  registry.choerodon.com.cn/htc/htc-front:dev_docker_images
