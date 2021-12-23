import * as AWS from "aws-sdk";

interface Secrets {
    privateKey: string,
    discordToken: string
}

export class SecretsManager {

    private static singleton: SecretsManager;
    private static secretId: string = 'prod/SnapshotDup';

    private client: AWS.SecretsManager;
    private secrets?: Secrets = undefined;
    
    private constructor() {
        this.client = new AWS.SecretsManager({
            region: process.env.AWS_REGION,
        });
    }

    public static instance() {
        if(!this.singleton){
            this.singleton = new SecretsManager();
        }
        return this.singleton;
    }

    public async fetchSecrets(): Promise<Secrets>  {
        if (this.secrets == undefined) {
            this.secrets = JSON.parse((await this.client.getSecretValue({SecretId: SecretsManager.secretId}).promise()).SecretString!);
        }
        return this.secrets!;
    }

    public getSecrets(): Secrets {
        return this.secrets!;
    }

}

export default SecretsManager;