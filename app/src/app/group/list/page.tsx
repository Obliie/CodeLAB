import { DeleteProblemGroupRequest } from '@/actions/DeleteProblemGroupRequest';
import CodeSubmitter from '@/components/CodeSubmitter';
import GroupDialog from '@/components/GroupDialog';
import ProblemGroupActions from '@/components/ProblemGroupActions';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupListResponse } from '@/protobufs/services/v1/problem_service_pb';
import { CardActionArea, CardActions } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import React from 'react';

async function GroupsList() {
    const groups = (await useServerClient(ProblemService)
        .getProblemGroupList({})
        .catch(err => handleGrpcError(err))) as GetProblemGroupListResponse;

    return groups ? (
        <Box width="100%" paddingTop="10px">
            {groups.groups.map(group => (
                <Card key={group.id} sx={{marginBottom: '10px'}}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {group.name}
                        </Typography>
                        <Typography>Contains {group.problems.length} problems
                        
                        </Typography>


                        <CardActions sx={{justifyContent: 'end'}}>
                            <ProblemGroupActions groupId={group.id} deleteAction={DeleteProblemGroupRequest} />
                        </CardActions>
                    </CardContent>
                </Card>
            ))}
        </Box>
    ) : (
        <Typography>No groups found</Typography>
    );
}

export default function GroupsListPage() {
    return (
        <Container>
            <GroupDialog group={undefined}/>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <React.Suspense fallback={<Skeleton width="100%" />}>
                    <GroupsList />
                </React.Suspense>
            </Box>
        </Container>
    );
}