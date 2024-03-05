import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import ProblemActions from '@/components/ProblemActions';
import ProblemDialog from '@/components/ProblemDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { RunCodeRequest } from '@/protobufs/services/v1/code_runner_service_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import {
    GetProblemGroupResponse,
    GetProblemResponse,
    GetProblemSummariesResponse,
} from '@/protobufs/services/v1/problem_service_pb';
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
import { Problem, ProblemGroup } from '@/protobufs/common/v1/problem_pb';
import ProblemTestDataGrid from '@/components/ProblemTestDataGrid';
import TestDataDialog from '@/components/TestDataDialog';
import GroupEditForm from '@/components/GroupEditForm';
import { UpdateProblemGroupRequest } from '@/actions/UpdateProblemGroupRequest';
import NextBreadcrumb from '@/components/NextBreadcrumb';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

async function GroupEditDisplay({ group }: { group: ProblemGroup }) {
    const session = await getServerSession();

    const problems = (await useServerClient(ProblemService)
        .getProblemSummaries(session && session.user.email ? { userId: session.user.email } : {})
        .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ overflow: 'auto' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Group
                    </Typography>

                    <GroupEditForm group={group} problems={problems?.problemSummaries} update={true} close={undefined} />
                </CardContent>
            </Card>
        </Stack>
    );
}

export default async function GroupEditPage({ params }: { params: { groupId: string } }) {
    const group = (await useServerClient(ProblemService)
        .getProblemGroup({
            groupId: params.groupId,
        })
        .catch(err => handleGrpcError(err))) as GetProblemGroupResponse;

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {group?.group ? (
                    <Box>
                        <NextBreadcrumb mappings={new Map<string, string>([[params.groupId, group.group.name]])} />
                        <GroupEditDisplay group={group.group} />
                    </Box>
                ) : (
                    <></>
                )}
            </Box>
        </Container>
    );
}
