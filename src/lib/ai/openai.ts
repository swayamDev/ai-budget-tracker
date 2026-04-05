import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFinancialInsights(transactions: any[]): Promise<string> {
  if (!transactions.length) {
    return 'No transactions found. Start tracking your expenses to get AI insights!';
  }

  const summary = transactions
    .slice(0, 50)
    .map((t) => `${t.type} $${t.amount} on ${t.category} (${new Date(t.date).toLocaleDateString()})${t.note ? ` - ${t.note}` : ''}`)
    .join('\n');

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const prompt = `You are a friendly financial advisor AI. Analyze the following financial transactions and provide 3-4 specific, actionable insights. Be concise, direct, and supportive. Format with bullet points using "•".

Financial Overview:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Net Balance: $${(totalIncome - totalExpense).toFixed(2)}

Recent Transactions:
${summary}

Provide insights about:
1. Spending patterns and notable trends
2. Areas where they're doing well
3. Specific recommendations to improve finances
4. Any warnings or concerns

Keep it friendly, specific, and under 200 words.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? 'Unable to generate insights at this time.';
}

export async function categorizeTransaction(note: string): Promise<string> {
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Home',
    'Salary',
    'Business',
    'Investment',
    'Gift',
    'Other',
  ];

  const prompt = `Classify this transaction into exactly one of these categories: ${categories.join(', ')}.

Transaction description: "${note}"

Reply with ONLY the category name, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 20,
    temperature: 0,
  });

  const result = response.choices[0]?.message?.content?.trim() ?? 'Other';
  return categories.includes(result) ? result : 'Other';
}

export async function chatWithFinancialAdvisor(
  message: string,
  context: { income: number; expense: number; balance: number; recentTransactions: any[] }
): Promise<string> {
  const systemPrompt = `You are an expert personal financial advisor AI assistant. You have access to the user's financial data and provide personalized, actionable advice.

User's Financial Context:
- Monthly Income: $${context.income.toFixed(2)}
- Monthly Expenses: $${context.expense.toFixed(2)}
- Current Balance: $${context.balance.toFixed(2)}
- Recent transactions: ${context.recentTransactions
    .slice(0, 10)
    .map((t) => `${t.type} $${t.amount} on ${t.category}`)
    .join(', ')}

Be helpful, specific, and encouraging. Keep responses concise (under 150 words). Use numbers from their data when relevant.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    max_tokens: 300,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? 'I apologize, I could not process your request.';
}

export async function predictFutureExpenses(transactions: any[]): Promise<string> {
  if (transactions.length < 5) {
    return 'Add more transactions to get spending predictions.';
  }

  const last30Days = transactions.filter((t) => {
    const date = new Date(t.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });

  const byCategory: Record<string, number> = {};
  for (const t of last30Days.filter((t) => t.type === 'EXPENSE')) {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  }

  const prompt = `Based on these spending patterns from the last 30 days:
${Object.entries(byCategory)
  .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
  .join('\n')}

Predict next month's likely expenses and give 2-3 specific tips to reduce spending. Keep it under 120 words with bullet points.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 250,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? 'Unable to predict expenses.';
}
