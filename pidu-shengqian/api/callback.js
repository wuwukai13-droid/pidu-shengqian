export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenResponse.json();
    
    // 返回给 Decap CMS 的 HTML 页面
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              token: '${data.access_token}',
              provider: 'github'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('OAuth callback failed');
  }
}
