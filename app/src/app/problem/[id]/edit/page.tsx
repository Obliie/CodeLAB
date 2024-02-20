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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import ProblemTestDataGrid from '@/components/ProblemTestDataGrid';
import TestDataDialog from '@/components/TestDataDialog';

export const dynamic = 'force-dynamic'

async function ProblemEditDisplay({ id }: { id: string }) {
    const problem = (await useServerClient(ProblemService)
        .getProblem({
            problemId: id,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    return problem.problem ? (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Problem
                    </Typography>

                    <ProblemEditForm problem={problem.problem} updateProblem={UpdateProblemRequest} />
                </CardContent>
            </Card>
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Test Data
                    </Typography>

                    <React.Suspense fallback={<Skeleton width="100%" />}>
                        <ProblemTestDataGrid problem={problem.problem}/>
                    </React.Suspense>
                </CardContent>
            </Card>
        </Stack>
    ) : (
        <></>
    );
}



export default function ProblemEditPage({ params }: { params: { id: string } }) {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <React.Suspense fallback={<Skeleton width="100%" />}>
                    <ProblemEditDisplay id={params.id} />
                </React.Suspense>
            </Box>
        </Container>
    );
}