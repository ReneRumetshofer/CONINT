pipeline {
    agent any

    tools {
        nodejs 'Default'
    }

    parameters {
        booleanParam(name: 'STATIC_TESTS', defaultValue: true, description: 'Statische Code Analyse durchführen?')
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: false, description: 'Frontend bauen und pushen?')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: false, description: 'Backend bauen und pushen?')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Erzeugten Build deployen und testen?')
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Tag unter dem das Docker image gepushed wird')
    }

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        FRONTEND_IMAGE = 'nick7152/secret-notes-frontend'
        BACKEND_IMAGE = 'nick7152/secret-notes-backend'
    }

    stages {

        stage('Lint & Static Analysis') {
            when {
                expression { return params.STATIC_TESTS }
            }
            steps {
                dir('frontend') {
                    echo 'Linting Frontend...'
                    sh 'npm install'
                    sh 'npm run lint'

                    echo 'SonarQube & Snyk Frontend...'
                    withCredentials([string(credentialsId: 'sonar-creds', variable: 'SONAR_TOKEN')]) {
                        sh 'npm run scan-jenkins'
                    }
                    withCredentials([string(credentialsId: 'snyk-creds', variable: 'SNYK_TOKEN')]) {
                        sh 'npm run security-auth'
                    }
                    sh 'npm run security'
                }
                dir('backend') {
                    echo 'Linting Backend...'
                    sh 'npm install'
                    sh 'npm run lint'

                    echo 'SonarQube & Snyk Backend...'
                    withCredentials([string(credentialsId: 'sonar-creds', variable: 'SONAR_TOKEN')]) {
                        sh 'npm run scan-jenkins'
                    }
                    withCredentials([string(credentialsId: 'snyk-creds', variable: 'SNYK_TOKEN')]) {
                        sh 'npm run security-auth'
                    }
                    sh 'npm run security'
                }
            }
        }

        stage('Unit Tests') {
            when {
                expression { return params.STATIC_TESTS }
            }
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        dir('frontend') {
                            sh 'npm run test'
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            sh 'npm run test'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { return params.BUILD_FRONTEND || params.BUILD_BACKEND }
            }
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        dir('frontend') {
                            sh "docker build -t $FRONTEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest ."
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            sh "docker build -t $BACKEND_IMAGE:$IMAGE_TAG -t $BACKEND_IMAGE:latest ."
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                    script {
                        if (params.BUILD_FRONTEND) {
                            sh "docker push $FRONTEND_IMAGE"
                        }
                        if (params.BUILD_BACKEND) {
                            sh "docker push $BACKEND_IMAGE"
                        }
                    }
                }
            }
        }

        stage('Deploy to Staging (Blue/Green)') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        echo 'Deploying Frontend...'
                        sh './scripts/deploy-blue-green.sh frontend'
                    }
                    if (params.BUILD_BACKEND) {
                        echo 'Deploying Backend...'
                        sh './scripts/deploy-blue-green.sh backend'
                    }
                }
            }
        }

        stage('E2E & Performance Testing') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo 'Running E2E (Playwright) and Performance (k6) tests...'
                sh 'npx playwright test'
                sh 'k6 run tests/perf.js'
            }
        }

        stage('Switch to Green') {
            when {
                expression { return params.DEPLOY }
            }
            steps {
                echo 'Switching Blue/Green deployment...'
                sh './scripts/switch-blue-green.sh'
            }
        }
    }
}
