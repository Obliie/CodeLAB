"use client"

import Card from "@mui/material/Card"
import Stack from "@mui/material/Stack"
import CodeOutput from "./CodeOutput"
import CardContent from "@mui/material/CardContent"
import CodeEditor from "./CodeEditor"
import Typography from "@mui/material/Typography"
import { useState } from "react"

export default function CodeSubmitter({ dataFetcher }: { dataFetcher: Function }) {
    const [code, setCode] = useState("");

    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    <CodeEditor setCode={setCode}/>
                </CardContent>
            </Card>
            <Card sx={{ width: '100%' }}>
                <CodeOutput dataFetcher={dataFetcher} code={code}/>
            </Card>
        </Stack>
    )
}