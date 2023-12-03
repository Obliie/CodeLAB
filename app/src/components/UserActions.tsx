"use client"
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupsIcon from '@mui/icons-material/Groups';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '@mui/material';

import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';

function signInClicked() {
    signIn('google')
}

function signOutClicked() {
    signOut();
}

export default function UserActions() {
    const { data: session } = useSession();

    return (
        <List>
            <ListItem disablePadding>
                <ListItemButton component={Button} onClick={() => session ? signOutClicked() : signInClicked() }>
                    <ListItemIcon>
                        {session ? <LogoutIcon /> : <LoginIcon />}
                    </ListItemIcon>
                    <ListItemText primary={session ? "Sign Out" : "Sign In"} />
                </ListItemButton>
            </ListItem>
        </List>
    )
}