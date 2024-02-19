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

async function Problem({ id }: { id: string }) {
    const problem = (await useServerClient(ProblemService)
        .getProblem({
            problemId: id,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    return problem.problem ? (
        <Stack direction="row" spacing={2} width="70vw">
            <CodeSubmitter problem={problem.problem}/>

            <Stack direction="column" spacing={2} width="100%">
                <Card sx={{ width: '35vw', height: '40vh', overflow: 'auto' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {problem.problem?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {problem.problem?.description}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ width: '35vw', height: '40vh' }}>
                    <CardContent sx={{ height: '90%' }}>
                        <Typography gutterBottom variant="h5" component="div">
                            Test Data
                        </Typography>
                        
                        {problem.problem.tests ? (<ProblemTestData testData={problem.problem.tests} />) : (<></>)}
                    </CardContent>
                </Card>
            </Stack>
        </Stack>
    ) : (
        <></>
    );
}

export default function ProblemPage({ params }: { params: { id: string } }) {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Problem id={params.id} />
            </Box>
        </Container>
    );
}
