import { ethers, Wallet } from 'ethers'
import SecretsManager from '../configuration/SecretsManager';
/*
    This class requires some security concerns when being used since it access a private key in memory.
    Please be careful when using it.
*/
export class AccountProvider {

    private account: Wallet;
    private provider;
    private static singleton: AccountProvider;

    private constructor() {
        const pk = SecretsManager.instance().getSecrets().privateKey;
        this.provider = ethers.providers.getDefaultProvider();
        this.account = new ethers.Wallet(pk, this.provider); /* Ethereum mainnet provider */
    }

    public static instance() {
        if (!this.singleton){
            this.singleton = new AccountProvider();
        }
        return this.singleton;
    }

    public getAccount(): Wallet {
        return this.account;
    }

    public async getBlock(): Promise<number> {
        return this.provider.getBlockNumber();
    }

}

export default AccountProvider;