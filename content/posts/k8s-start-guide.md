---
title: Aprendendo k8s
description: A forma como grandes empresas fazem deploy das suas aplicações
publishedDate: 2025-09-13
tags:
  - k8s
draft: true
---


## O que é k8s

Kubernetes (k8s) é um produto para facilitar a implantação, automatização, dimensionamento de aplicativos em containers. Antes de se aprofundar no k8s, é necessário entender o básico de containers. Se ainda não leu meu [artigo sobre Docker](https://www.phpeterle.com/posts/docker/) é bom dar uma olhada para entender melhor esse conceito.

## Conceitos

- Cluster: Conjunto de máquinas, cada máquina possui uma quantidade de vCPU e memória


## Como estou aprendendo

Esse artigo será muito mais um diário do que uma explicação em si dos conceitos. Vou seguir a [documentação oficial](https://kubernetes.io/pt-br/docs/tutorials/hello-minikube/) e seus exemplos e sintetizar tudo por aqui para facilitar meu aprendizado.

Comecei instalando o minikube que é uma ferramenta para executar kubernetes localmente.

Em um terminal comecei o minikube
```sh
minikube start
```

Em outro abri o dashboard, você consegue ter uma visão geral de todo o kubernetes, bem interesante.
```sh
minikube dashboard
```

## Pod

Pod se refere a um ou mais containers agrupados com um fim específico.

## Replica Set

É uma forma de executarmos vária instância da nossa aplicação de uma só vez

## Deployment

É uma maneira declarativa para atualizar Pods e ReplicaSets

## Service

É o modo na qual conseguimos acessar os nossos pods (pode estar dentro de um replicaset/deployment) 

### Cluster IP

## Criando meu primeiro deployment

Esse comando irá criar um deployment para gerenciar um pod com uma específica imagem de docker

```sh
kubectl create deployment hello-node --image=registry.k8s.io/e2e-test-images/agnhost:2.53 -- /agnhost netexec --http-port=8080
```

## Service

Um pod somente é acessível dentro da rede interna do kubernetes, para acessar ele fora do kubernetes é necessário export o pod como um `Service`.

```sh
kubectl expose deployment hello-node --type=LoadBalancer --port=8080
```

o type LoadBalancer indica para expor o serviço para fora do cluster Kubernetes. Agora podemos acessar o serviço com o comando:

```sh
minikube service hello-node
```

### ClusterIP

Expõe internamente um IP virtual para outros pods acessarem esse serviço. Não é acessível de fora do cluster. Ele é o padrão ao criar um service

### NodePort

Um tipo de serviço para abrir uma porta em todos os nodes e conseguir acesá-lo fora da rede do k8s. Muito pouco utilizado em produção devido a grande exposição dos nodes.

### LoadBalancer

Designa um IP público para acessar o service, e internamente utilize o ClusterIP + NodePort para o redirecionamento, usando um Load Balancer para o balanceamento de cargas entre os nodes.

## API do Kubernetes

O kubernetes possui uma api interna na qual faz o controle de todos os recursos, para acessarmos essa api diretamente podemos fazer um proxy.

```sh
kubectl proxy --port=8080 
```


### Principais comandos

- kubectl get deployments: ver os deployments
- kubectl get pods: ver os pods
- kubectl get services
- kubectl get events: ver os eventos de atualização 
- kubectl config view: ver a configuração 