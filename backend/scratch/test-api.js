async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/accounts/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin@123',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    const queryParams = new URLSearchParams({
      skip: '0',
      limit: '30',
      fromMonth: '2022-01',
      toMonth: '2022-06',
    });

    const res = await fetch(`http://localhost:3000/inventory-reports?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resData = await res.json();

    console.log('--- API RESPONSE ---');
    console.log('Status:', res.status);
    console.log('Meta:', resData.meta);
    console.log('Data length:', resData.data ? resData.data.length : 'N/A');
    console.log('Sample data:', JSON.stringify(resData.data ? resData.data.slice(0, 2) : resData, null, 2));
  } catch (err) {
    console.error('Error querying API:', err.message);
  }
}

test();
