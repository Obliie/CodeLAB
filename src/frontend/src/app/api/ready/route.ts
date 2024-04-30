import { NextRequest, NextResponse } from "next/server";

const handler = (_req: NextRequest, res: NextResponse) => {
    return new Response("ok", {
        status: 200
    });
}

export { handler as GET }