import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@vercel/blob';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const downloadUrl = await getDownloadUrl(url);
        return NextResponse.redirect(downloadUrl);
    } catch {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
