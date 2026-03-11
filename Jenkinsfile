pipeline {
    // Use your already running buildah-agent pod
    agent {
        kubernetes {
            label 'buildah-agent'   // Must match the label on the existing pod
            defaultContainer 'jnlp' // The jnlp container inside the pod
        }
    }

    environment {
        IMAGE_NAME = "rituraj4164/buildah-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDS = "dockerhub-creds"
        KUBE_NAMESPACE = "jenkins"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Image') {
            steps {
                container('buildah') {
                    sh "buildah bud --layers -t $IMAGE_NAME:$IMAGE_TAG ."
                }
            }
        }

        stage('Push Image') {
            steps {
                container('buildah') {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "buildah login -u $DOCKER_USER -p $DOCKER_PASS docker.io"
                        sh "buildah push $IMAGE_NAME:$IMAGE_TAG"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh """
                        sed -i "s|\\\${IMAGE_TAG}|$IMAGE_TAG|" k8s/deployment.yaml
                        kubectl apply -f k8s/deployment.yaml -n $KUBE_NAMESPACE
                        kubectl set image deployment/buildah-app buildah-app=$IMAGE_NAME:$IMAGE_TAG -n $KUBE_NAMESPACE
                        kubectl rollout status deployment/buildah-app -n $KUBE_NAMESPACE
                    """
                }
            }
        }

    }

    post {
        always {
            echo "CI/CD pipeline finished for build ${BUILD_NUMBER}"
        }
        success {
            echo "Build and deployment succeeded!"
        }
        failure {
            echo "Build or deployment failed!"
        }
    }
}
