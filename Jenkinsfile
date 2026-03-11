pipeline {
    agent {
        // kubernetes {
        //     label 'buildah'
        //     defaultContainer 'buildah'
        // }
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
                container('buildah') {
                    sh "buildah bud -t $IMAGE_NAME:$IMAGE_TAG ."
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
                        # First apply deployment YAML (create if not exist)
                        sed -i 's|rituraj4164/buildah-demo:latest|$IMAGE_NAME:$IMAGE_TAG|' k8s/deployment.yaml
                        kubectl apply -f k8s/deployment.yaml -n jenkins

                        # Then update image explicitly to trigger rollout
                        kubectl set image deployment/buildah-app buildah-app=$IMAGE_NAME:$IMAGE_TAG -n jenkins
                        kubectl rollout status deployment/buildah-app -n jenkins
                    """
                }
            }
        }

    }

    post {
        always {
            echo "CI/CD pipeline finished for build ${BUILD_NUMBER}"
        }
    }
}
