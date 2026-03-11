pipeline {
    agent { label 'buildah-agent' }

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
                container('buildah') {
                    sh 'buildah bud -t $IMAGE_NAME:$IMAGE_TAG .'
                }
            }
        }

        stage('Push Image') {
            steps {
                container('buildah') {
                    withCredentials([usernamePassword(credentialsId: "$DOCKER_CREDS", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh 'buildah login -u $USER -p $PASS docker.io'
                        sh 'buildah push $IMAGE_NAME:$IMAGE_TAG'
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh 'kubectl apply -f k8s-deployment.yaml'
                }
            }
        }
    }
}
