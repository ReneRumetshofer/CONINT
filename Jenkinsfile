pipeline {
    agent any

    parameters {
        booleanParam(name: 'STATIC_TESTS', defaultValue: true, description: 'Statische Code Analyse durchführen? (lint, snyk, sonar, jest)')
        booleanParam(name: 'DYNAMIC_TESTS', defaultValue: true, description: 'Dynamische Tests durchführen? (playwright, k6)')
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: false, description: 'Frontend bauen und pushen?')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: false, description: 'Backend bauen und pushen?')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Erzeugten Build deployen und testen?')
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Tag unter dem das Docker image gepushed wird')
    }

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        FRONTEND_GREEN = 'http://frontend-green:80'
        BACKEND_GREEN = 'http://backend-green:3000/api'
        FRONTEND_IMAGE = 'nick7152/secret-notes-frontend'
        BACKEND_IMAGE = 'nick7152/secret-notes-backend'
    }

    stages {

        stage('Install Dependencies') {
            parallel {
                stage('Install Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Install Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint & Static Analysis') {
            when {
                expression { return params.STATIC_TESTS }
            }
            parallel {
                stage('Test Frontend') {
                    steps {
                        dir('frontend') {
                            echo 'Linting Frontend...'
                            sh 'npm run eslint'

                            echo 'SonarQube & Snyk Frontend...'
                            withCredentials([string(credentialsId: 'sonar-creds', variable: 'SONAR_TOKEN')]) {
                                withSonarQubeEnv('SonarQube') {
                                    sh 'npm run sonar-scanner'
                                }
                            }
                            timeout(time: 1, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: true
                            }
                            withCredentials([string(credentialsId: 'snyk-creds', variable: 'SNYK_TOKEN')]) {
                                sh 'npm run snyk-auth'
                            }
                            sh 'npm run snyk'
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        dir('backend') {
                            echo 'Linting Backend...'
                            sh 'npm run eslint'

                            echo 'SonarQube & Snyk Backend...'
                            withCredentials([string(credentialsId: 'sonar-creds', variable: 'SONAR_TOKEN')]) {
                                withSonarQubeEnv('SonarQube') {
                                    sh 'npm run sonar-scanner'
                                }
                            }
                            timeout(time: 1, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: true
                            }
                            withCredentials([string(credentialsId: 'snyk-creds', variable: 'SNYK_TOKEN')]) {
                                sh 'npm run snyk-auth'
                            }
                            sh 'npm run snyk'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            when {
                expression { return params.STATIC_TESTS }
            }
            parallel {
                stage('Test Frontend') {
                    steps {
                        dir('frontend') {
                            echo 'Testing Frontend...'
                            sh 'npm run jest'
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        dir('backend') {
                            echo 'Testing Backend...'
                            sh 'npm run jest'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { return params.BUILD_FRONTEND || params.BUILD_BACKEND }
            }
            parallel {
                stage('Build Frontend Image') {
                    when {
                        expression { return params.BUILD_FRONTEND }
                    }
                    steps {
                        dir('frontend') {
                            echo 'Building Frontend...'
                            sh "docker build -t $FRONTEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest ."
                        }
                    }
                }
                stage('Build Backend Image') {
                    when {
                        expression { return params.BUILD_BACKEND }
                    }
                    steps {
                        dir('backend') {
                            echo 'Building Backend...'
                            sh "docker build -t $BACKEND_IMAGE:$IMAGE_TAG -t $BACKEND_IMAGE:latest ."
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            when {
                expression { return params.BUILD_FRONTEND || params.BUILD_BACKEND }
            }
            parallel {
                stage('Push Frontend Docker Image') {
                    when {
                        expression { return params.BUILD_FRONTEND }
                    }
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                            echo 'Pushing Frontend...'
                            sh "docker push $FRONTEND_IMAGE"
                        }
                    }
                }
                stage('Push Backend Docker Image') {
                    when {
                        expression { return params.BUILD_BACKEND }
                    }
                    steps {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                            echo 'Pushing Backend...'
                            sh "docker push $BACKEND_IMAGE"
                        }
                    }
                }
            }
        }

        stage('Start Database if not running') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo 'Starting database...'
                sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-green.yml up -d db"
            }
        }

        stage('Deploy to Green') {
            when {
                expression { return params.DEPLOY }
            }
            parallel {
                stage('Deploy Frontend to Green') {
                    steps {
                        echo 'Deploying Frontend to green...'
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-green.yml down frontend-green"
                        sh "IMAGE_TAG=${IMAGE_TAG} docker-compose -f stacks/secret_notes/docker-compose-secret-notes-green.yml up -d --build frontend-green"
                    }
                }
                stage('Deploy Backend to Green') {
                    steps {
                        echo 'Deploying Backend to green...'
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-green.yml down backend-green"
                        sh "IMAGE_TAG=${IMAGE_TAG} docker-compose -f stacks/secret_notes/docker-compose-secret-notes-green.yml up -d --build backend-green"
                    }
                }
            }
        }

        stage('E2E & Performance Testing') {
            when {
                expression { return params.DYNAMIC_TESTS }
            }
            steps {
                dir('frontend') {
                    echo 'Testing Frontend on green...'
                    sh 'npm run playwright'
                    sh "BACKEND_GREEN=${BACKEND_GREEN} npm run k6"
                }
            }
        }

        stage('Switch to Green') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo 'Switching from blue to green deployment...'
                sh '''
                docker exec blue-green-proxy sh -c "
                  sed -i \
                      -e 's|set \\$active_frontend http://frontend-blue:80;|set \\$active_frontend http://frontend-green:80;|' \
                      -e 's|set \\$active_backend http://backend-blue:3000;|set \\$active_backend http://backend-green:3000;|' \
                      /etc/nginx/conf.d/blue-green.conf && \
                  nginx -s reload
                "
                '''
            }
        }

        stage('Deploy to Blue') {
            when {
                expression { return params.DEPLOY }
            }
            parallel {
                stage('Deploy Frontend to Blue') {
                    steps {
                        echo 'Deploying Frontend to blue...'
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-blue.yml down frontend-blue"
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-blue.yml up -d --build frontend-blue"
                    }
                }
                stage('Deploy Backend to Blue') {
                    steps {
                        echo 'Deploying Backend to blue...'
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-blue.yml down backend-blue"
                        sh "docker-compose -f stacks/secret_notes/docker-compose-secret-notes-blue.yml up -d --build backend-blue"
                    }
                }
            }
        }

        stage('Switch to Blue') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo 'Switching green to blue deployment...'
                sh '''
                docker exec blue-green-proxy sh -c "
                  sed -i \
                      -e 's|set \\$active_frontend http://frontend-green:80;|set \\$active_frontend http://frontend-blue:80;|' \
                      -e 's|set \\$active_backend http://backend-green:3000;|set \\$active_backend http://backend-blue:3000;|' \
                      /etc/nginx/conf.d/blue-green.conf && \
                  nginx -s reload
                "
                '''
            }
        }
    }
}
