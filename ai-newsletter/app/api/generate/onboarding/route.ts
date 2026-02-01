import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { genres } = await request.json();

        if (!genres || !Array.isArray(genres) || genres.length === 0) {
            return NextResponse.json({ error: 'Invalid genres' }, { status: 400 });
        }

        // Trigger article generation for each selected genre
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

        const generatePromises = genres.map(async (genre: string) => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/generation/article-now/${genre}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (!response.ok) {
                    console.error(`Failed to generate article for ${genre}`);
                }
            } catch (error) {
                console.error(`Error generating article for ${genre}:`, error);
            }
        });

        // Don't wait for all to complete, start them in background
        Promise.all(generatePromises).catch(console.error);

        return NextResponse.json({ success: true, message: 'Article generation started' });
    } catch (error) {
        console.error('Onboarding generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
