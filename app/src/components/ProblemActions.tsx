'use client';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemActions({ problemId, deleteAction, nav }: { problemId: string; deleteAction: Function, nav: string }) {
    const router = useRouter();

    return (
        <React.Fragment>
            <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                    await deleteAction({ problemId: problemId });
                    router.refresh();
                }}>
                Delete
            </Button>
            <Link href={`${nav}/problem/${problemId}/edit`}>
                <Button variant="outlined" sx={{}}>
                    Edit
                </Button>
            </Link>
            <Link href={`${nav}/problem/${problemId}`}>
                <Button variant="contained" sx={{ marginRight: '10px' }}>
                    View
                </Button>
            </Link>
        </React.Fragment>
    );
}
