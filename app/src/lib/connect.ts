import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemRequest, Problem } from '@/protobufs/services/v1/problem_service_pb';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

const transport = createGrpcWebTransport({
    baseUrl: 'http://0.0.0.0:8080/',
});

export async function getProblems(): Promise<Problem[]> {
    const client = createPromiseClient(ProblemService, transport);

    const problem = await client.getProblemById(
        new GetProblemRequest({
            problemId: 1,
        }),
    );

    if (!problem.problem) {
        throw new Error();
    }

    return [problem.problem];
}
