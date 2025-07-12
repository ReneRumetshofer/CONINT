FROM jenkins/jenkins:lts

USER root

RUN groupadd -g 992 docker && usermod -aG docker jenkins

RUN apt-get update && \
    apt-get install -y docker.io

RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

USER jenkins
