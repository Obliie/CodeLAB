"use client"
import { DeleteProblemGroupRequest } from '@/actions/DeleteProblemGroupRequest';
import CodeSubmitter from '@/components/CodeSubmitter';
import GroupDialog from '@/components/GroupDialog';
import ProblemGroupActions from '@/components/ProblemGroupActions';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemGroup } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupListResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import { CardActionArea, CardActions, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

export default function GroupsList({ groups, deleteGroup }: { groups: ProblemGroup[], deleteGroup: Function }) {
    const [filteredGroups, setFilteredGroups] = useState(groups)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilteredGroups([...groups.filter(group => group.name.toLowerCase().includes(event.target.value.toLowerCase()))]);
    }

    return (
        <Box width="100%" paddingTop="10px">
            <TextField fullWidth id="group-filter" label="Search..." variant="outlined" size="small" onChange={handleChange} sx={{ paddingBottom: '8px' }} />
            {filteredGroups.map(group => (
                <Card key={group.id} sx={{ marginBottom: '10px' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {group.name}
                        </Typography>
                        <Typography>Contains {group.problemIds.length} problems</Typography>
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end', marginBottom: '10px', gap: '5px', marginRight: '10px'}}>
                        <ProblemGroupActions groupId={group.id} deleteAction={deleteGroup} owner={group.owner}/>
                    </CardActions>
                </Card>
            ))}
        </Box>
    )
}