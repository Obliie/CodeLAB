'use client'

import React, { ReactNode } from 'react'

import { usePathname } from 'next/navigation'
import { Breadcrumbs, Card, Link, Typography } from '@mui/material'

const NextBreadcrumb = () => {
    const paths = usePathname()
    const pathNames = paths.split('/').filter( path => path )

    return (
        <Card sx={{ padding: '10px', marginBottom: '15px', width: '100%' }}>
            <Breadcrumbs>
                {
                    pathNames.map((link, index) => {
                        let href = `/${pathNames.slice(0, index + 1).join('/')}`
                        let itemLink = link

                        return (
                            <Link key={href} href={href} underline='hover'>
                                <Typography>{itemLink}</Typography>
                            </Link>
                        )
                    })
                }
            </Breadcrumbs>
        </Card>
    )
}

export default NextBreadcrumb