exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const price = parseFloat(body.price) || 0;
    const email = body.email || '';
    const name = body.name || '';
    const address = body.address || '';
    const items = body.items || '';

    const WHOP_API_KEY = 'apik_3jpMMlBwWG9Fi_C4637599_C_66082bca219cda13035673656d6c1aba30425061731c166a8433fc14b33261';
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

    console.log('Calling Whop with price:', price);

    const res = await fetch('https://api.whop.com/api/v2/plans', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + WHOP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_id: 'biz_xZ3GNuKiUH3e3r',
        product_id: 'prod_To5Tnqjf5ka1M',
        plan_type: 'one_time',
        initial_price: price
      })
    });

    const text = await res.text();
    console.log('Whop status:', res.status, 'response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON from Whop', raw: text })
      };
    }

    const purchaseUrl = data.purchase_url || (data.id ? 'https://whop.com/checkout/' + data.id : null);

    if (!purchaseUrl) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No purchase URL', details: data })
      };
    }

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const msg = '🛍 New Order — BarryTube\n\n'
        + '👤 ' + name + '\n'
        + '📧 ' + email + '\n'
        + '📍 ' + address + '\n\n'
        + '🛒 ' + items + '\n\n'
        + '💰 Total: $' + price;

      await fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg })
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ purchase_url: purchaseUrl })
    };

  } catch (err) {
    console.error('Handler error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
