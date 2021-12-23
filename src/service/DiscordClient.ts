import {Client, Intents, TextChannel} from 'discord.js'
import config from '../configuration/ApplicationConfig'
import SecretsManager from '../configuration/SecretsManager';


export class DiscordClient {

    private static singleton: DiscordClient;
    private client: Client;

    private constructor() {
        this.client = new Client();
        this.client.login(SecretsManager.instance().getSecrets().discordToken);
    }

    public static instance(): DiscordClient {
        if (!this.singleton) {
            this.singleton = new DiscordClient();
        }
        return this.singleton;
    }

    public newMessage(message: string): void {
        this.client
        .channels
        .fetch(config.discordChannelId)
        .then(chanel => (chanel as TextChannel).send(message));
    }

}

export default DiscordClient;