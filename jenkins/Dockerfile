FROM jenkins/jenkins:lts-alpine

USER root

RUN apk update && \
    apk add --no-cache docker-cli nodejs npm && \
    rm -rf /var/cache/apk/*

RUN addgroup -g 992 docker && adduser jenkins docker

USER jenkins
