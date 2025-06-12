pipeline {
    agent any

    tools {
        nodejs 'Default'
    }

    parameters {
        booleanParam(name: 'BUILD_FRONTEND', defaultValue: false, description: 'Frontend bauen und pushen?')
        booleanParam(name: 'BUILD_BACKEND', defaultValue: false, description: 'Backend bauen und pushen?')
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Erzeugten Build deployen und testen?')
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Tag unter dem das Docker image gepushed wird')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        SONAR_HOST_URL = 'sonarqube'
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
                            sh 'sonar-scanner'
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
                            sh "docker build -t $FRONTEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest ."
                        }
                    }
                    if (params.BUILD_BACKEND) {
                        dir('backend') {
                            sh "docker build -t $BACKEND_IMAGE:$IMAGE_TAG -t $FRONTEND_IMAGE:latest ."
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
                    if (params.DEPLOY) {
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
        }

        stage('E2E & Performance Testing') {
            steps {
                script {
                    if (params.DEPLOY) {
                        echo 'Running E2E (Playwright) and Performance (k6) tests...'
                        sh 'npx playwright test'
                        sh 'k6 run tests/perf.js'
                    }
                }
            }
        }

        stage('Switch to Green') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                script {
                    if (params.DEPLOY) {
                        echo 'Switching Blue/Green deployment...'
                        sh './scripts/switch-blue-green.sh'
                    }
                }
            }
        }
    }
}
