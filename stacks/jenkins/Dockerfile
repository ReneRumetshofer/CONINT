FROM jenkins/jenkins:lts

USER root

#RUN apt-get update && \
    #apt-get install -y nodejs npm

RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

RUN groupadd -g 992 docker && usermod -aG docker jenkins

USER jenkins
