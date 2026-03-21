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
    const body = JSON.parse(event.body);
    const price = parseFloat(body.price);
    const email = body.email || '';
    const name = body.name || '';
    const address = body.address || '';
    const items = body.items || '';

    const WHOP_API_KEY = 'apik_8OnzesQobHB03_C4637599_C_b9308228e3c01e6af6419e04a9032913693aac3e9fcf5a724d01b4c391ce37';
    const COMPANY_ID = 'biz_xZ3GNuKiUH3e3r';
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

    // Create checkout configuration b dynamic price
const res = await fetch('https://api.whop.com/v5/plans', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + WHOP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_id: COMPANY_ID,
        initial_price: price,
        billing_period: 0,
        plan_type: 'one_time'
      })
    });

    const planData = await res.json();
    console.log('Whop response:', JSON.stringify(planData));

    const purchaseUrl = planData.purchase_url || (planData.id ? 'https://whop.com/checkout/' + data.id : null);

    if (!purchaseUrl) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed', details: planData })
      };
    }

    // Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const msg = '🛍 New Order — BarryTube\n\n'
        + '👤 ' + name + '\n'
        + '📧 ' + email + '\n'
        + '📍 ' + address + '\n\n'
        + '🛒 Products:\n' + items + '\n\n'
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
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
