import { CfnOutput } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";
import { NodeLambda } from "../constructs/NodeLambda";

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
    method: HttpMethod
    entry: string
}

export interface LambdaApiProps {
    disambiguator: string
    name: string
    lambdaApiRoutes: LambdaApiRoute[]
}

export class LambdaApi extends Construct {
    readonly httpApi: HttpApi;
    constructor (scope: Construct, id: string, props: LambdaApiProps) {
        super(scope, id)

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

        for (const lambdaApiRoute of props.lambdaApiRoutes) {
            for (const methodHandler of lambdaApiRoute.methodHandlers) {
                const lambdaName = `${removeSlashes(lambdaApiRoute.path)}-${methodHandler.method}-${props.disambiguator}`
                const func = new NodeLambda(this, `LambdaApiHandler-${props.disambiguator}`, {
                    disambiguator: props.disambiguator,
                    handler: methodHandler.method,
                    name: `handler-${lambdaName}`,
                    entry: methodHandler.entry,
                })

                const lambdaIntegration = new HttpLambdaIntegration(`integration-${lambdaName}`, func.func)

                this.httpApi.addRoutes({
                    path: lambdaApiRoute.path,
                    methods: [ methodHandler.method ],
                    integration: lambdaIntegration,
                })
            }
        }

        new CfnOutput(this, `ApiGatwayEndpoint-${props.disambiguator}`, {
            value: this.httpApi.apiEndpoint
        })
    }
}
