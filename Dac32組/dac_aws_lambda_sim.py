#aws premium architecture
from diagrams import Cluster, Diagram, Edge
from diagrams.aws.compute import EC2,ECS,Fargate,Lambda,EKS
from diagrams.aws.network import ELB, VPC, InternetGateway, CF, Route53,PrivateSubnet,VpnConnection
from diagrams.aws.security import IAM, WAF, KMS,SecretsManager,SecurityHub
from diagrams.aws.database import DDB,ElasticacheForRedis,RDSPostgresqlInstance, ElastiCache
from diagrams.aws.storage import S3, EFS
from diagrams.aws.general import Users
from diagrams.aws.management import Cloudwatch
from diagrams.aws.devtools import XRay

with Diagram("AWS Premium Architecture",direction = "TB", filename="aws_premium_architecture_osage_tb", show=True,graph_attr = {'layout':"osage"}):
    clients = Users("clients")
    with Cluster("AWS Platform",graph_attr = {"pack":"48"}):#change the distance between clusters

# ---
        with Cluster("Service Project"):
            elb = ELB("Elastic Load Balancing")
            cldfrnt = CF("CloudFront")
            dns = Route53("Route53")
            waf = WAF("WAF")
            elb - Edge(style="dotted") - waf
            with Cluster("Computing"):
                with Cluster("Subnet"):
                    cmptgrp = [
                        EKS("EKS1",),
                        EKS("EKS2"),
                        EKS("EKS3")
                    ]
            with Cluster("Databases"):
                db = DDB("DynamoDB")
                with Cluster("Subnet"):
                    sbnet = PrivateSubnet("Subnet")
                    with Cluster("zone-a"):
                        redisPrmy = ElasticacheForRedis("Primary")
                        postgresSQLPrmy = RDSPostgresqlInstance("Primary")
                    with Cluster("zone-b"):
                        redisRplc = ElasticacheForRedis("Replica")
                        postgresSQLStby = RDSPostgresqlInstance("Standby")
                    #ElastiCache HA
                    postgresSQLPrmy << Edge() >> postgresSQLStby
                    #Redis HA
                    redisPrmy << Edge() >> redisRplc

            with Cluster("Storage"):
                s3 = S3("S3")
                efs = EFS("Elastic File System")

            with Cluster("Operations"):
                cldwtchlgs = Cloudwatch("CloudWatch Logs")
                cldwtch = Cloudwatch("CloudWatch")
                xray = XRay("X-Ray")
            with Cluster("Security"):
                iam = IAM("IAM")
                scrtmng = SecretsManager("Secrets Manager")
                kms = KMS("Key Management Service")
                sch = SecurityHub("Security Hub")

# ---
        with Cluster("Host Project"):
            vpc = VPC("VPC")
            with Cluster("asia-east1"):
                with Cluster("Subnet"):
                    privateSubnet = PrivateSubnet("Private Subnet")
                with Cluster("Subnet"):
                    privateSubnet2 = PrivateSubnet("Private Subnet")
                privateSubnet - Edge(color = "orange",label = "Private Service Acccess")-privateSubnet2
                vpn = VpnConnection("VPN")
                privateSubnet  - Edge(color = "orange",label = "Private Service Acccess") - vpn
                privateSubnet - Edge(style = "dotted") - cmptgrp
                privateSubnet2 - Edge(style = "dotted") - sbnet

# ---
        with Cluster("Cathay On Premise"):
            OnPremise = [
                Users("Internal Website"),
                Users("Batch Service"),
                Users("Local Storage")
            ]

# ---
            #Service Project
            clients>> Edge(color = "blue", label ="HTTPS")>>cldfrnt
            cldfrnt<< Edge(color = "blue", label = "HTTPS") >>elb
            elb>> Edge(color = "blue", label = "HTTPS")>>cmptgrp>> Edge(color = "blue", lable = "HTTPS")>>db
            cmptgrp >> Edge(color = "orange",xlabel = "Private Service Acccess") >>redisPrmy
            cmptgrp>> Edge(color = "blue", label ="HTTPS")>>postgresSQLPrmy
            cmptgrp>> Edge(color = "blue", label ="HTTPS")>>s3
            dns>> Edge(color = "blue", label = "HTTPS")>>elb
            #Host Project
            vpn >> Edge(color = "olive",xlabel = "IPsec") >> OnPremise
#prettify the output
#             redisRplc - Edge(penwidth="0") - cldwtchlgs
#             cldwtchlgs - Edge(penwidth="0") - iam
#             clients - Edge(penwidth="0") - dns
#             dns - Edge(penwidth="0") - cmptgrp