import NextBreadcrumb from '@/components/NextBreadcrumb';
import CodeSubmitter from '@/components/CodeSubmitter';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupResponse, GetProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { useSession } from 'next-auth/react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { getServerSession } from 'next-auth';
import { GetSubmissionProgressResponse } from '@/protobufs/services/v1/submission_service_pb';
import Unauthorized from '@/components/Unauthorized';
import ProblemActions from '@/components/ProblemActions';
import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import { PromiseClient } from '@connectrpc/connect';

async function ProblemDisplay({ problem }: { problem: Problem }) {
    const session = await getServerSession();
    const submissionServiceClient: PromiseClient<typeof SubmissionService> = useServerClient(SubmissionService);

    let currentCode = undefined;
    if (session) {
        const resp = (await submissionServiceClient
            .getSubmissionProgress({
                problemId: problem.id,
                userId: session.user.email ?? "",
            })
            .catch(err => handleGrpcError(err))) as GetSubmissionProgressResponse;

        const decoder = new TextDecoder();
        currentCode = decoder.decode(resp.data);
    }

    return (
        <Grid container spacing={2}>
            <Grid xs>
                <CodeSubmitter problem={problem} currentCode={currentCode} />
            </Grid>

            <Grid container xs direction={'column'}>
                <Grid xs>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {problem.title}
                            </Typography>
                            <Box sx={{ whiteSpace: "pre-wrap" }}>
                                {problem.description}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {problem.displayTestData ? (
                    <Grid xs>
                        <Card sx={{ height: '100%' }}>
                            <CardContent sx={{ height: '100%' }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    Test Data
                                </Typography>

                                {problem.tests ? <ProblemTestData testData={problem.tests} /> : <></>}
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    <></>
                )}
            </Grid>
        </Grid>
    );
}

export default async function ProblemPage({ params }: { params: { problemId: string; groupId: string } }) {
    const session = await getServerSession();
    const problemService = useServerClient(ProblemService);
    const problem = (await problemService
        .getProblem({
            problemId: params.problemId,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    if (
        problem &&
        !problem.problem?.public &&
        (!session || !problem.problem?.members.includes(session.user.email ?? 'none'))
    ) {
        return <Unauthorized />;
    }

    const mappings = new Map<string, string>([[params.problemId, problem.problem.title]]);

    if (params.groupId) {
        const group = (await problemService
            .getProblemGroup({
                groupId: params.groupId,
            })
            .catch(err => handleGrpcError(err))) as GetProblemGroupResponse;

        mappings.set(params.groupId, group.group?.name);
    }

    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}>
                {problem?.problem ? (
                    <Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%',
                                marginBottom: '15px',
                                gap: '15px'
                            }}>
                            <NextBreadcrumb mappings={mappings} />
                            <ProblemActions
                                hideView={true}
                                problemId={params.problemId}
                                deleteAction={DeleteProblemRequest}
                                nav={''}
                                isOwner={session ? session?.user.email === problem.problem.owner : false}
                            />
                        </Box>
                        <ProblemDisplay problem={problem.problem} />
                    </Box>
                ) : (
                    <></>
                )}
            </Box>
        </Container>
    );
}
