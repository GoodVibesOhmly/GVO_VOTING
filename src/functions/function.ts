import { CloudFrontResponseResult, ScheduledEvent } from "aws-lambda";
import SecretsManager from "../configuration/SecretsManager";
import DuplicatorService from "../service/DuplicatorService";


export const lambdaHandler = async (event: ScheduledEvent): Promise<CloudFrontResponseResult> => {
  console.log("Starting.....");
  /* Get all the secrets into memory first */
  await SecretsManager.instance().fetchSecrets();
  const result = await DuplicatorService.instance().poll();
  return {
    status: '200',
    body: JSON.stringify(result)
  };
}