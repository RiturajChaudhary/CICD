pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    args: ['\\\${computer.jnlpmac}', '\\\${computer.name}']

  - name: docker
    image: docker:24.0.6-dind
    securityContext:
      privileged: true
    command:
      - dockerd-entrypoint.sh
    tty: true
    volumeMounts:
      - name: docker-storage
        mountPath: /var/lib/docker

  - name: kubectl
    image: bitnami/kubectl:latest
    command:
      - cat
    tty: true

  volumes:
  - name: docker-storage
    emptyDir: {}
"""
        }
    }

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_USER = "rituraj4164"
        DOCKER_CREDS = "dockerhub-creds"
        KUBE_CONFIG = "kubeconfig-file"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    sh '''
                    docker build -t $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG .
                    '''
                }
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDS,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS')]) {

                        sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
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

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully!"
        }

        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}