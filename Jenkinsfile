pipeline {
    agent { kubernetes { label 'buildah-agent' defaultContainer 'buildah' } }

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        DOCKER_USER = "your-dockerhub-username"
        DOCKER_PASS = credentials('dockerhub-creds')
        KUBE_CONFIG = 'kubeconfig-file'
    }

    stages {
        stage('Checkout') {
            steps { git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git' }
        }

        stage('Build & Push') {
            steps {
                sh '''
                   buildah bud -t $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG .
                   echo $DOCKER_PASS | buildah login -u $DOCKER_USER --password-stdin docker.io
                   buildah push $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: KUBE_CONFIG, variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl set image deployment/static-web-deployment \
                        nodejs-app=$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        kubectl rollout status deployment/static-web-deployment
                    '''
                }
            }
        }
    }
}