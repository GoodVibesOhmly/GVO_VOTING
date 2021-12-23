import * as AWS from "aws-sdk";
import Proposal from "../data/Proposal"

class ProposalRepository {

    private static singleton: ProposalRepository;
    private dynamodb: AWS.DynamoDB;

    private constructor() {
        AWS.config.update({
            region: process.env.AWS_REGION || 'local'
        });
        this.dynamodb = new AWS.DynamoDB();
    }

    public static instance(): ProposalRepository {
        if (!this.singleton) {
            this.singleton = new ProposalRepository();
        }
        return this.singleton;
    }

    public async getAll(space: string) : Promise<Proposal[]> {
        const query = {
            TableName: 'snapshots',
            ScanIndexForward: false, /* DESC sort */
            KeyConditionExpression: 'snapshotSpace = :snapshotSpace',
            ExpressionAttributeValues: {
                ':snapshotSpace' : {S: space}
            }
        }
        const response : AWS.DynamoDB.Types.QueryOutput = await this.dynamodb
            .query(query, (err, data) =>  this.logErrors('Failed to Query snapshots', err))
            .promise();

        return response.Items?.map((item) => {
            return new Proposal(
                item['id'].S!,
                item['snapshotSpace'].S!,
                Number(item['publishedTimestamp'].N!)
            )
        }) || [];
    } 

    public async getLatestSnapshotForSpace(space: string) : Promise<Proposal> {
        const query = {
            TableName: 'snapshots',
            Limit: 1, /* Get only the latest */ 
            ScanIndexForward: false, /* DESC sort */
            KeyConditionExpression: 'snapshotSpace = :snapshotSpace',
            ExpressionAttributeValues: {
                ':snapshotSpace' : {S: space}
            }
        }
        const response : AWS.DynamoDB.Types.QueryOutput = await this.dynamodb
            .query(query, (err, data) =>  this.logErrors('Failed to Query snapshots', err))
            .promise();
        const results: Proposal[] =  response.Items?.map((item) => {
            return new Proposal(
                item['id'].S!,
                item['snapshotSpace'].S!,
                Number(item['publishedTimestamp'].N!)
            )
        }) || [];
        return results[0]
    } 

    public async storeProposal(snapshot : Proposal) : Promise<Proposal> {
        await this.dynamodb.putItem({
            TableName: 'snapshots',
            Item: snapshot.toInsertFormat()
        }, (err, data) =>  {
            console.log(JSON.stringify(data));
            this.logErrors(`Failed to insert snapshot with id ${snapshot.id}`, err)
        }).promise();
        return snapshot;
    }

    private logErrors(message:String,err: any) {
        if (err) {
            console.log(message, err)
        }
    }

}

export default ProposalRepository;