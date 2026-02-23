async function testApi() {
    try {
        const res = await fetch('https://pixelnproof.vercel.app/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'API Test SDK',
                email: 'api@pixelandproof.agency',
                company: 'SDK Test Co'
            })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err);
    }
}
testApi();
