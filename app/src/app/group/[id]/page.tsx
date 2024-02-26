import CodeSubmitter from '@/components/CodeSubmitter';
import ProblemSummaryAccordion from '@/components/ProblemSummaryAccordion';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemSummary } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupResponse, GetProblemResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

async function Group({ id }: { id: string }) {
    const group = (await useServerClient(ProblemService)
        .getProblemGroup({
            groupId: id,
        })
        .catch(err => handleGrpcError(err))) as GetProblemGroupResponse;

    const problemSummaries = (await useServerClient(ProblemService)
        .getProblemSummaries({
            idFilter: group.group?.problemIds,
        })
    .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    return group.group ? (
        <Box>
            <Stack direction="row" spacing={2} width="100%">
                <Card sx={{ width: '35vw', height: '30vh', overflow: 'auto' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {group.group?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {group.group?.description}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ width: '35vw', height: '30vh' }}>
                    <CardContent sx={{ height: '90%' }}>
                        <Typography gutterBottom variant="h5" component="div">
                            Progress
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Not implemented...
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            <Divider sx={{ marginTop: '20px', marginBottom: '12px' }}></Divider>
            <Typography gutterBottom variant="h5" component="div">
                Problems
            </Typography>

            <ProblemSummaryAccordion problemSummaries={problemSummaries.problemSummaries} />
        </Box>
    ) : (
        <></>
    );
}

export default function GroupPage({ params }: { params: { id: string } }) {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Group id={params.id} />
            </Box>
        </Container>
    );
}
