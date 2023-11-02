#!/bin/bash

cd frontend
kubectl delete configmap imt-frontend --namespace=modeltrainer
kubectl create configmap imt-frontend --from-file=nginx.conf --from-file=config.json --namespace=modeltrainer
kubectl delete service imt-frontend --namespace=modeltrainer
kubectl delete deployment imt-frontend --namespace=modeltrainer
kubectl apply -f frontend-deployment.yaml  --namespace=modeltrainer
kubectl apply -f frontend-service.yaml  --namespace=modeltrainer


cd ../backend-apis
kubectl delete configmap imt-api --namespace=modeltrainer
kubectl create configmap imt-api --from-file=../config-files/api/config --namespace=modeltrainer
kubectl delete configmap imt-management --namespace=modeltrainer
kubectl create configmap imt-management --from-file=../config-files/api/management --namespace=modeltrainer
kubectl apply -f logs-pvc.yaml --namespace=modeltrainer
kubectl apply -f wordlists-pvc.yaml --namespace=modeltrainer
kubectl apply -f corpus-pvc.yaml --namespace=modeltrainer
kubectl apply -f models-pvc.yaml --namespace=modeltrainer
kubectl apply -f models-dc-pvc.yaml --namespace=modeltrainer
kubectl apply -f models-dc-zero-shot-pvc.yaml --namespace=modeltrainer
kubectl apply -f topic-modeling-pvc.yaml --namespace=modeltrainer

kubectl delete service imt-backend-apis --namespace=modeltrainer
kubectl delete deployment imt-backend-apis --namespace=modeltrainer
kubectl apply -f backend-apis-deployment.yaml  --namespace=modeltrainer
kubectl apply -f backend-apis-service.yaml  --namespace=modeltrainer


cd ../proxy
kubectl delete configmap imt-proxy --namespace=modeltrainer
kubectl create configmap imt-proxy --from-file=nginx.conf --from-file=ProxyNginx.conf --namespace=modeltrainer
kubectl delete service imt-proxy --namespace=modeltrainer
kubectl delete deployment imt-proxy --namespace=modeltrainer
kubectl apply -f proxy-deployment.yaml  --namespace=modeltrainer
kubectl apply -f proxy-service.yaml  --namespace=modeltrainer

cd ..