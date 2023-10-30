import CodeEditor from '@/components/CodeEditor';
import ProblemTestData from '@/components/ProblemTestData';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

async function RunCode() {}

async function Problem({ id }: { id: string }) {
    const problem = (await useClient(ProblemService)
        .getProblem({
            prorblemId: id,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    return problem.problem ? (
        <Stack direction="row" spacing={2} width="100%">
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    <CodeEditor />
                </CardContent>
                <CardActions sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                    <Button
                        sx={{ margin: '0px 10px', marginBottom: '10px' }}
                        variant="outlined"
                        onClick={() => RunCode()}>
                        Submit
                    </Button>
                </CardActions>
            </Card>
            <Stack direction="column" spacing={2} width="100%">
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {problem.problem?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {problem.problem?.description}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Test Data
                        </Typography>
                        <ProblemTestData testData={problem.problem.testData} />
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
