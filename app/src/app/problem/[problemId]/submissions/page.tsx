import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import ProblemActions from '@/components/ProblemActions';
import ProblemDialog from '@/components/ProblemDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { RunCodeRequest } from '@/protobufs/services/v1/code_runner_service_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { UpdateProblemRequest } from '@/actions/UpdateProblemRequest';
import ProblemEditForm from '@/components/ProblemEditForm';
import Stack from '@mui/material/Stack';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import ProblemTestDataGrid from '@/components/ProblemTestDataGrid';
import TestDataDialog from '@/components/TestDataDialog';
import NextBreadcrumb from '@/components/NextBreadcrumb';
import { PromiseClient } from '@connectrpc/connect';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { OpenInNew } from '@mui/icons-material';
import { GetProblemSubmissionsResponse, GetSubmissionResponse } from '@/protobufs/services/v1/submission_service_pb';
import { useSession } from 'next-auth/react';
import { ProblemSubmissionsDataGrid } from '@/components/ProblemSubmissionsDataGrid';
import SolutionRuntimeDistributionGraph from '@/components/SolutionRuntimeDistributionGraph';
import Unauthorized from '@/components/Unauthorized';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

async function ProblemSubmissionDisplay({ problem }: { problem: Problem }) {
    const submissionService = useServerClient(SubmissionService);

    const problemSubmissions = (await submissionService.getProblemSubmissions({
        problemId: problem.id,
    })) as GetProblemSubmissionsResponse;

    let submissions = [];
    for (let submissionId of problemSubmissions.submissionId) {
        submissions.push(
            (await submissionService.getSubmission({ submissionId: submissionId })) as GetSubmissionResponse,
        );
    }

    const testCount = submissions.length > 0 ? submissions[0].testResults.length : 0;
    return (
        <Stack direction="column" spacing={2} width="100%">
            <Stack direction="row" spacing={2} width="100%">
                <Card sx={{ overflow: 'auto', width: '50%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Submission Summary
                        </Typography>

                        <Typography>Total Submissions: {submissions.length}</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ overflow: 'auto', width: '50%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Solution Runtime Distribution
                        </Typography>

                        {testCount > 0 ? (
                            <SolutionRuntimeDistributionGraph submissions={submissions} />
                        ) : (
                            <Typography>No solution test results...</Typography>
                        )}
                    </CardContent>
                </Card>
            </Stack>
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Submissions
                    </Typography>

                    <React.Suspense fallback={<Skeleton width="100%" />}>
                        <ProblemSubmissionsDataGrid submissions={submissions} />
                    </React.Suspense>
                </CardContent>
            </Card>
        </Stack>
    );
}

export default async function ProblemSubmissionsPage({ params }: { params: { problemId: string } }) {
    const session = await getServerSession();
    const problem = (await useServerClient(ProblemService)
        .getProblem({
            problemId: params.problemId,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    if (problem && (!session || session.user.email != problem.problem?.owner)) {
        return (<Unauthorized />)
    }

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {problem?.problem ? (
                    <Box>
                        <NextBreadcrumb
                            mappings={new Map<string, string>([[params.problemId, problem.problem.title]])}
                        />
                        <ProblemSubmissionDisplay problem={problem.problem} />
                    </Box>
                ) : (
                    <></>
                )}
            </Box>
        </Container>
    );
}
