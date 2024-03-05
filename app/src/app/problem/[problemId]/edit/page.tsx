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
import NextBreadcrumb from '@/components/NextBreadcrumb';
import { getServerSession } from 'next-auth';
import { GetServerSidePropsContext } from 'next/types';
import Unauthorized from '@/components/Unauthorized';

export const dynamic = 'force-dynamic'

async function ProblemEditDisplay({ problem }: { problem: Problem }) {
    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Problem
                    </Typography>

                    <ProblemEditForm problem={problem} update={true} close={undefined}/>
                </CardContent>
            </Card>
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Test Data
                    </Typography>

                    <React.Suspense fallback={<Skeleton width="100%" />}>
                        <ProblemTestDataGrid problem={problem}/>
                    </React.Suspense>
                </CardContent>
            </Card>
        </Stack>
    )
}

export default async function ProblemEditPage({ params }: { params: { problemId: string } }) {
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
                        <NextBreadcrumb mappings={new Map<string, string>([[params.problemId, problem.problem.title]])} />
                        <ProblemEditDisplay problem={problem.problem} />
                    </Box>
                    ) : <></>
                }
            </Box>
        </Container>
    );
}