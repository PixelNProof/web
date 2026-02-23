import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
// For serverless functions, we use the Service Role Key to bypass RLS and perform writes
const supabaseUrl = 'https://tluxbmfziquoagqgkyka.supabase.co'; // Hardcoded to bypass Vercel Integration overrides
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, company } = req.body;

    // 1. Server-side Validation
    if (!name || !email || !company) {
        return res.status(400).json({ error: 'Engineering fault: Missing crucial lead parameters.' });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ error: 'Signature fault: Invalid email format detected.' });
    }

    try {
        // 2. Insert Lead into Supabase Table
        const { data, error } = await supabase
            .from('leads')
            .insert([
                { full_name: name, email: email, company: company }
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log(`[SDK] Lead captured:`, data[0]);

        // 3. Send Email Notification via Resend
        try {
            await resend.emails.send({
                from: 'Pixel & Proof <onboarding@resend.dev>', // Requires verified domain in production
                to: 'pixelnproof@gmail.com',
                subject: `New Lead: ${name} from ${company}`,
                html: `<p><strong>New Growth Audit Request</strong></p>
                       <p><strong>Name:</strong> ${name}</p>
                       <p><strong>Email:</strong> ${email}</p>
                       <p><strong>Company:</strong> ${company}</p>`
            });
            console.log(`[Resend] Notification email sent to pixelnproof@gmail.com`);
        } catch (emailError) {
            console.error('[System Error] Resend dispatch failed:', emailError);
            // Do not fail the entire request if email fails, lead is still saved
        }

        return res.status(200).json({
            success: true,
            message: 'Lead synchronized via SDK. Growth audit engineered.',
            leadId: data[0].id
        });
    } catch (error) {
        console.error('[System Error] SDK synchronization failed:', error);
        return res.status(500).json({
            error: 'Database synchronization fault.',
            details: error.message
        });
    }
}

