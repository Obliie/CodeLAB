'use client';

import React, { ReactNode } from 'react';

import { useParams, usePathname } from 'next/navigation';
import { Breadcrumbs, Card, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

const NextBreadcrumb = ({mappings}: {mappings: Map<string, string>}) => {
    const paths = usePathname();
    const pathNames = paths.split('/').filter(path => path);

    return (
        <Card sx={{ padding: '10px', marginBottom: '15px', width: '100%' }}>
            <Breadcrumbs separator={<NavigateNext />} aria-label="breadcrumb">
                {pathNames.map((link: string, index: number) => {
                    let href = `/${pathNames.slice(0, index + 1).join('/')}`;

                    let crumbName = ""
                    if (mappings.has(link)) {
                        crumbName = mappings.get(link) ?? "...";
                    } else {
                        crumbName = link.charAt(0).toUpperCase() + link.slice(1);
                    }

                    return pathNames.length - 1 == index ? (
                        <Typography>{crumbName}</Typography>
                    ) : (
                        <Link key={href} href={href} underline="hover">
                            {crumbName}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Card>
    );
};

export default NextBreadcrumb;
