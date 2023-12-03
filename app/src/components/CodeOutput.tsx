import { transport, useClient } from '@/lib/connect';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { SolutionFile, SolutionFileType } from '@/protobufs/common/v1/solution_pb';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { SubmitCodeResponse } from '@/protobufs/services/v1/submission_service_pb';
import { PromiseClient, createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

async function onCodeSubmit(
    userId: string | undefined,
    code: string,
    data: string[],
    setData: Function,
    submissionService: PromiseClient<typeof SubmissionService>,
    problem: Problem,
) {
    const mainFile: SolutionFile = new SolutionFile();
    mainFile.entry = true;
    mainFile.path = 'main.py';

    const encoder = new TextEncoder();
    mainFile.data = encoder.encode(code);

    setData([]);
    const submissionResponse = await submissionService.submitCode({
        files: [mainFile],
        problemId: problem.id,
        userId: userId ?? "none"
    }) as SubmitCodeResponse;
    setData([`SUBMISSION SENT WITH ID: ${submissionResponse.submissionId}`])
    /*
    for await (const response of submissionService.submitCode({
        files: [mainFile],
        tests: problem.tests
    })) {
        if (response.stderr) {
            setData((oldData: string[]) => [...oldData, `${response.stderr}. Output: ${response.stdout}`]);
        } else {
            setData((oldData: string[]) => [...oldData, `${response.stdout}`]);
        }
    }*/
}

export default function CodeOutput({ code, problem }: { code: string, problem: Problem }) {
    const [data, setData] = useState<string[]>([]);
    const submissionService: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const { data: session } = useSession();

    return (
        <Card
            sx={{
                width: '35vw',
                height: '20vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Output
                </Typography>
                {data.map(data => {
                    return (
                        <Typography variant="body2" color="text.secondary" display="block" key="">
                            {data}
                        </Typography>
                    );
                })}
            </CardContent>

            <CardActions sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button
                    sx={{ margin: '0px 10px', marginBottom: '10px' }}
                    variant="outlined"
                    onClick={() => onCodeSubmit(session?.user.id, code, data, setData, submissionService, problem)}>
                    Submit
                </Button>
            </CardActions>
        </Card>
    );
}
