FROM jenkins/jenkins:lts

USER root

RUN groupadd -g 992 docker && usermod -aG docker jenkins

RUN gpg -k && gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69 && \
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list

RUN apt-get update && \
    apt-get install -y k6

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get update && \
    apt-get install -y docker.io nodejs

RUN curl -L https://npmjs.org/install.sh | sh

RUN npx playwright install-deps

RUN curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose

USER jenkins

RUN npx playwright install