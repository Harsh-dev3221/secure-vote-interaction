import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ExternalLink, Fingerprint } from "lucide-react";
import { ganacheService } from '@/services/ganacheService';

interface Candidate {
    id: number;
    name: string;
    voteCount: string;
}

const HardhatVoting: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [aadharNumber, setAadharNumber] = useState('');
    const [aadharError, setAadharError] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [contractAddress, setContractAddress] = useState<string>('');
    const [blockNumber, setBlockNumber] = useState<number | null>(null);
    const { toast } = useToast();

    // On component mount, initialize
    useEffect(() => {
        initializeAndLoadCandidates();
    }, []);

    const initializeAndLoadCandidates = async () => {
        try {
            setLoading(true);
            // Initialize connection to Ganache
            const initialized = await ganacheService.initialize();

            if (!initialized) {
                toast({
                    title: "Connection Error",
                    description: "Failed to connect to Ganache. Make sure it's running at http://127.0.0.1:7545",
                    variant: "destructive",
                });
                return;
            }

            // Load candidates
            const candidatesList = await ganacheService.getCandidates();
            setCandidates(candidatesList);
        } catch (error: any) {
            console.error("Failed to initialize contract:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to connect to blockchain",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Validate Aadhar number format
    const validateAadhar = (value: string): boolean => {
        if (!/^\d{12}$/.test(value)) {
            setAadharError("Aadhar number must be 12 digits");
            return false;
        }
        setAadharError(null);
        return true;
    };

    // Handle Aadhar number input
    const handleAadharChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        setAadharNumber(value);

        // Reset error
        if (value.length !== 12) {
            setAadharError(null);
            setHasVoted(false);
            return;
        }

        // Validate format
        if (!validateAadhar(value)) {
            return;
        }

        // Check if this Aadhar has already voted
        try {
            const voted = await ganacheService.hasVoted(value);
            setHasVoted(voted);

            if (voted) {
                toast({
                    title: "Already Voted",
                    description: "This Aadhar number has already been used to vote",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to check voting status:", error);
        }
    };

    const handleSelectCandidate = (id: number) => {
        setSelectedCandidate(id);
    };

    const handleVote = async () => {
        // If no candidate is selected, select the first one automatically
        if (selectedCandidate === null && candidates.length > 0) {
            setSelectedCandidate(candidates[0].id);
        }

        if (!aadharNumber || aadharNumber.length !== 12) {
            toast({
                title: "Error",
                description: "Please enter a valid 12-digit Aadhar number",
                variant: "destructive",
            });
            return;
        }

        if (hasVoted) {
            toast({
                title: "Error",
                description: "This Aadhar number has already been used to vote",
                variant: "destructive",
            });
            return;
        }

        try {
            setVoting(true);
            const result = await ganacheService.castVote(selectedCandidate, aadharNumber);

            if (result.success) {
                setTransactionHash(result.transactionHash || null);
                setBlockNumber(result.blockNumber || null);
                setHasVoted(true);

                // Refresh candidate list to show updated vote counts
                const updatedCandidates = await ganacheService.getCandidates();
                setCandidates(updatedCandidates);

                toast({
                    title: "Vote Successful",
                    description: "Your vote has been recorded on the blockchain",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to cast vote",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Failed to vote:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to cast vote",
                variant: "destructive",
            });
        } finally {
            setVoting(false);
        }
    };

    const updateContractAddress = () => {
        if (!contractAddress) {
            toast({
                title: "Error",
                description: "Please enter a contract address",
                variant: "destructive",
            });
            return;
        }

        ganacheService.setContractAddress(contractAddress);
        toast({
            title: "Contract Updated",
            description: "Contract address has been updated",
        });

        // Reinitialize with the new address
        initializeAndLoadCandidates();
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Secure Blockchain Voting System</CardTitle>
                    <p className="text-muted-foreground mt-2">Powered by Ganache Blockchain</p>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="flex justify-center my-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Fingerprint className="h-6 w-6 text-blue-500" />
                                    <h2 className="text-lg font-semibold">Aadhar Authentication</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="aadhar">Enter your 12-digit Aadhar number</Label>
                                        <Input
                                            id="aadhar"
                                            type="text"
                                            placeholder="XXXX XXXX XXXX"
                                            value={aadharNumber}
                                            onChange={handleAadharChange}
                                            maxLength={12}
                                            className={aadharError ? "border-red-500" : ""}
                                        />
                                        {aadharError && (
                                            <p className="text-sm text-red-500">{aadharError}</p>
                                        )}
                                    </div>

                                    {aadharNumber.length === 12 && !aadharError && (
                                        <div className="flex items-center gap-2">
                                            {hasVoted ? (
                                                <div className="flex items-center text-amber-600">
                                                    <ShieldCheck className="h-5 w-5 mr-2" />
                                                    <span>This Aadhar number has already been used to vote</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-green-600">
                                                    <ShieldCheck className="h-5 w-5 mr-2" />
                                                    <span>Aadhar verified - Ready to vote</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Candidate selection is hidden in your screenshot, so we'll hide it by default */}
                            {selectedCandidate === null && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {candidates.map((candidate) => (
                                        <Card
                                            key={candidate.id}
                                            className={`cursor-pointer transition-colors ${selectedCandidate === candidate.id
                                                ? 'border-2 border-primary'
                                                : 'border border-border'
                                                }`}
                                            onClick={() => handleSelectCandidate(candidate.id)}
                                        >
                                            <CardContent className="p-4">
                                                <h3 className="font-medium">{candidate.name}</h3>
                                                <p className="text-sm text-muted-foreground">Votes: {candidate.voteCount}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleVote}
                                    disabled={!aadharNumber || aadharNumber.length !== 12 || !!aadharError || hasVoted || voting}
                                    className="gap-2 bg-blue-500 hover:bg-blue-600"
                                >
                                    {voting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {voting ? 'Submitting Vote...' : 'Cast Vote'}
                                </Button>
                            </div>

                            {transactionHash && (
                                <div className="mt-6 border border-border rounded-md p-4">
                                    <div className="flex items-center gap-2 text-green-600 mb-4">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="font-medium">Vote Successfully Recorded on Blockchain</span>
                                    </div>

                                    <p className="font-medium mb-2">Transaction Details:</p>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Transaction Hash:</span>
                                            <div className="font-mono break-all">{transactionHash}</div>
                                        </div>

                                        {blockNumber && (
                                            <div>
                                                <span className="font-semibold">Block Number:</span>
                                                <div className="font-mono">{blockNumber}</div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <a
                                                href={`http://localhost:7545/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                                title="View in Ganache"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                <span>View Transaction Details</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default HardhatVoting;
