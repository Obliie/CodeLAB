import { useClient } from '@/lib/connect';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { SolutionFile } from '@/protobufs/common/v1/solution_pb';
import { SubmissionStatus } from '@/protobufs/common/v1/status_pb';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import { StatusService } from '@/protobufs/services/v1/status_service_connect';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import {
    SubmissionStatusEvent,
    SubmissionTestResult,
    SubmitCodeResponse,
} from '@/protobufs/services/v1/submission_service_pb';
import { PromiseClient } from '@connectrpc/connect';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LinearProgress, Box } from '@mui/material';

function getMainFileName(language: ProgrammingLanguage) {
    switch (language) {
        case ProgrammingLanguage.PYTHON:
            return 'main.py';
        case ProgrammingLanguage.PROLOG:
            return 'main.pl';
    }

    return 'main';
}

function getProgressColor(state: SubmissionStatus): string {
    const colorMap: { [key in SubmissionStatus]: string } = {
        [SubmissionStatus.UNSPECIFIED]: 'inherit',
        [SubmissionStatus.RECEIVED]: 'primary',
        [SubmissionStatus.COMPILING]: 'secondary',
        [SubmissionStatus.EXECUTING]: 'success',
        [SubmissionStatus.COMPLETE_PASS]: 'info',
        [SubmissionStatus.COMPLETE_FAIL]: 'error',
        [SubmissionStatus.COMPLETE_TIMEOUT]: 'warning',
    };
    return colorMap[state];
}

function StateProgress({ state, progress }: { state: SubmissionStatus; progress: number }) {
    const stateLabel = state !== SubmissionStatus.UNSPECIFIED ? SubmissionStatus[state].replace('SUBMISSION_STATUS_', '').replace(/_/g, ' ') : "";
    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            <Typography variant="h6">{stateLabel}</Typography>
            <LinearProgress variant="determinate" value={progress} color={getProgressColor(state)} />
        </Box>
    );
}

function ExecutionDetails({ result }: { result: SubmissionTestResult }) {
    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="body2">Test ID: {result.testId}</Typography>
                <Typography variant="body2">Passed: {result.passed ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2">Output: {result.output}</Typography>
                <Typography variant="body2">Runtime: {result.runtime * 1000}ms</Typography>
            </CardContent>
        </Card>
    );
}

function ProgressComponent({ streamData, testCount }: { streamData: SubmissionStatusEvent[], testCount: number }) {
    const [currentState, setCurrentState] = useState<SubmissionStatus>(SubmissionStatus.UNSPECIFIED);
    const [executions, setExecutions] = useState<SubmissionTestResult[]>([]);

    useEffect(() => {
        if (streamData.length == 0) {
            setCurrentState(SubmissionStatus.UNSPECIFIED);
            setExecutions([]);
        }

        streamData.forEach(event => {
            if (event.state !== undefined) {
                setCurrentState(event.state);
            }

            if (event.state === SubmissionStatus.EXECUTING && event.result) {
                setExecutions(execs => {
                    const exists = execs.some(exec => exec.testId === event.result!.testId);
                    return exists ? execs : [...execs, event.result!];
                });
            }
        });

        const lastEvent = streamData[streamData.length - 1];
        if (lastEvent) {
            setCurrentState(lastEvent.state);
        }
    }, [streamData]);

    var progress = 0;
    switch(currentState) {
        case SubmissionStatus.RECEIVED:
            progress = 20;
            break;
        case SubmissionStatus.EXECUTING:
            // 60% dedicated to execution
            progress = 20 + (executions.length / testCount * 60)
            break;
        case SubmissionStatus.COMPLETE_FAIL:
        case SubmissionStatus.COMPLETE_PASS:
        case SubmissionStatus.COMPLETE_TIMEOUT:
            progress = 100;
            break;
    }

    return (
        <Box>
            <StateProgress state={currentState} progress={progress} />
            <Box sx={{
                maxHeight: '200px',
                overflowY: 'auto',
            }}>
                {(currentState === SubmissionStatus.EXECUTING ||
                    currentState === SubmissionStatus.COMPLETE_PASS ||
                    currentState === SubmissionStatus.COMPLETE_FAIL ||
                    currentState === SubmissionStatus.COMPLETE_TIMEOUT) &&
                    executions.map((exec, index) => (
                        <ExecutionDetails key={index} result={exec} />
                ))}
            </Box>
        </Box>
    );
}

async function onCodeSubmit(
    userId: string | undefined,
    code: string,
    data: SubmissionStatusEvent[],
    setData: Function,
    submissionService: PromiseClient<typeof SubmissionService>,
    statusService: PromiseClient<typeof StatusService>,
    problem: Problem,
    language: ProgrammingLanguage,
    setSubmitLoading: Function,
) {
    setSubmitLoading(true);
    const mainFile: SolutionFile = new SolutionFile();
    mainFile.entry = true;
    mainFile.path = getMainFileName(language);

    const encoder = new TextEncoder();
    mainFile.data = encoder.encode(code);

    setData([]);
    const submissionResponse = (await submissionService.submitCode({
        files: [mainFile],
        problemId: problem.id,
        userId: userId ?? 'none',
        language: language,
    })) as SubmitCodeResponse;

    for await (const response of statusService.subscribeStatusEvents({
        eventGroup: submissionResponse.submissionId,
        requestAll: true,
    })) {
        const event = SubmissionStatusEvent.fromJsonString(response.event);
        if (event && event.state) {
            setData((oldData: string[]) => [...oldData, event]);
        }
    }

    setSubmitLoading(false);
}

export default function CodeOutput({
    code,
    language,
    problem,
}: {
    code: string;
    language: ProgrammingLanguage;
    problem: Problem;
}) {
    const [data, setData] = useState<SubmissionStatusEvent[]>([]);
    const submissionService: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const statusService: PromiseClient<typeof StatusService> = useClient(StatusService);
    const [submitLoading, setSubmitLoading] = useState(false);
    const { data: session } = useSession();

    return session ? (
        <Card>
            <CardContent sx={{ overflow: 'auto' }}>
                <Typography gutterBottom variant="h5" component="div">
                    Output
                </Typography>
                <ProgressComponent streamData={data} testCount={problem.tests.length} />
            </CardContent>

            <CardActions sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {submitLoading ? (
                    <LoadingButton loading variant="contained" size="medium" sx={{ padding: '19px' }}></LoadingButton>
                ) : (
                    <Button
                        sx={{ margin: '0px 10px', marginBottom: '10px' }}
                        variant="outlined"
                        onClick={() =>
                            onCodeSubmit(
                                session?.user.id,
                                code,
                                data,
                                setData,
                                submissionService,
                                statusService,
                                problem,
                                language,
                                setSubmitLoading,
                            )
                        }>
                        Submit
                    </Button>
                )}
            </CardActions>
        </Card>
    ) : (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Output
                </Typography>

                <Typography>You must sign in to create a submission...</Typography>
            </CardContent>
        </Card>
    );
}
