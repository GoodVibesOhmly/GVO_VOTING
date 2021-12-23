import ProposalRepository from "../persistence/ProposalRepository";
import DiscordClient from "./DiscordClient";
import SnaphsotClient, { SnapshotProposal } from "./SnapshotClient";
import config from "../configuration/ApplicationConfig";
import Proposal from "../data/Proposal";

export class DuplicatorService {

    private static singleton: DuplicatorService;

    private repo: ProposalRepository;
    private client: SnaphsotClient;
    private discordClient: DiscordClient;

    private constructor() {
        this.repo = ProposalRepository.instance();
        this.client = SnaphsotClient.instance();
        this.discordClient = DiscordClient.instance();
    }

    public static instance(): DuplicatorService {
        if (!this.singleton) {
            this.singleton = new DuplicatorService();
        }
        return this.singleton;
    }

    public async poll(): Promise<Map<string,string[]>> {
        
        const result: Map<string,string[]> = new Map();
        for (let [space, spaceConfig] of config.spaces) {
            const spaceResult = await this.pollSpace(space);
            result.set(space, spaceResult);
        }
        return result;
    }

    private pollSpace(space: string): Promise<string[]> {
        return this.repo.getLatestSnapshotForSpace(space) /* Get the latest stored proposal for this space */
        .then(latest => this.client.getLatestProposals(space, latest?.timestamp || this.epochSeconds())) /* Get all the proposals published after the latest in the DB */
        .then(fetched => fetched.proposals.filter(proposal => proposal.end > this.epochSeconds())) /* Filter out the already expired ones */
        .then(proposals => proposals.filter(proposal => config.spaces.get(space)?.filter(proposal))) /* Filter out proposals based on configured rules */
        .then(proposals => this.processNewProposals(space, proposals)) /* Process the new proposals */
    }
    
    private async processNewProposals( space: string, proposals: SnapshotProposal[]): Promise<string[]> {
        const fetched = [];
        for (const proposal of proposals) {
            console.log(`Processing proposal [sourceId: ${proposal.id}] [space: ${space}]`);
            try {
                /*1 create proposal on snapshot*/
                const newProposalId = await this.client.createProposal(proposal, space);
                console.log(`Duplicate proposal created [newId: ${newProposalId}] [sourceId: ${proposal.id}] [space: ${space}]`);
    
                /*2 update bd in case of success*/
                await this.repo.storeProposal(new Proposal(proposal.id, space, Number(proposal.created)))
                console.log(`Proposal Stored in database [newId: ${newProposalId}] [sourceId: ${proposal.id}] [space: ${space}]`);
    
                /*3 send discord message*/    
                await this.discordClient.newMessage(`New proposal was just published for space ${space}\nCheck it out in: https://snapshot.org/#/${config.spaces.get(space)?.destination || config.snapshotConfig.space}/proposal/${newProposalId}`);
                console.log(`Notified users in discord [newId: ${newProposalId}] [sourceId: ${proposal.id}] [space: ${space}]`);

                fetched.push(newProposalId);
            } catch(e : unknown) {
                console.error(`Error when processing proposal [sourceId: ${proposal.id}]`, e);
                return []; /* If we fail to process any snapshot in the list we have then we must stop processing emmidiatly to avoid gaps */
            }
        }
        return fetched;
    }

    private epochSeconds(): number {
        return Math.floor(Date.now() / 1000);
    }

}

export default DuplicatorService;