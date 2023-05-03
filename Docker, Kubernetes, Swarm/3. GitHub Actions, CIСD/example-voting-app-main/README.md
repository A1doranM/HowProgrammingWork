Example Voting App
=========

[![Lint Code Base](https://github.com/BretFisher/example-voting-app/actions/workflows/call-super-linter.yaml/badge.svg)](https://github.com/BretFisher/example-voting-app/actions/workflows/call-super-linter.yaml)
[![Build Result](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-result.yaml/badge.svg)](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-result.yaml)
[![Build Vote](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-vote.yaml/badge.svg)](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-vote.yaml)
[![Build Worker](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-worker.yaml/badge.svg)](https://github.com/BretFisher/example-voting-app/actions/workflows/call-docker-build-worker.yaml)

A simple distributed application running across multiple Docker containers.

Getting started
---------------

Download [Docker Desktop](https://www.docker.com/products/docker-desktop) for Mac or Windows. [Docker Compose](https://docs.docker.com/compose) will be automatically installed. On Linux, make sure you have the latest version of [Compose](https://docs.docker.com/compose/install/).

Linux Containers
----------------

The Linux stack uses Python, Node.js, and Java, with Redis for messaging and Postgres for storage.

Run in this directory:

```shell
docker-compose up
```

The app will be running at [http://localhost:5000](http://localhost:5000), and the results will be at [http://localhost:5001](http://localhost:5001).

Alternately, if you want to run it on a [Docker Swarm](https://docs.docker.com/engine/swarm/), first make sure you have a swarm. If you don't, run:

```shell
docker swarm init
```

Once you have your swarm, in this directory run:

```shell
docker stack deploy --compose-file docker-stack.yml vote
```

Run the app in Kubernetes
-------------------------

The folder `k8s-manifest` contains the resources of the Voting App's services.

First create the vote namespace

```shell
kubectl create namespace vote
```

Run the following command to create the deployments and services objects:

```shell
$ kubectl apply -f k8s-manifests/
deployment "db" created
service "db" created
deployment "redis" created
service "redis" created
deployment "result" created
service "result" created
deployment "vote" created
service "vote" created
deployment "worker" created
```

The vote interface is then available on port 31000 on each host of the cluster, the result one is available on port 31001.

Architecture
------------

![Architecture diagram](architecture.png)

* A frontend web app in [Python](/vote) which lets you vote between two options
* A [Redis](https://hub.docker.com/_/redis/) queue which collects new votes
* A [Java](/worker/src/main) worker which consumes votes and stores them in…
* A [Postgres](https://hub.docker.com/_/postgres/) database backed by a Docker volume
* A [Node.js](/result) webapp which shows the results of the voting in real time

Notes
-----

The voting application only accepts one vote per client. It does not register votes if a vote has already been submitted from a client.

This isn't an example of a properly architected perfectly designed distributed app... it's just a simple
example of the various types of pieces and languages you might see (queues, persistent data, etc), and how to
deal with them in Docker at a basic level.
