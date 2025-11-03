export interface ExpertiseRequest {
    requestId: string;
    requestingAgent: string;
    topic: string;
    question: string;
    priority: string;
    timestamp: number;
}

export interface ExpertiseResponse {
    requestId: string;
    respondingAgent: string;
    answer: any;
    confidence: number;
    timestamp: number;
}

export function requestExpertise(
    requestingAgent: string,
    topic: string,
    question: string,
    targetAgents?: string[]
): Promise<ExpertiseRequest>;

export function submitExpertiseResponse(
    requestId: string,
    respondingAgent: string,
    answer: any,
    confidence: number
): Promise<ExpertiseResponse>;

declare const agentCoordinationProtocol: {
    requestExpertise: typeof requestExpertise;
    submitExpertiseResponse: typeof submitExpertiseResponse;
};

export default agentCoordinationProtocol; 