import { BlockchainGateway } from './gateway';

export class BlockchainService {
    private static instance: BlockchainService;
    private gateway: BlockchainGateway;
    private contract: any;

    private constructor() {
        this.gateway = BlockchainGateway.getInstance();
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    public async initialize(): Promise<void> {
        try {
            this.contract = await this.gateway.getContract();
            console.log('Blockchain service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error);
            throw error;
        }
    }

    public async createVote(voteId: string, title: string, options: string[]): Promise<void> {
        try {
            await this.contract.submitTransaction('CreateVote', voteId, title, JSON.stringify(options));
        } catch (error) {
            console.error('Failed to create vote:', error);
            throw error;
        }
    }

    public async castVote(voteId: string, option: string): Promise<void> {
        try {
            await this.contract.submitTransaction('CastVote', voteId, option);
        } catch (error) {
            console.error('Failed to cast vote:', error);
            throw error;
        }
    }

    public async getVoteResults(voteId: string): Promise<any> {
        try {
            const result = await this.contract.evaluateTransaction('GetVoteResults', voteId);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error('Failed to get vote results:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        await this.gateway.disconnect();
    }
} 