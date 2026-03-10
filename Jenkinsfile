pipeline {
    agent {
        kubernetes {
            label 'buildah'            
            defaultContainer 'buildah'
        }
    }

    environment {
        IMAGE_NAME = "rituraj4164/buildah-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDS = "dockerhub-creds"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Image') {
            steps {
                sh "buildah bud -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "buildah login -u $DOCKER_USER -p $DOCKER_PASS docker.io"
                    sh "buildah push $IMAGE_NAME:$IMAGE_TAG"
                }
            }
        }

        stage('Deploy') {
            steps {
                sh "kubectl set image deployment/buildah-app buildah-app=$IMAGE_NAME:$IMAGE_TAG"
            }
        }
    }
}
