FROM jenkins/jenkins:lts

USER root

RUN groupadd -g 992 docker && usermod -aG docker jenkins

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y docker.io nodejs

RUN curl -L https://npmjs.org/install.sh | sh

RUN npx playwright install-deps

RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

USER jenkins

RUN npx playwright install