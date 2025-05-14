// A simple mock blockchain gateway implementation
// Browser-compatible version

export class BlockchainGateway {
    private static instance: BlockchainGateway;
    private contract: any;

    private constructor() {
        // Mock implementation for development
        console.log('Creating mock blockchain gateway for browser');
    }

    public static getInstance(): BlockchainGateway {
        if (!BlockchainGateway.instance) {
            BlockchainGateway.instance = new BlockchainGateway();
        }
        return BlockchainGateway.instance;
    }

    public async getContract(): Promise<any> {
        if (!this.contract) {
            // Return a mock contract with basic functions
            this.contract = {
                submitTransaction: async (name: string, ...args: any[]) => {
                    console.log(`Mock contract call: ${name}`, args);
                    return { success: true, hash: `0x${Math.random().toString(16).substring(2, 42)}` };
                },
                evaluateTransaction: async (name: string, ...args: any[]) => {
                    console.log(`Mock contract evaluation: ${name}`, args);
                    return JSON.stringify({ result: "Mock data" });
                }
            };
        }
        return this.contract;
    }

    public async disconnect(): Promise<void> {
        console.log('Disconnecting mock blockchain gateway');
        // Nothing to do for mock implementation
    }
}