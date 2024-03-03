const OpenAIApi = require('openai');

//TODO: 这个process.env.OPENAI_API_KEY本地可以获取，线上就获取不到。。

// 开发环境配置
exports.setConfig = (req, res, next) => {
  // 配置key
  const config = { apiKey: process.env.OPENAI_API_KEY };
  // 开发启用本地代理
  if (process.env.NODE_ENV === 'development') {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const httpAgent = new HttpsProxyAgent('http://127.0.0.1:7890');
    config.httpAgent = httpAgent;
  }

  const openai = new OpenAIApi(config);
  // 将openai方法传递下去，存储在req对象中
  req.openai = openai;
  next();
};

// 询问方法
exports.ask = async (req, res, next) => {
  const { openai } = req;
  const { content } = req.body;
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content }],
    model: 'gpt-3.5-turbo',
  });

  res.status(200).json({
    data: completion.choices[0],
  });
};
