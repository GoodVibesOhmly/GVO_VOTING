import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
import AccountProvider from './AccountProvider';
import config from '../configuration/ApplicationConfig';

interface Response {
    proposals : SnapshotProposal[]
}

export interface SnapshotProposal {
    id: string,
    type: string,
    title: string,
    body: string,
    start: number,
    end: number,
    created: number,
    choices: string[],
    snapshot: number,
    link: string
}

export class SnaphsotClient {

    private static singleton: SnaphsotClient;
    private client;

    private constructor() {
        this.client = new snapshot.Client712('https://hub.snapshot.org');
    }

    public static instance(): SnaphsotClient {
        if (!this.singleton) {
            this.singleton = new SnaphsotClient();
        }
        return this.singleton;
    }

    public  async getLatestProposals(space: string, latest: number): Promise<Response> {
        return axios('https://hub.snapshot.org/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            data: {
                query: `query Proposal { proposals(orderBy:"start", where:{space:"${space}",created_gt:${latest}}){id,type,title,body,start,end,created,choices,snapshot,link}}`,
                variables: null,
                operationName:'Proposal'
            }
          })
          .then(r => r.data.data)
          .then(data => data as Response);
    }

    /*
        Creates the proposal on snapshot and returns the created proposal id.
    */
    public async createProposal(proposal: SnapshotProposal, space: string) {
        const account = AccountProvider.instance().getAccount();
        const address = await account.getAddress();
        const block = await AccountProvider.instance().getBlock();
        const newProposal = {
            space: config.spaces.get(space)?.destination || config.snapshotConfig.space,
            type: proposal.type,
            title: this.formatTitle(proposal, space),
            body: this.formatBody(proposal),
            choices: proposal.choices,
            start: proposal.start,
            end: this.getEndDate(proposal, space),
            network: config.snapshotConfig.network,
            strategies: JSON.stringify(config.snapshotConfig.strategies),
            plugins: JSON.stringify(config.snapshotConfig.plugins),
            metadata: JSON.stringify(config.snapshotConfig.metadata),
            snapshot: block,
        };
        const response: any = await this.client.proposal( account, address, newProposal).catch(error => console.error('Error while creating new snapshot.',error));
        return response.id;
    }

    private getEndDate(proposal: SnapshotProposal, space: string) {
        return proposal.end - (config.spaces.get(space)?.voteClose || 0);
    }

    private formatTitle(proposal: SnapshotProposal, space: string) {
        return `[EXTERNAL][${config.spaces.get(space)?.name}] ${proposal.title}`;
    }

    private formatBody(proposal: SnapshotProposal) {
        return `${proposal.body}\n\n\nOriginal proposal: ${proposal.link}`;
    }

}

export default SnaphsotClient;