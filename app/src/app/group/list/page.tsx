import { DeleteProblemGroupRequest } from '@/actions/DeleteProblemGroupRequest';
import CodeSubmitter from '@/components/CodeSubmitter';
import GroupDialog from '@/components/GroupDialog';
import GroupsList from '@/components/GroupsList';
import ProblemGroupActions from '@/components/ProblemGroupActions';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupListResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import { CardActionArea, CardActions } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import React from 'react';

// Opt out of caching for all data requests in the route segment
export const dynamic = 'force-dynamic'

export default async function GroupsListPage() {
    const session = await getServerSession();

    const problems = (await useServerClient(ProblemService)
        .getProblemSummaries(session && session.user.email ? { userId: session.user.email } : {})
        .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    const groups = (await useServerClient(ProblemService)
        .getProblemGroupList(session && session.user.email ? { userId: session.user.email } : {})
        .catch(err => handleGrpcError(err))) as GetProblemGroupListResponse;

    return (
        <Container>
            <GroupDialog group={undefined} problems={problems.problemSummaries}/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <React.Suspense fallback={<Skeleton width="100%" />}>
                    { groups.groups && groups.groups.length > 0 ? <GroupsList groups={groups.groups} deleteGroup={DeleteProblemGroupRequest} /> : (
                        <Typography>No groups found</Typography>
                    )}
                </React.Suspense>
            </Box>
        </Container>
    );
}
