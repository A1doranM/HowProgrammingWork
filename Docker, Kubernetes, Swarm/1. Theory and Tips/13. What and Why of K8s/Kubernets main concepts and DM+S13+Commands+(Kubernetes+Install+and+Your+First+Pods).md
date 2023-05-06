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

## Workloads

![img_52.png](img_52.png)

## Replica Sets

![img_53.png](img_53.png)

![img_54.png](img_54.png)

![img_55.png](img_55.png)

![img_56.png](img_56.png)

Commands

![img_57.png](img_57.png)

![img_58.png](img_58.png)

![img_59.png](img_59.png)

![img_60.png](img_60.png)

![img_61.png](img_61.png)

![img_62.png](img_62.png)

![img_63.png](img_63.png)

Deployment commands

![img_64.png](img_64.png)

## Daemon Set

![img_65.png](img_65.png)

![img_66.png](img_66.png)

![img_67.png](img_67.png)

![img_68.png](img_68.png)

## Stateful sets

![img_69.png](img_69.png)

![img_70.png](img_70.png)

![img_71.png](img_71.png)

![img_72.png](img_72.png)

![img_73.png](img_73.png)

![img_74.png](img_74.png)

![img_75.png](img_75.png)

![img_76.png](img_76.png)

![img_77.png](img_77.png)

![img_78.png](img_78.png)

## Job

![img_79.png](img_79.png)

![img_80.png](img_80.png)

![img_81.png](img_81.png)

## CronJob

![img_82.png](img_82.png)

![img_83.png](img_83.png)

![img_84.png](img_84.png)

![img_85.png](img_85.png)

## Rolling Updates

![img_86.png](img_86.png)

![img_87.png](img_87.png)

![img_88.png](img_88.png)

![img_89.png](img_89.png)

![img_90.png](img_90.png)

![img_91.png](img_91.png)

![img_92.png](img_92.png)

![img_93.png](img_93.png)

![img_94.png](img_94.png)

![img_95.png](img_95.png)

![img_96.png](img_96.png)

![img_97.png](img_97.png)

![img_98.png](img_98.png)

![img_99.png](img_99.png)

![img_100.png](img_100.png)

## Services

![img_101.png](img_101.png)

![img_102.png](img_102.png)

![img_104.png](img_104.png)

![img_103.png](img_103.png)

![img_105.png](img_105.png)

![img_119.png](img_119.png)

![img_106.png](img_106.png)

## ClusterIP 

![img_107.png](img_107.png)

![img_108.png](img_108.png)

![img_109.png](img_109.png)

![img_110.png](img_110.png)

![img_111.png](img_111.png)

![img_112.png](img_112.png)

## NodePort

![img_113.png](img_113.png)

![img_114.png](img_114.png)

![img_115.png](img_115.png)

![img_116.png](img_116.png)

![img_117.png](img_117.png)

![img_118.png](img_118.png)

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
    


 





