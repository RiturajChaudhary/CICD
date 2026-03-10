pipeline {
    agent {
        kubernetes {
            inheritFrom 'default' // optional: use default pod template
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    some-label: docker-agent
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
    args: ['\${computer.jnlpmac}', '\${computer.name}']
    tty: true
  - name: docker
    image: docker:24.0.6-dind
    securityContext:
      privileged: true
    command:
      - dockerd-entrypoint.sh
    tty: true
    volumeMounts:
      - name: docker-graph-storage
        mountPath: /var/lib/docker
  volumes:
    - name: docker-graph-storage
      emptyDir: {}
"""
        }
    }

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = 'dockerhub-creds'
        KUBE_CONFIG = 'kubeconfig-file'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                        docker build -t $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG .
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