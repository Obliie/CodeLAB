'use client';

import { Problem } from '@/protobufs/common/v1/problem_pb';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GridCallbackDetails, GridColDef, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid/models';
import TestDataDialog from './TestDataDialog';
import Button from '@mui/material/Button';
import { SetStateAction, useState } from 'react';
import { useClient } from '@/lib/connect';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { useRouter } from 'next/navigation';
import { handleGrpcError } from '@/lib/error';
import { RemoveTestDataResponse } from '@/protobufs/services/v1/problem_service_pb';

export default function ProblemTestDataGrid({ problem }: { problem: Problem }) {
    const [selectedTests, setSelectedTests] = useState<GridRowId[]>([]);
    const problemServiceClient = useClient(ProblemService);
    const router = useRouter();
    
    // Example of handling selection change
    const handleSelectedTestChange = (rowSelectionModel: GridRowSelectionModel, details: GridCallbackDetails) => {
        setSelectedTests(rowSelectionModel);
    };

    const handleDelete = async () => {
        console.log(selectedTests)
        await problemServiceClient.removeTestData({
            problemId: problem.id,
            testIds: selectedTests
        })
        .catch(err => handleGrpcError(err)) as RemoveTestDataResponse;

        router.refresh();
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 220,
        },
        {
            field: 'arguments',
            headerName: 'Arguments',
            width: 400,
        },
        {
            field: 'expectedStdout',
            headerName: 'Expected Stdout',
            width: 400,
        },
    ];

    var rows = [];
    for (let testData of problem.tests) {
        const row = {
            id: testData.id,
            arguments: testData.arguments,
            expectedStdout: testData.expectedStdout,
        };
        rows.push(row);
    }

    return (
        <Box>
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
                checkboxSelection
                rowSelectionModel={selectedTests}
                onRowSelectionModelChange={handleSelectedTestChange}
            />
            <TestDataDialog testData={undefined} problem_id={problem.id} />
            <Box textAlign="end">
                <Button variant="outlined" color="error" onClick={handleDelete}>
                    Delete Test Data
                </Button>
            </Box>
        </Box>
    );
}
