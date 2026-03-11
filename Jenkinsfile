pipeline {
    agent any

    environment {
        IMAGE_NAME = "rituraj4164/buildah-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDS = "dockerhub-creds"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Image') {
            steps {
                sh "buildah bud --layers -t $IMAGE_NAME:$IMAGE_TAG ."
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

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    sed -i "s|\\\${IMAGE_TAG}|$IMAGE_TAG|" k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml -n jenkins
                    kubectl set image deployment/buildah-app buildah-app=$IMAGE_NAME:$IMAGE_TAG -n jenkins
                    kubectl rollout status deployment/buildah-app -n jenkins
                """
            }
        }
    }

    post {
        always {
            echo "CI/CD pipeline finished for build ${BUILD_NUMBER}"
        }
    }
}
