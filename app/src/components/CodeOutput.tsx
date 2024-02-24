import { transport, useClient } from '@/lib/connect';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { SolutionFile, SolutionFileType } from '@/protobufs/common/v1/solution_pb';
import { SubmissionStatus } from '@/protobufs/common/v1/status_pb';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import { StatusService } from '@/protobufs/services/v1/status_service_connect';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { SubmissionStatusEvent, SubmitCodeResponse } from '@/protobufs/services/v1/submission_service_pb';
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
    statusService: PromiseClient<typeof StatusService>,
    problem: Problem,
    language: ProgrammingLanguage
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
        userId: userId ?? "none",
        language: language
    }) as SubmitCodeResponse;
    setData([`Submission sent. ID: ${submissionResponse.submissionId}`, "======"])

    for await (const response of statusService.subscribeStatusEvents({
        eventGroup: submissionResponse.submissionId,
        requestAll: true
    })) {
        const event = SubmissionStatusEvent.fromJsonString(response.event)
        switch(event.state) {
            case SubmissionStatus.RECEIVED:
                setData((oldData: string[]) => [...oldData, `SUBMISSION_STATUS_RECEIVED`]);
                continue
            case SubmissionStatus.COMPILING:
                setData((oldData: string[]) => [...oldData, `SUBMISSION_STATUS_COMPILING`]);
                continue
            case SubmissionStatus.EXECUTING:
                setData((oldData: string[]) => [...oldData, `SUBMISSION_STATUS_EXECUTING: TestID ${event.result.testId}, Passed: ${event.result.passed}, Output: ${event.result.output}`]);
                continue
            case SubmissionStatus.COMPLETE_PASS:
                setData((oldData: string[]) => [...oldData, `SUBMISSION_STATUS_COMPLETE_PASS`]);
                break
            case SubmissionStatus.COMPLETE_FAIL:
                setData((oldData: string[]) => [...oldData, `SUBMISSION_STATUS_COMPLETE_FAIL`]);
                break
        }
        
    }
}

export default function CodeOutput({ code, language, problem }: { code: string, language: ProgrammingLanguage, problem: Problem }) {
    const [data, setData] = useState<string[]>([]);
    const submissionService: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const statusService: PromiseClient<typeof StatusService> = useClient(StatusService);
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
                    onClick={() => onCodeSubmit(session?.user.id, code, data, setData, submissionService, statusService, problem, language)}>
                    Submit
                </Button>
            </CardActions>
        </Card>
    );
}
