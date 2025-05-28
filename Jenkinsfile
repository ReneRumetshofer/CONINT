pipeline {
  agent any

  environment {
    FRONTEND_DIR = 'frontend'
    BACKEND_DIR = 'backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Frontend') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'docker compose build'
        }
      }
    }

    stage('Build Backend') {
      steps {
        dir("${BACKEND_DIR}") {
          sh 'docker compose build'
        }
      }
    }

    stage('Deploy Frontend') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'docker compose up -d'
        }
      }
    }

    stage('Deploy Backend') {
      steps {
        dir("${BACKEND_DIR}") {
          sh 'docker compose up -d'
        }
      }
    }
  }

  post {
    failure {
      echo 'Build or deployment failed.'
    }
    success {
      echo 'Frontend and Backend deployed successfully.'
    }
  }
}
