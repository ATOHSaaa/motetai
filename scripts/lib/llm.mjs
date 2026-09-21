const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function generateText({ system, user, apiKey, model = DEFAULT_MODEL, maxTokens = 16000 }) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY が設定されていません');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ARTICLE_MODEL || model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data.content?.find((block) => block.type === 'text')?.text;
  if (!text) {
    throw new Error('Anthropic API からテキストが返りませんでした');
  }

  return text.trim();
}
