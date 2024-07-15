import { Role } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs";

export interface NodeLambdaProps {
    disambiguator: string
    handler: string
    name: string
    entry: string
    role?: Role
    environmentVariables?: Record<string, string>
}

export class NodeLambda extends Construct {
    readonly func: lambda.Function;

    constructor(scope: Construct, id: string, props: NodeLambdaProps) {
        super(scope, id)

        const environment = props.environmentVariables ?? {};

        this.func = new lambda.Function(this, `NodeLambda-${props.disambiguator}`, {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: props.handler,
            code: lambda.Code.fromAsset(props.entry),
            functionName: `${props.name}-${props.disambiguator}`,
            environment: environment,
            ...(props.role ? { role: props.role } : {} ),
        });
    }
} 
