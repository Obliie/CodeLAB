'use client';
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
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import ProblemTestDataGrid from '@/components/ProblemTestDataGrid';
import TestDataDialog from '@/components/TestDataDialog';
import NextBreadcrumb from '@/components/NextBreadcrumb';
import { PromiseClient } from '@connectrpc/connect';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { OpenInNew } from '@mui/icons-material';
import { GetProblemSubmissionsResponse, GetSubmissionResponse } from '@/protobufs/services/v1/submission_service_pb';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export async function ProblemSubmissionsDataGrid({ submissions }: { submissions: GetSubmissionResponse[] }) {
    const router = useRouter();
    const { data: session } = useSession();

    const handleViewClick = (id: GridRowId) => () => {
        router.push(`submissions/${id}`);
    };

    const columns: GridColDef[] = [
        { field: 'user', headerName: 'User', width: 250 },
        {
            field: 'submissionTime',
            headerName: 'Submission Time',
            type: 'dateTime',
            width: 250,
        },
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
            width: 150,
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
                    />,
                ];
            },
        },
    ];

    if (session) {
        var rows = [];
        for (let submission of submissions) {
            const row = {
                id: submission.submissionId,
                user: submission.userId,
                submissionTime: new Date(submission.submissionTime),
                testsPassed: submission.testResults.filter(result => result.passed).length,
                testsFailed: submission.testResults.filter(result => !result.passed).length,
                runtime:
                    submission.testResults.length > 0
                        ? `${(submission.testResults
                              .map(result => result.runtime)
                              .reduce((accumulatedRuntime, runtime) => accumulatedRuntime + runtime)
                              * 1000).toFixed(2)}ms`
                        : 'N/A',
            };
            rows.push(row);
        }

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
        );
    }
    return <Typography>Not logged in...</Typography>;
}
