rm -rf yarn.lock
yarn install
yarn run build:dll
yarn run transpile
yarn build



echo "容器登录"
docker login -u User6371438 -p User6371438PWD registry.choerodon.com.cn

docker rm -f htc-front-53

docker rmi -f $(docker images registry.choerodon.com.cn/htc/htc-front-53 -q)


echo "生成本地容器，暂不上传服务器"
echo "docker build --pull -t registry.choerodon.com.cn/htc/htc-front:dev_docker_images ."
docker build --pull -t registry.choerodon.com.cn/htc/htc-front:dev_docker_images_53 .




echo "启动docker"
docker run -it -d --name htc-front-53 \
  -e API_HOST="http://172.23.40.53:8080" \
  -e DOC_SERVER="http://172.23.40.53:18000" \
  -e BUILD_API_HOST="http://172.23.40.53:8080" \
  -e BUILD_BASE_PATH="/" \
  -e BUILD_BPM_HOST="http://172.23.40.53:8080" \
  -e BUILD_CLIENT_ID="hzero-front-dev" \
  -e BUILD_PLATFORM_VERSION="SAAS" \
  -e BUILD_WEBSOCKET_HOST="ws://172.23.40.53:8080/hpfm/websocket" \
  -e INVOICE_CHECK_API_SERVER="/hcan" \
  -e GOTO_INVOICE_CHECK_ROUTE="htc-front-chan" \
  -p 1080:80 \
  registry.choerodon.com.cn/htc/htc-front:2021.9.9-111517-uat
