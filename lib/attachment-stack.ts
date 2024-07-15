import * as cdk from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LambdaApi } from 'lambda_api/lib';
import { join } from 'path';

export interface AttachmentStackProps extends cdk.StackProps {
    disambiguator: string;
}

export class AttachmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AttachmentStackProps) {
    super(scope, id, props);

    const assetBucket = new Bucket(this, `AssetBucket-${props.disambiguator}`, {
        cors: [
            {
                allowedOrigins: ["*"],
                allowedMethods: [
                    HttpMethods.GET,
                    HttpMethods.DELETE,
                    HttpMethods.POST,
                    HttpMethods.PUT,
                ],
                allowedHeaders: [ "*" ],
                exposedHeaders: [],
                maxAge: 3000,
            }
        ]
    })

    const getLambda = (name: string) => join(__dirname, "..", "dist", name)

    const lambdaApi = new LambdaApi(this, `AttachmentLambdaApi-${props?.disambiguator}`, {
        disambiguator: props?.disambiguator,
        name: "AttachmentApi",
        globalEnvironmentVariables: {

        },
        lambdaApiRoutes: [
            {
                path: "/test",
                methodHandlers: [
                    { methods: [ HttpMethod.GET ], entry: getLambda("test") },
                ],
            },
            {
                path: "/asset",
                methodHandlers: [
                    { methods: [HttpMethod.POST], entry: getLambda("asset") }
                ],
            }
        ],
    })

  }
}
