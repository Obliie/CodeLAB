'use client';
import { KeyboardArrowDown } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemGroupActions({
    groupId,
    deleteAction,
    owner,
}: {
    groupId: string;
    deleteAction: Function;
    owner: string;
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const isOwner = session ? (session?.user.id === owner) : false;
    return (
        <React.Fragment>
            {isOwner ? (
                <React.Fragment>
                    <Button
                        id="manage-button"
                        aria-controls={open ? 'manage-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        variant="outlined"
                        endIcon={<KeyboardArrowDown />}>
                        Manage
                    </Button>
                    <Menu
                        id="manage-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'manage-button',
                        }}>
                        <MenuItem
                            onClick={() => {
                                router.push(`/group/${groupId}/edit`);
                            }}>
                            Edit
                        </MenuItem>
                        <MenuItem
                            onClick={async () => {
                                await deleteAction({ groupId: groupId });
                                router.refresh();
                            }}>
                            Delete
                        </MenuItem>
                    </Menu>
                </React.Fragment>
            ) : (
                <></>
            )}

            <Link href={`/group/${groupId}`}>
                <Button variant="contained">View</Button>
            </Link>
        </React.Fragment>
    );
}
