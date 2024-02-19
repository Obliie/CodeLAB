'use client';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemActions({ problemId, deleteAction }: { problemId: string; deleteAction: Function }) {
    const router = useRouter();

    return (
        <React.Fragment>
            <Button
                variant="outlined"
                sx={{ margin: '10px'}}
                color="error"
                onClick={async () => {
                    await deleteAction({ problemId: problemId });
                    router.refresh();
                }}>
                Delete
            </Button>
            <Link href={`/problem/${problemId}/edit`}>
                <Button variant="outlined" sx={{}}>
                    Edit
                </Button>
            </Link>
            <Link href={`/problem/${problemId}`}>
                <Button variant="contained" sx={{ marginRight: '10px' }}>
                    View
                </Button>
            </Link>
        </React.Fragment>
    );
}
