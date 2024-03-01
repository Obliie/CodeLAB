import CodeEditor from '@/components/CodeEditor';
import CodeSubmitter from '@/components/CodeSubmitter';
import NextBreadcrumb from '@/components/NextBreadcrumb';
import ProblemSummaryAccordion from '@/components/ProblemSummaryAccordion';
import ProblemTestData from '@/components/ProblemTestData';
import SubmissionTestData from '@/components/SubmissionTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemGroup, ProblemSummary } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupResponse, GetProblemResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { GetSubmissionResponse } from '@/protobufs/services/v1/submission_service_pb';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

async function Submission({ submission }: { submission: GetSubmissionResponse }) {
    const decoder = new TextDecoder();
    const solution = atob(decoder.decode(submission.files[0].data));

    return (
        <Box>
            <Stack direction="row" spacing={2}>
                <Card sx={{ width: '50%', overflow: 'auto' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Submission Code
                        </Typography>
                        <CodeEditor code={solution} setCode={undefined} language={submission.language} readOnly={true} />
                    </CardContent>
                </Card>
                <Card sx={{ width: '50%' }}>
                    <CardContent sx={{ height: '90%' }}>
                        <Typography gutterBottom variant="h5" component="div">
                            Test Results
                        </Typography>

                        {submission.testResults ? (<SubmissionTestData testData={submission.testResults} />) : (<></>)}
                    </CardContent>
                </Card>
            </Stack>
        </Box>
    );
}

export default async function SubmissionPage({ params }: { params: { submissionId: string } }) {
    const submission = (await useServerClient(SubmissionService)
        .getSubmission({
            submissionId: params.submissionId
        })
        .catch(err => handleGrpcError(err))) as GetSubmissionResponse;

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {submission ? (
                        <Box>
                            <NextBreadcrumb mappings={new Map<string, string>([[params.submissionId, params.submissionId]])} />
                            <Submission submission={submission} />
                        </Box>
                    ) : <></>
                }
            </Box>
        </Container>
    );
}
