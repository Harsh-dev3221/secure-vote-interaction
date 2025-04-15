import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

interface Candidate {
    id: number;
    name: string;
    voteCount: string;
}

interface VoteReceipt {
    transactionHash: string;
    signature: string;
    token: string;
    expires: number;
}

const BlockchainVoting: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [aadharNumber, setAadharNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [securityCheckPassed, setSecurityCheckPassed] = useState(true);
    const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);
    const [verifyingVote, setVerifyingVote] = useState(false);
    const [voteVerified, setVoteVerified] = useState<boolean | null>(null);
    const { toast } = useToast();

    // Fetch candidates on component mount
    useEffect(() => {
        fetchCandidates();
    }, []);

    // Check for valid input
    const isValidAadhar = (aadhar: string): boolean => {
        return /^\d{12}$/.test(aadhar);
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/vote/candidates');
            const data = await response.json();
            if (data.success) {
                setCandidates(data.candidates);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch candidates",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to fetch candidates",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const checkIfVoted = async () => {
        if (!isValidAadhar(aadharNumber)) {
            setHasVoted(false);
            return false;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/vote/has-voted/${aadharNumber}`);

            // Handle rate limiting or security blocks
            if (response.status === 429 || response.status === 403) {
                setSecurityCheckPassed(false);
                toast({
                    title: "Security Alert",
                    description: "Security check failed or too many requests. Please try again later.",
                    variant: "destructive",
                });
                return false;
            }

            const data = await response.json();

            if (data.success) {
                setHasVoted(data.hasVoted);
                return data.hasVoted;
            } else {
                console.error("Error checking if voted:", data.error);
                return false;
            }
        } catch (error) {
            console.error("Error checking if voted:", error);
            return false;
        }
    };

    const handleAadharChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        setAadharNumber(value);

        // Reset security check
        setSecurityCheckPassed(true);

        // Only check if we have a complete Aadhar number
        if (value.length === 12) {
            await checkIfVoted();
        } else {
            setHasVoted(false);
        }
    };

    const handleVote = async (candidateId: number) => {
        if (!isValidAadhar(aadharNumber)) {
            toast({
                title: "Error",
                description: "Please enter a valid 12-digit Aadhar number",
                variant: "destructive",
            });
            return;
        }

        // Check if the voter has already voted
        const alreadyVoted = await checkIfVoted();
        if (alreadyVoted) {
            toast({
                title: "Error",
                description: "This Aadhar number has already been used to vote",
                variant: "destructive",
            });
            return;
        }

        // Security check
        if (!securityCheckPassed) {
            toast({
                title: "Security Alert",
                description: "Security verification failed. Please try again later.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/vote/cast-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidateId,
                    aadharNumber,
                }),
            });

            // Handle rate limiting or security blocks
            if (response.status === 429 || response.status === 403) {
                setSecurityCheckPassed(false);
                toast({
                    title: "Security Alert",
                    description: "Security check failed or too many requests. Please try again later.",
                    variant: "destructive",
                });
                return;
            }

            const data = await response.json();
            if (data.success) {
                // Store the vote receipt for verification
                setVoteReceipt({
                    transactionHash: data.transactionHash,
                    signature: data.signature,
                    token: data.token,
                    expires: data.expires
                });

                toast({
                    title: "Success",
                    description: "Vote cast successfully!",
                });

                // Refresh candidates list
                fetchCandidates();
                setHasVoted(true);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to cast vote",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to cast vote",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyVote = async () => {
        if (!voteReceipt) return;

        setVerifyingVote(true);
        try {
            const response = await fetch('http://localhost:3000/api/vote/verify-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    signature: voteReceipt.signature,
                    candidateId: candidates.find(c => c.id.toString() === localStorage.getItem('lastVotedCandidate'))?.id || 0,
                    aadharNumber,
                    timestamp: Date.now(),
                    token: voteReceipt.token,
                    expires: voteReceipt.expires
                }),
            });

            const data = await response.json();

            if (data.success) {
                setVoteVerified(data.verified);
                toast({
                    title: data.verified ? "Verification Successful" : "Verification Failed",
                    description: data.verified
                        ? "Your vote has been verified on the blockchain."
                        : "Vote verification failed. Please contact support.",
                    variant: data.verified ? "default" : "destructive",
                });
            } else {
                setVoteVerified(false);
                toast({
                    title: "Verification Failed",
                    description: data.error || "Could not verify your vote",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error verifying vote:", error);
            setVoteVerified(false);
            toast({
                title: "Verification Error",
                description: "Could not verify your vote due to a system error",
                variant: "destructive",
            });
        } finally {
            setVerifyingVote(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Secure Blockchain Voting System</h1>

            <div className="mb-6">
                <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        {securityCheckPassed ? (
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <h2 className="font-semibold">Security Verification</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your vote is secured using advanced cryptography and blockchain technology.
                        All transactions are verified and tamper-proof.
                    </p>

                    <Input
                        type="text"
                        placeholder="Enter 12-digit Aadhar Number"
                        value={aadharNumber}
                        onChange={handleAadharChange}
                        maxLength={12}
                        className="mb-2"
                    />

                    {hasVoted && (
                        <div className="text-red-500 text-sm mt-2">
                            This Aadhar number has already voted
                        </div>
                    )}

                    {!securityCheckPassed && (
                        <div className="bg-red-50 text-red-600 p-2 rounded mt-2 text-sm">
                            Security verification failed. Please try again later or contact support.
                        </div>
                    )}

                    {voteReceipt && (
                        <div className="mt-4 border border-green-200 bg-green-50 rounded-md p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-green-800">Vote Receipt</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={verifyVote}
                                    disabled={verifyingVote}
                                >
                                    {verifyingVote ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Verifying
                                        </>
                                    ) : (
                                        'Verify Vote'
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-green-700 break-all">
                                Transaction: {voteReceipt.transactionHash.substring(0, 10)}...
                            </p>
                            {voteVerified !== null && (
                                <div className={`mt-2 text-sm ${voteVerified ? 'text-green-600' : 'text-red-600'}`}>
                                    {voteVerified
                                        ? '✓ Vote verified successfully on blockchain'
                                        : '✗ Vote verification failed'
                                    }
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {loading && candidates.length === 0 ? (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.map((candidate) => (
                        <Card key={candidate.id} className={hasVoted ? 'opacity-60' : ''}>
                            <CardHeader>
                                <CardTitle>{candidate.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">Votes: {candidate.voteCount}</p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => {
                                        handleVote(candidate.id);
                                        // Store last voted candidate for verification
                                        localStorage.setItem('lastVotedCandidate', candidate.id.toString());
                                    }}
                                    disabled={loading || hasVoted || !isValidAadhar(aadharNumber) || !securityCheckPassed}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Casting Vote...
                                        </>
                                    ) : (
                                        'Vote'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlockchainVoting; 