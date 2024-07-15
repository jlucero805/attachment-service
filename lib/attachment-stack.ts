import * as cdk from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';
import { LambdaApi } from 'lambda_api/lib';
import { join } from 'path';

export interface AttachmentStackProps extends cdk.StackProps {
    disambiguator: string;
}

export class AttachmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AttachmentStackProps) {
    super(scope, id, props);

    const lambdaApi = new LambdaApi(this, `AttachmentLambdaApi-${props?.disambiguator}`, {
        disambiguator: props?.disambiguator,
        name: "AttachmentApi",
        lambdaApiRoutes: [
            {
                path: "/ping",
                methodHandlers: [
                    { method: HttpMethod.GET, entry: join(__dirname, "..", "dist", "ping") },
                ],
            }
        ]
    })

  }
}
