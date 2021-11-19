FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.5.0

RUN echo "Asia/shanghai" > /etc/timezone;
RUN sed -i 's/\#gzip/gzip/g' /etc/nginx/nginx.conf;
ADD ./dist-ext /usr/share/nginx/html
ADD ./default.conf /etc/nginx/conf.d/
COPY ./enterpoint.sh /usr/share/nginx/html
RUN chmod 777 /usr/share/nginx/html/enterpoint.sh
RUN chmod -R 755 /usr/share/nginx/html/
ENTRYPOINT ["/usr/share/nginx/html/enterpoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

RUN mkdir -p /usr/share/nginx/html/extend-static

EXPOSE 80
