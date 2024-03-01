import NextBreadcrumb from '@/components/NextBreadcrumb';
import CodeSubmitter from '@/components/CodeSubmitter';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { useSession } from 'next-auth/react';

async function ProblemDisplay({ problem }: { problem: Problem }) {
    const { data: session } = useSession();

    return (
        <Stack direction="row" spacing={2} width="100%">
            {session ? <CodeSubmitter problem={problem}/> : "You must be signed in to make a submission..."}

            <Stack direction="column" spacing={2} width="100%">
                <Card sx={{ minWidth: '50%', height: problem.displayTestData ? "50%" : "100%", overflow: 'auto' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {problem.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {problem.description}
                        </Typography>
                    </CardContent>
                </Card>
                {problem.displayTestData ? (
                    <Card sx={{ minWidth: '50%', height: "50%" }}>
                        <CardContent sx={{ height: '90%' }}>
                            <Typography gutterBottom variant="h5" component="div">
                                Test Data
                            </Typography>
                            
                            {problem.tests ? (<ProblemTestData testData={problem.tests} />) : (<></>)}
                        </CardContent>
                    </Card>)
                : <></>
                }
            </Stack>
        </Stack>
    )
}

export default async function ProblemPage({ params }: { params: { problemId: string } }) {
    const problem = (await useServerClient(ProblemService)
        .getProblem({
            problemId: params.problemId,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {problem?.problem ? (
                    <Box>
                        <NextBreadcrumb mappings={new Map<string, string>([[params.problemId, problem.problem.title]])} />
                        <ProblemDisplay problem={problem.problem} />
                    </Box>
                    ) : <></>
                }
            </Box>
        </Container>
    );
}
