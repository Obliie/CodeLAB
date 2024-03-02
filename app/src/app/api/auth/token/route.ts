// This is an example of how to read a JSON Web Token from an API route
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest, res: NextResponse) => {
  const token = await getToken({ req, raw: true });

  if (token) {
    return NextResponse.json({ token: token });
  } else {
    return NextResponse.json({ message: "Unauthorized.", status: 401 });
  }
}

export { handler as GET }