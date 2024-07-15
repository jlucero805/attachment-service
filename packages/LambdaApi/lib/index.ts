import { CfnOutput } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";
import { NodeLambda } from "../constructs/NodeLambda";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { S3 } from "aws-cdk-lib/aws-ses-actions";

const removeSlashes = (route: string) => {
    let accumulator = "";
    for (const char of route) {
        if (char !== "/") {
            accumulator += char
        }
    }

    return accumulator
}

export interface LambdaApiRoute {
    path: string
    methodHandlers: LambdaMethodHandler[]
}

export interface LambdaMethodHandler {
    methods: HttpMethod[]
    entry: string
}

export interface LambdaApiProps {
    disambiguator: string
    name: string
    lambdaApiRoutes: LambdaApiRoute[]
    globalEnvironmentVariables?: Record<string, string>
}

export class LambdaApi extends Construct {
    readonly httpApi: HttpApi;
    readonly lambdaRole: Role;

    constructor (scope: Construct, id: string, props: LambdaApiProps) {
        super(scope, id)

        this.lambdaRole = new Role(this, `LambdaApiRole-${props.disambiguator}`, {
            assumedBy: new ServicePrincipal("lambda.amazonaws.com")
        })

        this.httpApi = new HttpApi(this, `LambdaApi-${props.disambiguator}`, {
            apiName: `${props.name}-${props.disambiguator}`,
            corsPreflight: {
                allowMethods: [
                    CorsHttpMethod.GET,
                    CorsHttpMethod.POST,
                    CorsHttpMethod.PUT,
                    CorsHttpMethod.DELETE,
                    CorsHttpMethod.PATCH,
                ],
                allowOrigins: ["*"],
            }
        });

        const globalEnvironmentVariables = props.globalEnvironmentVariables ?? {};

        for (const lambdaApiRoute of props.lambdaApiRoutes) {
            for (const methodHandler of lambdaApiRoute.methodHandlers) {
                for (const method of methodHandler.methods) {
                    const lambdaName = `${removeSlashes(lambdaApiRoute.path)}-${method}-${props.disambiguator}`
                    const func = new NodeLambda(this, `LambdaApiHandler-${props.disambiguator}`, {
                        disambiguator: props.disambiguator,
                        handler: "index." + method,
                        name: `handler-${lambdaName}`,
                        entry: methodHandler.entry,
                        environmentVariables: globalEnvironmentVariables,
                        role: this.lambdaRole,
                    })

                    const lambdaIntegration = new HttpLambdaIntegration(`integration-${lambdaName}`, func.func)

                    this.httpApi.addRoutes({
                        path: lambdaApiRoute.path,
                        methods: [ method ],
                        integration: lambdaIntegration,
                    })
                }
            }
        }

        new CfnOutput(this, `ApiGatwayEndpoint-${props.disambiguator}`, {
            value: this.httpApi.apiEndpoint
        })
    }
}
