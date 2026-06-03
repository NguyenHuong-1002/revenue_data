async function run() {
  console.log('Testing Admin login...');
  const loginResponse = await fetch('http://localhost:3000/accounts/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'Admin@123',
    }),
  });

  if (!loginResponse.ok) {
    console.error('Login failed with status:', loginResponse.status);
    console.error(await loginResponse.text());
    return;
  }

  const loginResData = await loginResponse.json() as any;
  const token = loginResData.accessToken;
  console.log('Login successful. Token:', token.substring(0, 15) + '...');
  console.log('Account in Login response:', loginResData.account);

  console.log('\nCalling /accounts/me...');
  const meResponse = await fetch('http://localhost:3000/accounts/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('/accounts/me status:', meResponse.status);
  const meResData = await meResponse.json();
  console.log('/accounts/me response data:', meResData);

  console.log('\nCalling /accounts...');
  const listResponse = await fetch('http://localhost:3000/accounts', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('/accounts status:', listResponse.status);
  const listResData = await listResponse.json() as any;
  console.log('/accounts response data count:', listResData.data?.length);
  if (!listResponse.ok) {
    console.log('/accounts error:', listResData);
  }

  console.log('\nCalling /notifications...');
  const notiResponse = await fetch('http://localhost:3000/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('/notifications status:', notiResponse.status);
  const notiResData = await notiResponse.json() as any;
  console.log('/notifications response data count:', notiResData.data?.length);
  if (!notiResponse.ok) {
    console.log('/notifications error:', notiResData);
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
});
