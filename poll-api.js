async function pollApi() {
    console.log('Polling Vercel API...');
    for (let i = 0; i < 15; i++) {
        try {
            const res = await fetch('https://pixelnproof.vercel.app/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Vercel SDK Poller',
                    email: 'poller@pixelandproof.agency',
                    company: 'Poller Co'
                })
            });
            const data = await res.json();
            const dataStr = JSON.stringify(data);
            if (dataStr.includes('ENOTFOUND')) {
                console.log(`[Attempt ${i + 1}] Still old version (ENOTFOUND). Waiting...`);
            } else {
                console.log(`[Attempt ${i + 1}] New version detected! Status:`, res.status);
                console.log('Response:', data);
                return;
            }
        } catch (err) {
            console.error(`[Attempt ${i + 1}] Request failed:`, err.message);
        }
        // Wait 10 seconds before next poll
        await new Promise(r => setTimeout(r, 10000));
    }
    console.log('Timeout: Vercel did not deploy the new code in time.');
}
pollApi();
