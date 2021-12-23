import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import SecretsManager from "../configuration/SecretsManager";
import DuplicatorService from "../service/DuplicatorService";


export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Starting.....");
  /* Get all the secrets into memory first */
  await SecretsManager.instance().fetchSecrets();
  const result = await DuplicatorService.instance().poll();
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}