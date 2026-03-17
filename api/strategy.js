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
        return res.status(400).json({ 
            error: 'Incomplete Qualification',
            details: 'Name, Work Email, and Company are required to sync your strategy session.'
        });
    }

    const results = {
        supabase: false,
        make: false,
        resend: false
    };

    try {
        // 2. Insert into Supabase (Critical for persistence)
        const { error: supabaseError } = await supabase
            .from('strategy_leads')
            .insert([
                { 
                    full_name: name, 
                    email: email, 
                    company: company,
                    website: website,
                    business_stage: stage,
                    services_required: services,
                    current_marketing: marketing,
                    monthly_budget: budget,
                    objectives_3mo: goals,
                    biggest_challenge: challenges
                }
            ]);

        if (supabaseError) {
            console.error('[Supabase Fault]', supabaseError);
            // We'll report this specifically to help the user debug (e.g. table missing)
            return res.status(500).json({ 
                error: 'DATABASE_FAULT',
                details: `Supabase Error: ${supabaseError.message}. Ensure 'strategy_leads' table exists.`
            });
        }
        results.supabase = true;

        // 3. Google Sheets Integration (Make.com Webhook)
        // Hardcoded as requested: https://hook.eu1.make.com/eder9coftiyatdm05uy62jabxdtme4wr
        const webhookUrl = 'https://hook.eu1.make.com/eder9coftiyatdm05uy62jabxdtme4wr';
        try {
            const makeRes = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    ...req.body,
                    source: 'pixelnproof_web_strategy'
                })
            });
            if (makeRes.ok) results.make = true;
        } catch (webhookError) {
            console.error('[Make.com Webhook Fault]', webhookError);
        }

        // 4. Send Email Notification
        try {
            await resend.emails.send({
                from: 'Pixel & Proof Strategy <onboarding@resend.dev>',
                to: 'pixelnproof@gmail.com',
                subject: `🚨 New Strategy Lead: ${name} (${company})`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #FFCC00;">New Strategy Application</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Company:</strong> ${company}</p>
                        <p><strong>Website:</strong> ${website || 'N/A'}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Stage:</strong> ${stage}</p>
                        <p><strong>Services:</strong> ${Array.isArray(services) ? services.join(', ') : services}</p>
                        <p><strong>Budget:</strong> ${budget}</p>
                        <hr style="border: 0; border-top: 1px solid #eee;">
                        <p><strong>Marketing Context:</strong><br>${marketing}</p>
                        <p><strong>3 Month Goals:</strong><br>${goals}</p>
                        <p><strong>Biggest Challenge:</strong><br>${challenges}</p>
                    </div>
                `
            });
            results.resend = true;
        } catch (emailError) {
            console.error('[Resend Email Fault]', emailError);
        }

        return res.status(200).json({
            success: true,
            sync_status: results,
            message: 'Application captured successfully.'
        });

    } catch (error) {
        console.error('[Global Sync Fault]', error);
        return res.status(500).json({
            error: 'SYNCHRONIZATION_FAULT',
            details: error.message
        });
    }
}
