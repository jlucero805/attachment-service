import { APIGatewayProxyHandler } from "aws-lambda";

export const GET: APIGatewayProxyHandler = async (event) => {
    console.log(event)
    return {
        statusCode: 200,
        body: JSON.stringify(event),
    }
}
