---
title: Entenda Docker de uma vez por todas
description: Tudo o que você precisa aprender sobre docker
publishedDate: 2025-09-21
tags:
  - docker
  - devops
---

## O que é

Docker é uma ferramenta para `containerizar` as aplicações. Em outras palavras, ele facilita criar, distribuir e executar aplicações dentro de containers.

A ideia de se utilizar container é que com ele é possível criar ambientes isolados, para executar a nossa aplicação. 

> Por que precisamos de um "ambiente isolado" para executar as nossas aplicações?

Existem diversos motivos, o principal é ser uma forma de padronizar a execução do programa, dessa forma, ao criar um container você especifica a versão de cada dependência, e assim, assegura que sempre que executar o programa, independente de qual sistema operacional ou servidor que esteja rodando, o resultado será o mesmo.

Além disso é uma das formas que podermos garantir que uma aplicação não impacte no funcionamento de outra. Em empresas grandes é normal termos diversas aplicações, pensa em um e-commerce por exemplo. Podemos ter um servidor focado para realizar pagamentos, outro para enviar as notificações via email e whatsapp, outro servidor para realizar a lógica de estoque, outro para carregar a listagem dos produtos, e assim por diante. 

Logo, precisamos que cada uma dessas aplicações seja independente, para que seja mais fácil identificar as falhas e corrigir rapidamente. Isso segue um padrão de desenvolvimento que é evitar o acoplamento entre serviços. Quanto mais separados eles conseguirem ser, melhor.

O resultado são várias aplicações, cada uma em seu container executando de maneira completamente independente, em um ambiente configurável e com estabilidade.

## Principais Conceitos

### Imagens

Imagem é um template com as instruções de como se criar um container docker. Normalmente uma imagem é baseada em outra imagem, por exemplo. Você pode criar uma imagem de `Node` a partir de uma imagem do `Ubuntu` para executar sua aplicação. Normalmente você criará suas próprias imagens que definirá o modo de executar as suas próprias aplicações.

### Containers

Um container é a execução da sua imagem, você consegue criar, parar, mover e deletar um container por meio da CLI do docker. Também é possível criar volumes, networks.

### Volumes

Os containers são feitos para serem stateless, ou seja, não possui estado. Você deve ser capaz de criar e apagar containers a todo instante. Porém existem alguns tipos de aplicações que possuem estado e salvam arquivos localmente. Um exemplo são banco de dados, você consegue executar eles dentro de um container docker.

Contudo, ao apagar o container você irá perder tudo o que foi salvo. Para evitar isso, você pode utilizar `Volumes` para salvar os dados do seu container em um local definido que não será perdido ao container ser deletado

### Network

Uma network é uma rede virtual criada pelo Docker para a comunicação entre containers. Eles se comunicam entre si pelo o nome do container como hostname. E os containers de fora da rede somente conseguem se comunicar caso você exponha alguma porta.

Por exemplo, se sua aplicação nodejs está rodando na porta 3000 e você quer acessar ela de fora do container, você precisa expor a porta 3000 do container com a flag -p para conseguir acessar.

Existem alguns tipos de network

- bridge (padrão): Containers nessa rede podem se comunicar entre si via IP interno, e com o host se você fizer -p (mapear portas).
- host: utiliza a rede do host, nesse caso você perde o isolamento mas melhora a performance.
- none: container fica sem rede.
- custom: você pode criar as próprias redes e segmentar os acessos.

### Registries

Registry é o local onde suas imagens são salvas, o principal local é o [Docker Hub](https://hub.docker.com/), nele você encontra as mais diversas imagens para baixar. 

Também existem outros locais para fazer o deploy das suas próprias imagens Docker, como o [Github Container Registry](https://docs.github.com/en/packages/quickstart).

## Executando o primeiro container

Para o nosso primeiro container, vamos baixar uma imagem já pronta chamada `hello-world` ela apenas exibirá no terminal uma mensagem de texto.

Primeiramente é necessário ter o docker instalado por meio do [tutorial](https://www.docker.com/get-started/).

Em seguida, vamos baixar uma imagem com o docker pull

```sh
docker pull hello-world
```

Depois executamos com docker run

```sh
docker run hello-world
```

Com isso temos nosso texto de hello-world, na mensagem também é explicada um pouco da arquitetura do docker por trás, que será explicada futuramente no post.

![Docker Run Result](@/assets/docker-run-result.png)

Se rodarmos o comando
```sh
docker image ls
```

Veremos que nós temos baixado a imagem do hello-world. A próxima etapa é acessarmos um container para executarmos comando, como se fosse uma máquina virtual.

O comando docker pull é opcional, ele é executado por internamente pelo docker se não encontrar a imagem localmente.

Passando as flags `-i -t` conseguimos interagir com o terminal do container.

```sh
docker run -i -t ubuntu
```

Agora é possível rodar comandos dentro de um container linux.

```sh
ls
```
o resultado é:

```sh
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

### Criando a primeira imagem

O exemplo mais simples possível é a criação de uma imagem para uma aplicação node em javascript, pois não precisa de build. 

Apenas crie mais um arquivo `Dockerfile` na raiz do projeto e nele você diz qual será o passo a passo para criar o container da sua aplicação.

```dockerfile title="Dockerfile"
# Usando imagem base do Node
FROM node:22-alpine

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json e package-lock.json antes para aproveitar cache
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta (caso sua app use, ex: 3000)
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
```

Cada linha é bem simples de entender o passo a passo, não tem muito mistério quanto a isso.

1. Define qual imagem deverá ser a base (aqui é uma imagem de node, que nada mais é que uma distro linux com o node 22 pré instalado para agilizar o processo).
2. Define qual pasta vamos instalar nosso aplicativo 
3. Copiamos os arquivos do package.json
4. instalamos as dependências
5. copiamos o resto dos arquivos
6. iniciamos a aplicação

Algumas dicas importantes, como estamos rodando um `npm install` dentro do docker, não precisamos copiar a pasta node_modules. Logo podemos criar um arquivo `.dockerignore`

```dockerignore title=".dockerignore"
node_modules
*.log
```

Em seguida para executarmos o container temos o comando

```sh
docker build . -t seuusuario/seuprojeto
```

> O parâmetro -t é uma forma de você identificar sua imagem

Assim ele criará a imagem, e para executar

```sh
docker run -p 3000:3000 seuusuario/seuprojeto
```

> Caso tenha mais alguma etapa como build, basta adicionar mais uma nova etapa no Dockerfile

### Criando Dockerfile para aplicações mais complexas

O exemplo acima foi o básico para entender os principais comandos.

Já o exemplo abaixo foi retirado da documentação do Next

```dockerfile title="Dockerfile"
# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

A a criação da imagem do Next é divida em 3 etapas: `Deps`, `Builder` e `Runner`.

1. Primeiro define a imagem base para o dockerfile com a versão específica do nodejs a ser utilizada 
2. Deps: baixar as dependências do projeto
3. Builder: copia os arquivos baixados pelo passo anterior e gera o build da aplicação
4. Runner: copia os arquivos do passo anterior e executam a aplicação, vale ressaltar que criam um usuário não root para aumentar a segurança da aplicação

Neste exemplo, é utilizado o recurso de `multi-stage build`, ele tem o intuito de remover da versão final as dependências de desenvolvimento, otimizando o cache e diminuindo o tamanho da imagem final. O Docker faz cache em cada etapa de build, com esse Dockerfile você consegue reaproveitar diversas camadas durante o build, por exemplo, se seu código não instalar nenhuma nova dependência, não precisará baixar novamente para a criação do container, essa etapa será reaproveitada.

## Orquestrando múltiplas imagens

Os exemplos acima eram com apenas uma imagem, porém é normal as aplicações dependerem de múltiplas imagens para executar, seja banco de dados Postgres, Redis, Load Balancer, etc. Para facilitar a configuração de várias imagens simultaneamente temos o `Docker Compose`. Ele tem o objetivo de facilitar a gestão de várias imagens simultaneamente, segue o exemplo abaixo.

Nesse caso nós temos 4 serviços, 2 banco de dados, 1 aplicação e 1 loadbalancer. Tudo configurado no mesmo arquivo de uma forma simples. Desse modo, podemos indicar quais imagens precisam de quais (depends_on), indicando a ordem que deverão subir. Quais as redes cada uma das imagens tem acesso e suas variáveis de ambiente.

```yml title=docker-compose
services:
  postgres:
    image: postgres:16
    container_name: postgres_db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    ports:
      - "6379:6379"
    networks:
      - backend

  app:
    build: ./app
    container_name: my_app
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://user:password@postgres:5432/mydb
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    networks:
      - backend

  nginx:
    image: nginx:alpine
    container_name: nginx_proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - backend
      - frontend

volumes:
  postgres_data:

networks:
  backend:
  frontend:

```

## Dicas

### Principais Comandos

- `docker ps`: Lista todos os containers ativos
- `docker ps -a`: Lista todos os containers, mesmo aqueles que estão parados
- `docker exec -it {tag|id}`: Roda um comando dentro do container
- `docker logs {tag|id}`: Acessa os logs de um container, útil para identificar erros
- `docker stop {tag|id}`: Para a execução de um container
- `docker rm {tag|id}`: Remove um container que não está sendo mais utilizado
- `docker build -t <nome>:<tag> .`: Cria uma imagem de container a partir de um Dockerfile e adiciona uma tag
- `docker push <repo>:<tag>`: Envia a imagem para um registry
- `docker pull <imagem>`: Baixa uma imagem do Docker Hub
- `docker-compose up -d`: Sobe as imagens de um docker compose em background
- `docker-compose down`: Para a execução das imagens de um docker compose
- `docker-compose logs -f`: Mostra os logs de todas as imagens
- `docker-compose ps`: Lista os serviços

### GPT é o seu melhor amigo

As LLMs são muito boas em gerar dockerfile e docker-compose, em caso de dúvida, vale pedir ajuda em alguma ferramenta, seja para explicar um recurso ou te auxiliar a criar suas próprias imagens.

### Imagens ocupam muito espaço

É comum desprezarmos o tamanho das imagens, mas em geral elas ocupam um tamanho razoável a depender do projeto. Uma dica é o comando

```sh
docker image prune
```

Ele irá deletar todas as imagens que não estão sendo usadas na sua máquina, então toma cuidado ao executar. 

Outro comando que limpará bastante espaço de disco é o:

```sh
docker system prune
```

Ele apagará todos os containers não utilizados, networks, images e cache.

### Qual imagem escolher ?

As imagens possuem várias versões, na maioria das vezes é recomendado utilizar a versão alpine das imagens, principalmente de nodejs, pois utiliza uma distro linux mais leve. Explicação mais detalhada na [documentação oficial](https://hub.docker.com/_/node/)

## Entendendo a "magia" dos containers

Antes de entrar nos detalhes técnicos, vale destacar uma diferença importante:
 - Máquinas virtuais (VMs): simulam um hardware inteiro e executam um sistema operacional completo. Isso gera isolamento forte, mas consome mais recursos.
 - Containers: compartilham o mesmo kernel do host, mas isolam processos, rede, sistema de arquivos e recursos. São muito mais leves e rápidos.

> Como isolar processos sem a necessidade de um sistema operacional "novo"

1. Namespaces: isolamento
2. Cgroups: controle de recursos

### Namespaces

O namespace é um recurso do linux que tem a função de "mentir" para o processo, logo o processo acha que ele está executando sozinho na máquina. O docker usa diversos namespaces para criar um isolamento de um container. Isso é importante porque todos os recursos do sistema são globais. Para desenvolvedores js é um contexto similar a utilizar uma variável `var` e `let`.

Alguns namespaces criado pelo docker: 

 - PID: dentro do container ele sempre terá o PID 1
 - NET: cada container tem sua própria camada de rede, possibilitando cada container ter seu IP isolado
 - MNT: pontos de montagem controlados, cada container só consegue acessar os diretórios que o Docker expor
 - UTS: permite que o container tenha hostname próprio

### Cgroups

É um outro recurso do Linux que o Docker utiliza para limitar os recursos computacionais dos processos. O objetivo é limitar quantos núcleos de CPU, memória, disco e rede cada container pode utilizar.

Um exemplo dentro do linux que você pode realizar é criar um cgroup você mesmo.

1. Criar um novo cgroup
```sh
sudo mkdir /sys/fs/cgroup/meu-grupo
```
2. Definir um limite de memória
```sh
echo 52428800 | sudo tee /sys/fs/cgroup/meu-grupo/memory.max
```
3. Adicionar um processo ao cgroup
```sh
sleep 1000 & echo $! 
```

Com o PID do último comando
```sh
echo <PID> | sudo tee /sys/fs/cgroup/meu-grupo/cgroup.procs
```
Feito! Para testar você pode rodar um stress test, para verificar se realmente os parâmetros foram executados.

Com o Docker, ele gerencia tudo isso para você de uma forma facilitada, um exemplo prático é rodar o comando: 

```sh
docker run -m 512m --cpus="1" ubuntu
```

Nele limitamos a memória a 512m e a quantidade de núcleos a 1.

### Linux vs Windows vs MacOS

Se você reparar, todos os comandos são exclusivos de linux. Logo para ter o Docker de forma realmente nativa, apenas no sistema operacional Linux. Contudo, para funcionar nos demais sistemas, o funcionamento padrão é a criação de uma máquina virtual Linux para que dessa forma possam ser executados os comandos exclusivos de Linux. 

## Referências

https://devopscube.com/what-is-docker/
https://www.freecodecamp.org/news/how-docker-containers-work/
https://labs.iximiuz.com/tutorials/container-filesystem-from-scratch
https://akitaonrails.com/2023/03/02/akitando-139-entendendo-como-containers-funcionam/