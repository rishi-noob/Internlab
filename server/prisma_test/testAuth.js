const BASE_URL = 'http://localhost:5000/api/auth';
const fetch = require('node-fetch'); // May need to install node-fetch or use native fetch if Node >= 18

async function testAuthFlow() {
    try {
        console.log('--- 1. Testing Registration ---');
        const regEmail = `testuser_${Date.now()}@example.com`;
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Setup User',
                email: regEmail,
                password: 'password123',
            })
        });
        const regData = await regRes.json();
        console.log('Register Response:', regData);

        if (!regRes.ok) {
            console.error('Registration failed, aborting test.');
            return;
        }

        console.log('\n--- 2. Testing Login BEFORE Verification ---');
        const login1Res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: regEmail,
                password: 'password123',
            })
        });
        const login1Data = await login1Res.json();
        console.log('Login 1 Response:', login1Data);
        // Expected message: 'Please verify your email before logging in.'
        // ... (remaining steps require pulling the token from DB or logs, which makes automated testing a bit tricky right now without DB access here. I will do this manually for the time being).

    } catch (err) {
        console.error('Test error:', err);
    }
}

testAuthFlow();
