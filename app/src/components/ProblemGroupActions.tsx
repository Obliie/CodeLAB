'use client';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemGroupActions({ groupId, deleteAction }: { groupId: string; deleteAction: Function }) {
    const router = useRouter();

    return (
        <React.Fragment>
            <Button
                variant="outlined"
                sx={{ alignContent: 'end'}}
                color="error"
                onClick={async () => {
                    await deleteAction({ groupId: groupId });
                    router.refresh();
                }}>
                Delete
            </Button>
            <Link href={`/group/${groupId}/edit`}>
                <Button variant="outlined">
                    Edit
                </Button>
            </Link>
            <Link href={`/group/${groupId}`}>
                <Button variant="contained">
                    View
                </Button>
            </Link>
        </React.Fragment>
    );
}
