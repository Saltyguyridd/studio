'use server';
/**
 * @fileOverview AI Financial Insights Flow
 * Analyzes business invoices and expenses to provide a health summary and recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FinancialDataSchema = z.object({
  invoices: z.array(z.object({
    amount: z.number(),
    status: z.string(),
    customerName: z.string(),
  })),
  expenses: z.array(z.object({
    amount: z.number(),
    description: z.string(),
    category: z.string(),
  })),
});

export type FinancialData = z.infer<typeof FinancialDataSchema>;

const InsightOutputSchema = z.object({
  summary: z.string().describe('A brief overview of the financial health.'),
  recommendations: z.array(z.string()).describe('Actionable advice for the business.'),
  healthScore: z.number().min(0).max(100).describe('A score from 0-100 reflecting business health.'),
  cashFlowStatus: z.enum(['Positive', 'Critical', 'Stable']).describe('Current cash flow situation.'),
});

export type InsightOutput = z.infer<typeof InsightOutputSchema>;

const financialInsightsPrompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: { schema: FinancialDataSchema },
  output: { schema: InsightOutputSchema },
  prompt: `You are an expert financial auditor and business consultant. 
  Analyze the following financial data for a small business:
  
  INVOICES:
  {{#each invoices}}
  - {{customerName}}: ${{amount}} (Status: {{status}})
  {{/each}}
  
  EXPENSES:
  {{#each expenses}}
  - {{description}}: ${{amount}} (Category: {{category}})
  {{/each}}
  
  Provide a professional summary of their financial health, 3-5 specific recommendations to improve profitability or cash flow, a business health score (0-100), and a cash flow status.
  Be precise and use the data provided.`,
});

export async function getFinancialInsights(data: FinancialData): Promise<InsightOutput> {
  const { output } = await financialInsightsPrompt(data);
  if (!output) throw new Error('Failed to generate insights');
  return output;
}
