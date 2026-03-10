pipeline {

    agent {
        kubernetes {
            label 'buildah-agent'
        }
    }

    environment {
        IMAGE = "rituraj4164/buildah-demo"
        TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Image') {
            steps {
                container('buildah') {
                    sh '''
                    buildah bud -t $IMAGE:$TAG .
                    '''
                }
            }
        }

        stage('Push Image') {
            steps {
                container('buildah') {
                    sh '''
                    buildah login -u rituraj4164 -p YOUR_PASSWORD docker.io
                    buildah push $IMAGE:$TAG
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl set image deployment/buildah-app buildah-app=$IMAGE:$TAG
                    kubectl rollout status deployment/buildah-app
                    '''
                }
            }
        }

    }

}
