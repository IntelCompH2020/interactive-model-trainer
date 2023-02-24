#!/bin/bash

kubectl apply -f postgres-configmap.yaml --namespace=modeltrainer
kubectl delete service postgres --namespace=modeltrainer
kubectl delete deployment postgres --namespace=modeltrainer
#kubectl delete pvc postgres-volume-claim --namespace=modeltrainer
kubectl apply -f postgres-pvc.yaml --namespace=modeltrainer
kubectl apply -f postgres-deployment.yaml --namespace=modeltrainer
kubectl apply -f postgres-service.yaml --namespace=modeltrainer
