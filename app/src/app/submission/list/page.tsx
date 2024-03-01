"use client"
import { useClient } from '@/lib/connect';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { GetSubmissionResponse, GetUserSubmissionsResponse } from '@/protobufs/services/v1/submission_service_pb';
import { PromiseClient } from '@connectrpc/connect';
import { OpenInNew } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowParams, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

async function SubmissionDataGrid() {
    const { data: session } = useSession();
    const router = useRouter();
    
    const handleViewClick = (id: GridRowId) => () => {
        router.push(`/submission/${id}`)
    };

    const columns: GridColDef[] = [
        {
            field: 'submissionTime',
            headerName: 'Submission Time',
            type: 'dateTime',
            width: 250,
        },
        { field: 'problem', headerName: 'Problem', width: 250 },
        {
            field: 'testsPassed',
            headerName: 'Tests Passed',
            width: 150,
        },
        {
            field: 'testsFailed',
            headerName: 'Tests Failed',
            width: 150,
        },
        {
            field: 'runtime',
            headerName: 'Total Runtime',
            width: 150
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            type: 'actions',
            getActions: ({ id }: { id: GridRowId }) => {
                return [
                    <GridActionsCellItem 
                        key={`view-${id}`}
                        icon={<OpenInNew />}
                        label="open"
                        onClick={handleViewClick(id)}
                        color="inherit"
                    />
                ];
            }
        }
    ];


    const submissionService: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const problemService: PromiseClient<typeof ProblemService> = useClient(ProblemService);
    if (session) {
        const submissions = await submissionService.getUserSubmissions({userId: session.user.id}) as GetUserSubmissionsResponse

        var rows = [];
        for (let submissionId of submissions.submissionId) {
            const submission = await submissionService.getSubmission({submissionId: submissionId}) as GetSubmissionResponse;
            const problem = await problemService.getProblem({problemId: submission.problemId}) as GetProblemResponse
            const row = {
                "id": submissionId,
                "submissionTime": submission.submissionTime.toDate(),
                "problem": problem.problem?.title,
                "testsPassed": submission.testResults.filter(result => result.passed).length,
                "testsFailed": submission.testResults.filter(result => !result.passed).length,
                "runtime": submission.testResults.length > 0 ? `${submission.testResults.map(result => result.runtime).reduce((accumulatedRuntime, runtime) => accumulatedRuntime + runtime).toPrecision(4)}s` : 'N/A'
            }
            rows.push(row);
        };

        return (
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
            />
        )
    }
    return (
        <Typography>Not logged in...</Typography>
    )
}

export default function SubmissionsListPage() {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">Your Submissions</Typography>
                        <React.Suspense fallback={<Skeleton width="100%" />}>
                            <SubmissionDataGrid />
                        </React.Suspense>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
