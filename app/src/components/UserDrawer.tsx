import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import ArticleIcon from '@mui/icons-material/Article';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import * as React from 'react';
import UserActions from './UserActions';

const LINKS = [
    { text: 'Problems', href: '/problem/list', icon: ViewHeadlineIcon },
    { text: 'Groups', href: '/group/list', icon: WorkspacesIcon },
    { text: 'Submissions', href: '/submission/list', icon: ArticleIcon },
    //{ text: 'Users', href: '/user/list', icon: ManageAccountsIcon },
];

export default function UserDrawer({ width }: { width: number }) {
    return (
        <Drawer
            sx={{
                minWidth: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                    top: ['48px', '56px', '64px'],
                    height: 'auto',
                    bottom: 0,
                },
            }}
            variant="permanent"
            anchor="left">
            <Divider />
            <List>
                {LINKS.map(({ text, href, icon: Icon }) => (
                    <ListItem key={href} disablePadding>
                        <ListItemButton component={Link} href={href}>
                            <ListItemIcon>
                                <Icon />
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ mt: 'auto' }} />
            <UserActions />
        </Drawer>
    );
}
