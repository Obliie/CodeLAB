import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemRequest } from '@/protobufs/services/v1/problem_service_pb';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import Box from '@mui/material/Box';

async function GetProblem(): Promise<string> {
    const client = createPromiseClient(
        ProblemService,
        createGrpcWebTransport({
            baseUrl: 'http://0.0.0.0:8080/',
        }),
    );

    const problem = await client.getProblemById(
        new GetProblemRequest({
            problemId: 1,
        }),
    );

    return problem.problem?.title ?? '';
}

export default function HomePage() {
    return (
        <Box sx={{ display: 'flex' }}>
            <div>CONTENT</div>
        </Box>
    );
}
