import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = 'https://tluxbmfziquoagqgkyka.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
        name, 
        email, 
        company, 
        website, 
        stage, 
        services, 
        marketing, 
        budget, 
        goals, 
        challenges 
    } = req.body;

    // 1. Validation
    if (!name || !email || !company) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    try {
        // 2. Insert into Supabase
        // We assume a 'strategy_leads' table exists or will be created.
        // If the user wants the table named after the sheet, we might need to handle that dynamically.
        const { data: supabaseData, error: supabaseError } = await supabase
            .from('strategy_leads')
            .insert([
                { 
                    full_name: name, 
                    email: email, 
                    company: company,
                    website: website,
                    business_stage: stage,
                    services_required: services, // JSONB or Array
                    current_marketing: marketing,
                    monthly_budget: budget,
                    objectives_3mo: goals,
                    biggest_challenge: challenges,
                    created_at: new Error().stack ? new Date().toISOString() : null // Safety check
                }
            ])
            .select();

        if (supabaseError) {
            console.error('[Supabase Error]', supabaseError);
            // We continue even if supabase fails, to try other integrations? 
            // Or fail early? Let's fail early for data integrity.
            throw new Error(`Database error: ${supabaseError.message}`);
        }

        // 3. Google Sheets Integration (Make.com Webhook)
        const webhookUrl = 'https://hook.eu1.make.com/eder9coftiyatdm05uy62jabxdtme4wr';
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ...req.body
                })
            });
            console.log('[Info] Make.com webhook dispatched');
        } catch (webhookError) {
            console.error('[Make Webhook Error]', webhookError);
        }

        // 4. Send Email Notification
        try {
            await resend.emails.send({
                from: 'Strategy Intake <onboarding@resend.dev>',
                to: 'pixelnproof@gmail.com',
                subject: `Strategy Session Applied: ${name} (${company})`,
                html: `
                    <h2>New Strategy Session Application</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Company:</strong> ${company}</p>
                    <p><strong>Website:</strong> ${website || 'N/A'}</p>
                    <hr>
                    <p><strong>Stage:</strong> ${stage}</p>
                    <p><strong>Services:</strong> ${Array.isArray(services) ? services.join(', ') : services}</p>
                    <p><strong>Marketing:</strong> ${marketing}</p>
                    <p><strong>Budget:</strong> ${budget}</p>
                    <hr>
                    <p><strong>Goals:</strong> ${goals}</p>
                    <p><strong>Challenges:</strong> ${challenges}</p>
                `
            });
        } catch (emailError) {
            console.error('[Resend Error]', emailError);
        }

        return res.status(200).json({
            success: true,
            message: 'Strategy application captured and synchronized.',
            leadId: supabaseData[0].id
        });

    } catch (error) {
        console.error('[API Error]', error);
        return res.status(500).json({
            error: 'Internal synchronization fault.',
            details: error.message
        });
    }
}
