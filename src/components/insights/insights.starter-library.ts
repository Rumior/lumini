/**
 * Lumini starter guides: general, first-party educational content.
 * Marked "draft" (starter) until your team reviews them. No external citations.
 */
import type { LibraryResource } from "./insights.types";

const S = "Lumini starter guide";
const FIN = "Finance and money management";

export const starterLibrary: LibraryResource[] = [
  {
    id: "starter-cash-13wk", title: "Build a 13-week cash view", category: FIN, type: "playbook", status: "draft", source: S, timeLabel: "About 1 hour",
    description: "See each week's cash in and out, so a shortfall never surprises you.", tags: ["cash", "forecast", "payments"],
    body: { intro: "Profit is not cash. This view tracks when money actually moves.", steps: [
      { title: "Start with today's balance.", text: "Add up cash and bank balances you can spend now." },
      { title: "List expected receipts by week.", text: "Use invoice due dates and your usual customer payment delay, not the invoice date." },
      { title: "List payments by week.", text: "Rent, wages, supplier bills, loan repayments, taxes and owner drawings." },
      { title: "Calculate the closing balance.", text: "Opening balance plus receipts minus payments, week by week." },
      { title: "Mark weeks that go low.", text: "Plan early: chase payments, move supplier dates or hold back spending." } ],
      tip: "Update it every week. Replace guesses with actual figures as they arrive." },
  },
  {
    id: "starter-breakeven", title: "Find your break-even point", category: FIN, type: "guide", status: "draft", source: S, timeLabel: "20 minutes",
    description: "Work out how many sales cover your costs each month.", tags: ["break-even", "costs", "margin"],
    body: { intro: "Break-even is the sales volume where you make neither profit nor loss.", steps: [
      { title: "Add up monthly fixed costs.", text: "Costs that stay the same however much you sell, such as rent and salaries." },
      { title: "Find variable cost per unit.", text: "Materials, packaging, delivery and commission for one sale." },
      { title: "Subtract it from your price.", text: "The result is what each unit contributes toward fixed costs." },
      { title: "Divide fixed costs by that contribution.", text: "The answer is your break-even units per month." },
      { title: "Compare with real sales.", text: "If you sit close to it, small cost rises or sales dips matter a lot." } ],
    },
  },
  {
    id: "starter-pricing", title: "Price for margin, not guesswork", category: FIN, type: "checklist", status: "draft", source: S, timeLabel: "30 minutes",
    description: "Check that your prices cover true costs and leave a margin.", tags: ["price", "margin", "markup"],
    body: { intro: "Markup and margin are different. A 50% markup gives a 33% margin.", steps: [
      { title: "Cost each product fully.", text: "Include materials, labour, packaging, fees and delivery." },
      { title: "Decide the margin you need.", text: "Base it on covering fixed costs and leaving profit, not on habit." },
      { title: "Divide cost by (1 minus margin).", text: "For a 40% margin, price = cost ÷ 0.60." },
      { title: "Compare with customers' alternatives.", text: "Note what similar offers charge and what yours does better." },
      { title: "Test one change at a time.", text: "Watch volume and gross profit for a month before changing more." } ],
    },
  },
  {
    id: "starter-collect", title: "Get paid faster", category: "Sales and customers", type: "checklist", status: "draft", source: S, timeLabel: "15 minutes",
    description: "Practical steps to shorten the wait between a sale and the money.", tags: ["invoices", "receivables", "cash"],
    body: { intro: "Late payment is one of the most common causes of cash stress.", steps: [
      { title: "Invoice on delivery.", text: "Send it the same day, with clear amount, due date and how to pay." },
      { title: "State terms up front.", text: "Agree payment timing before work starts, in writing." },
      { title: "Ask for a deposit on larger jobs.", text: "Even 30–50% upfront reduces your risk." },
      { title: "Offer easy payment methods.", text: "Mobile money, bank transfer or card, whatever your customers already use." },
      { title: "Follow up on a schedule.", text: "A friendly reminder before the due date, then on it, then after." } ],
    },
  },
  {
    id: "starter-stock", title: "A simple stock count routine", category: "Operations and inventory", type: "guide", status: "draft", source: S, timeLabel: "30 minutes weekly",
    description: "Keep inventory records accurate and reorder before you run out.", tags: ["inventory", "stock", "reorder"],
    body: { intro: "Accurate stock records protect both sales and cash.", steps: [
      { title: "Split items by value.", text: "Count your fastest or most valuable items weekly, the rest monthly." },
      { title: "Count, then compare.", text: "Match the physical count to your records and note differences." },
      { title: "Find the cause of gaps.", text: "Check for damage, unrecorded sales, theft or data entry errors." },
      { title: "Set a reorder point.", text: "Average daily sales × supplier lead time, plus a safety buffer." },
      { title: "Flag slow movers.", text: "Stock that sits for long ties up cash. Consider a promotion or bundle." } ],
    },
  },
  {
    id: "starter-validate", title: "Test an idea before you spend", category: "Starting a business", type: "playbook", status: "draft", source: S, timeLabel: "1–2 weeks",
    description: "Learn whether people will pay before you invest heavily.", tags: ["idea", "customers", "start"],
    body: { intro: "Cheap tests beat big assumptions.", steps: [
      { title: "Name the customer and the problem.", text: "Write one sentence: who struggles with what, and how often." },
      { title: "Talk to ten likely customers.", text: "Ask how they handle it today and what it costs them. Do not pitch." },
      { title: "Offer something small.", text: "A pre-order, a trial batch or a paid pilot shows real interest." },
      { title: "Count real commitments.", text: "Payments and repeat requests matter more than compliments." },
      { title: "Decide what to do next.", text: "Continue, change the offer, or stop, based on what you saw." } ],
    },
  },
  {
    id: "starter-weekly-review", title: "A 30-minute weekly review", category: "Business planning and strategy", type: "checklist", status: "draft", source: S, timeLabel: "30 minutes weekly",
    description: "A short routine to check progress and choose next week's priorities.", tags: ["planning", "review", "habits"],
    body: { intro: "Small regular reviews catch problems early.", steps: [
      { title: "Check five numbers.", text: "Sales, cash balance, money owed to you, money you owe, and stock on hand." },
      { title: "Compare with last week.", text: "Note what moved and why." },
      { title: "Review open actions.", text: "Close, adjust or drop anything stuck." },
      { title: "Pick up to three priorities.", text: "Choose what will make the biggest difference next week." },
      { title: "Record one lesson.", text: "A line is enough. It builds a useful history." } ],
    },
  },
];
