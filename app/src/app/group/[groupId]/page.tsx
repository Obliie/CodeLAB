import { DeleteProblemGroupRequest } from '@/actions/DeleteProblemGroupRequest';
import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import CircularProgressWithLabel from '@/components/CircularProgressWithLabel';
import CodeSubmitter from '@/components/CodeSubmitter';
import NextBreadcrumb from '@/components/NextBreadcrumb';
import ProblemGroupActions from '@/components/ProblemGroupActions';
import ProblemSummaryAccordion from '@/components/ProblemSummaryAccordion';
import ProblemTestData from '@/components/ProblemTestData';
import TestDataDialog from '@/components/TestDataDialog';
import Unauthorized from '@/components/Unauthorized';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemGroup, ProblemSummary } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemGroupResponse, GetProblemResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2'
import { getServerSession } from 'next-auth';
import React from 'react';

async function Group({ group }: { group: ProblemGroup }) {
    const problemSummaries = (await useServerClient(ProblemService)
        .getProblemSummaries({
            idFilter: group.problemIds,
        })
    .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    return (
        <Box>
            <Grid container direction={"row"} spacing={2}>
                <Grid xs>
                    <Card sx={{ overflow: 'auto', height: '100%' }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {group.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {group.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ marginTop: '20px', marginBottom: '12px' }}></Divider>
            <Typography gutterBottom variant="h5" component="div">
                Problems
            </Typography>

            {group.problemIds.length > 0 ? 
            (<React.Suspense fallback={<Skeleton width="100%" />}><ProblemSummaryAccordion problemSummaries={problemSummaries.problemSummaries} deleteProblem={DeleteProblemRequest} nav={`/group/${group.id}`} /></React.Suspense>) : <Typography>The group has no assigned problems...</Typography>
            }
        </Box>
    );
}

export default async function GroupPage({ params }: { params: { groupId: string } }) {
    const session = await getServerSession();
    const group = (await useServerClient(ProblemService)
        .getProblemGroup({
            groupId: params.groupId,
        })
        .catch(err => handleGrpcError(err))) as GetProblemGroupResponse;

    if (group && !group.group?.public && (!session || !group.group?.members.includes(session.user.email ?? "none"))) {
        return (<Unauthorized />)
    }

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                {group?.group ? (
                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    marginBottom: '15px',
                                    gap: '15px'
                            }}>
                                <NextBreadcrumb mappings={new Map<string, string>([[params.groupId, group.group.name]])} />
                                <ProblemGroupActions hideView={true} groupId={group.group.id} deleteAction={DeleteProblemGroupRequest} owner={group.group.owner}/>
                            </Box>
                            <Group group={group.group} />
                        </Box>
                    ) : <></>
                }
            </Box>
        </Container>
    );
}
