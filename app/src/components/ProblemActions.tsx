'use client';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemActions({ problemId, deleteAction, nav, isOwner }: { problemId: string; deleteAction: Function, nav: string, isOwner: boolean }) {
    const router = useRouter();

    return (
        <React.Fragment>
            {isOwner ?
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
                    <Link href={nav ? `${nav}/${problemId}/edit` : `/problem/${problemId}/edit`}>
                        <Button variant="outlined">
                            Edit
                        </Button>
                    </Link> 
                </React.Fragment>: <></>
            }
            <Link href={nav ? `${nav}/${problemId}` : `/problem/${problemId}`}>
                <Button variant="contained">
                    View
                </Button>
            </Link>
        </React.Fragment>
    );
}
