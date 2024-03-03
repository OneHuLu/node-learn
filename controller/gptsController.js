const OpenAIApi = require('openai');

//本地开发使用
const { HttpsProxyAgent } = require('https-proxy-agent');

const config = { apiKey: process.env.OPENAI_API_KEY };

// 开发启用本地代理
if (process.env.NODE_ENV === 'development') {
  const httpAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
  config.httpAgent = httpAgent;
}

const openai = new OpenAIApi(config);

exports.ask = async (req, res, next) => {
  const { content } = req.body;
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content }],
    model: 'gpt-3.5-turbo',
  });

  res.status(200).json({
    status: 200,
    data: completion.choices[0],
  });
};
