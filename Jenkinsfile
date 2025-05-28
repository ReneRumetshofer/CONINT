pipeline {
    agent any

    parameters {
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: false, description: 'Frontend bauen und deployen?')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: false, description: 'Backend bauen und deployen?')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        SONARQUBE_SERVER = 'localhost'
        FRONTEND_IMAGE = 'nick7152/secret-notes-frontend'
        BACKEND_IMAGE = 'nick7152/secret-notes-backend'
    }

    stages {

        stage('Lint & Static Analysis') {
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        dir('frontend') {
                            echo 'Linting Frontend...'
                            sh 'npm install'
                            sh 'npm run lint'

                            echo 'SonarQube & Snyk Frontend...'
                            sh 'npm run scan'
                            sh 'npm run security-auth'
                            sh 'npm run security'
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            echo 'Linting Backend...'
                            sh 'npm install'
                            sh 'npm run lint'

                            echo 'SonarQube & Snyk Backend...'
                            withSonarQubeEnv("${SONARQUBE_SERVER}") {
                                sh 'sonar-scanner'
                            }
                            sh "snyk auth $SNYK_TOKEN"
                            sh 'snyk test'
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        dir('frontend') {
                            sh 'npm run test'
                            junit '**/test-results.xml'
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            sh 'npm run test -- --coverage'
                            junit '**/test-results.xml'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    if (params.BUILD_FRONTEND) {
                        dir('frontend') {
                            sh "docker build -t $FRONTEND_IMAGE ."
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            sh "docker build -t $BACKEND_IMAGE ."
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
            steps {
                echo 'Running E2E (Playwright) and Performance (k6) tests...'
                sh 'npx playwright test'
                sh 'k6 run tests/perf.js'
            }
        }

        stage('Switch to Green') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo 'Switching Blue/Green deployment...'
                sh './scripts/switch-blue-green.sh'
            }
        }
    }
}
