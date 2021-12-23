export class Proposal {
    
    id: String;
    space: String;
    timestamp: number;

    public constructor(id: String, space: String, timestamp: number) {
        this.id = id;
        this.space = space;
        this.timestamp = timestamp;
    }

    public toInsertFormat(): any {
        return {
            'id' : {S: this.id},
            'snapshotSpace': {S: this.space},
            'publishedTimestamp': {N: this.timestamp.toString()}
        }
    }

};

export default Proposal;