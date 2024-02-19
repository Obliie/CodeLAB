"use client"

import { Problem } from "@/protobufs/common/v1/problem_pb";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { GridColDef } from "@mui/x-data-grid/models";

export default function ProblemTestDataGrid({problem}: {problem: Problem}) {
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 220
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
            "id": testData.id,
            "arguments": testData.arguments,
            "expectedStdout": testData.expectedStdout,
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
            checkboxSelection
        />
    )
}