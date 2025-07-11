FROM jenkins/jenkins:lts-alpine

USER root

RUN apk update && \
    apk add --no-cache docker-cli && \
    rm -rf /var/cache/apk/*

USER jenkins
