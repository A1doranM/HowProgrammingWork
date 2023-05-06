# Kubernetes Install and Your First Pods

## Kubernetes Architecture

![img.png](img.png)

![img_1.png](img_1.png)

## K8s API

![img_2.png](img_2.png)

## K8s CLI

![img_3.png](img_3.png)

## K8s Context

![img_4.png](img_4.png)

![img_5.png](img_5.png)

## K8s Nodes

![img_6.png](img_6.png)

![img_7.png](img_7.png)

![img_8.png](img_8.png)

![img_9.png](img_9.png)

![img_10.png](img_10.png)

![img_11.png](img_11.png)

![img_12.png](img_12.png)

![img_13.png](img_13.png)

![img_14.png](img_14.png)

![img_15.png](img_15.png)

![img_16.png](img_16.png)

## K8s Pods

![img_17.png](img_17.png)

![img_18.png](img_18.png)

![img_19.png](img_19.png)

![img_20.png](img_20.png)

![img_21.png](img_21.png)

![img_22.png](img_22.png)

![img_23.png](img_23.png)

![img_24.png](img_24.png)

![img_25.png](img_25.png)

![img_26.png](img_26.png)

![img_27.png](img_27.png)

![img_28.png](img_28.png)

![img_29.png](img_29.png)

Common commands for pods

![img_30.png](img_30.png)

Init containers

![img_31.png](img_31.png)

![img_32.png](img_32.png)

![img_33.png](img_33.png)

![img_34.png](img_34.png)

![img_35.png](img_35.png)

![img_36.png](img_36.png)

## Labels and Selectors

![img_37.png](img_37.png)

![img_38.png](img_38.png)

![img_39.png](img_39.png)

## Multi Container Pods

![img_40.png](img_40.png)

![img_41.png](img_41.png)

![img_42.png](img_42.png)

![img_43.png](img_43.png)

![img_44.png](img_44.png)

![img_45.png](img_45.png)

Common Commands 

## Pods networking

![img_46.png](img_46.png)

![img_47.png](img_47.png)

![img_48.png](img_48.png)

![img_49.png](img_49.png)

![img_50.png](img_50.png)

![img_51.png](img_51.png)



## Kubectl run, create and apply

    kubectl run
    
    kubectl create
    
    kubectl apply

## Our First Pod With Kubectl run

    kubectl version
    
    kubectl run my-nginx --image nginx
    
    kubectl get pods
    
    kubectl get all
    
    kubectl delete deployment my-nginx
    
    kubectl get all

## Scaling ReplicaSets

    kubectl run my-apache --image httpd
    
    kubectl get all
    
    kubectl scale deploy/my-apache --replicas2
    
    kubectl scale deployment my-apache --replicas2
    
    kubectl get all

## Inspecting Kubernetes Objects

    kubectl get pods
    
    kubectl logs deployment/my-apache
    
    kubectl logs deployment/my-apache --follow --tail 1
    
    kubectl logs -l run=my-apache
    
    kubectl get pods
    
    kubectl describe pod/my-apache-<pod id>
    
    kubectl get pods -w
    
    kubectl delete pod/my-apache-<pod id>
    
    kubectl get pods
    
    kubectl delete deployment my-apache
    


 





