FROM jenkins/jenkins:lts-alpine

USER root

RUN apk update && \
    apk add --no-cache docker-cli nodejs npm && \
    rm -rf /var/cache/apk/*

RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

RUN addgroup -g 992 docker && adduser jenkins docker

USER jenkins
