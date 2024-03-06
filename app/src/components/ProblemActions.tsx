'use client';
import { KeyboardArrowDown } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemActions({ problemId, deleteAction, nav, isOwner, hideView }: { problemId: string; deleteAction: Function, nav: string, isOwner: boolean, hideView: boolean }) {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
        <React.Fragment>
            {isOwner ?
            <React.Fragment>
                <Button
                    id="manage-button"
                    aria-controls={open ? 'manage-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    variant='outlined'
                    endIcon={<KeyboardArrowDown />}
                >
                    Manage
                </Button>
                <Menu
                    id="manage-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'manage-button',
                    }}
                >
                    <MenuItem onClick={() => {
                        router.push(nav ? `${nav}/${problemId}/submissions` : `/problem/${problemId}/submissions`);
                    }}>View Submissions</MenuItem>
                    <MenuItem onClick={() => {
                        router.push(nav ? `${nav}/${problemId}/edit` : `/problem/${problemId}/edit`);
                    }}>Edit</MenuItem>
                    <MenuItem onClick={async () => {
                        await deleteAction({ problemId: problemId });
                        router.refresh();
                    }}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment> : <></>}
            
            {!hideView ? 
            <Link href={nav ? `${nav}/${problemId}` : `/problem/${problemId}`}>
                <Button variant="contained">
                    View
                </Button>
            </Link>
            : <></>}
        </React.Fragment>
    );
}
