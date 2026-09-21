import { LearnArticle } from '@/types';

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: 'what-is-sip',
    title: 'What is a Systematic Investment Plan (SIP)? Complete Guide for Beginners',
    metaDescription: 'Understand how Systematic Investment Plans (SIP) work in mutual funds, the benefits of rupee cost averaging, and how compounding creates long-term wealth.',
    readingTime: '5 min read',
    category: 'Mutual Funds & Investing',
    publishedDate: '2026-01-15',
    updatedDate: '2026-09-01',
    summary: 'A Systematic Investment Plan (SIP) is a disciplined method of investing a fixed sum of money into mutual funds at regular intervals, eliminating the need to time the stock market.',
    content: [
      {
        heading: 'Introduction to Systematic Investment Plans',
        paragraphs: [
          'A Systematic Investment Plan, commonly known as a SIP, allows investors to commit a predetermined amount of money at fixed intervals—usually monthly, quarterly, or weekly—into a chosen mutual fund scheme.',
          'Instead of waiting to accumulate a large sum of cash before deploying it into capital markets, a SIP lets you begin investing with as little as ₹500 per month. This accessibility democratizes wealth creation for retail investors.',
        ],
        bulletPoints: [
          'Enforces regular financial discipline and automated savings.',
          'Removes the psychological anxiety of trying to time market tops and bottoms.',
          'Harnesses the twin mathematical principles of Rupee Cost Averaging and Compounding.',
        ],
      },
      {
        heading: 'How Rupee Cost Averaging Works',
        paragraphs: [
          'Market prices fluctuate constantly. When NAVs (Net Asset Values) decline during market downturns, your fixed SIP installment buys more mutual fund units. Conversely, when markets rise, your fixed installment buys fewer units.',
          'Over a market cycle of 5 to 10 years, this automatic mechanism averages down the net acquisition cost per unit without requiring emotional decision-making or technical chart analysis.',
        ],
      },
      {
        heading: 'The Power of Compounding Over Time',
        paragraphs: [
          'Albert Einstein famously referred to compound interest as the eighth wonder of the world. In an equity mutual fund SIP, returns earned in earlier years are reinvested to generate their own returns.',
          'In the first five years of a SIP, most of your total portfolio balance consists of your own principal contributions. Beyond year 10, the compounded capital gains dwarf your initial outlays.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is SIP better than Lumpsum?',
        answer: 'SIP is generally superior for salaried individuals receiving monthly cash flows and those looking to mitigate volatility. Lumpsum can be effective when deploying windfalls during marked market corrections.',
      },
      {
        question: 'Can I pause or stop my SIP?',
        answer: 'Yes, SIPs are entirely flexible. You can pause or stop your SIP anytime without any financial penalties or loss of previously accumulated units.',
      },
    ],
    relatedCalculators: ['sip', 'lumpsum', 'cagr'],
    relatedArticles: ['sip-vs-lumpsum', 'what-is-compound-interest', 'what-is-cagr'],
  },
  {
    slug: 'what-is-cagr',
    title: 'What is CAGR? How to Measure Compound Annual Growth Rate',
    metaDescription: 'Learn how to calculate and interpret Compound Annual Growth Rate (CAGR) to accurately compare multi-year investment returns across stocks, funds, and real estate.',
    readingTime: '6 min read',
    category: 'Financial Metrics',
    publishedDate: '2026-02-10',
    updatedDate: '2026-09-05',
    summary: 'Compound Annual Growth Rate (CAGR) represents the annualized rate of return that would be required for an investment to grow from its beginning balance to its ending balance.',
    content: [
      {
        heading: 'Why Absolute Return is Misleading',
        paragraphs: [
          'If someone tells you an investment generated a 100% absolute return, it sounds extraordinary. But if it took 20 years to achieve that 100% gain, the annualized rate of return is actually just ~3.53%—well below inflation.',
          'CAGR solves this distortion by smoothing out yearly volatility and providing a standardized annual percentage rate, allowing apples-to-apples comparisons between different asset classes.',
        ],
      },
      {
        heading: 'The Mathematical Formula for CAGR',
        paragraphs: [
          'CAGR = [(Ending Value / Beginning Value)^(1 / Years)] - 1',
          'Notice that the formula only takes into account the starting capital, final portfolio value, and the elapsed time. It assumes all intermediate dividends and profits were continuously reinvested.',
        ],
      },
      {
        heading: 'Limitations of CAGR',
        paragraphs: [
          'While CAGR is an indispensable metric, it does not depict the path taken. A portfolio that grew steadily at 12% per year has the exact same CAGR as a volatile fund that fell 40% in year one and doubled in year two.',
          'Additionally, CAGR cannot account for ongoing periodic contributions or staggered withdrawals. For staggered cash flows, XIRR must be used instead.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is considered a good CAGR in India?',
        answer: 'Historically, broad Indian equity indices (Nifty 50, BSE Sensex) have delivered 11% to 14% long-term CAGR. Fixed deposits yield 6% to 7.5% nominal CAGR.',
      },
      {
        question: 'Can CAGR be negative?',
        answer: 'Yes, if your investment’s terminal value is lower than your initial investment, the resulting CAGR will be negative.',
      },
    ],
    relatedCalculators: ['cagr', 'xirr', 'lumpsum'],
    relatedArticles: ['what-is-xirr', 'what-is-sip', 'what-is-compound-interest'],
  },
  {
    slug: 'what-is-xirr',
    title: 'What is XIRR? Understanding Extended Internal Rate of Return',
    metaDescription: 'Discover why XIRR is the most accurate metric for tracking real-world mutual fund SIPs, dividend reinvestments, and irregular cash flows.',
    readingTime: '7 min read',
    category: 'Financial Metrics',
    publishedDate: '2026-02-18',
    updatedDate: '2026-09-08',
    summary: 'Extended Internal Rate of Return (XIRR) is an annualized return metric tailored for portfolios with multiple, irregular cash inflows and outflows across specific dates.',
    content: [
      {
        heading: 'The Problem with Simple Return and CAGR in Real Portfolios',
        paragraphs: [
          'In personal finance, rarely does an individual invest money once and never touch it again. Most people invest monthly through SIPs, receive occasional dividend payouts, make opportunistic lumpsum additions, and periodically withdraw funds.',
          'Because money enters and leaves the portfolio at different times, CAGR cannot accurately represent your true annualized yield. XIRR solves this by weighting each cash flow by its precise calendar day.',
        ],
      },
      {
        heading: 'How XIRR Works Mathematically',
        paragraphs: [
          'XIRR is mathematically equivalent to the discount rate at which the Net Present Value (NPV) of all past cash inflows (investments) and the current terminal portfolio value equals zero.',
          'Because the formula involves high-degree polynomials, it cannot be solved with basic algebra; software like WealthTrack utilizes iterative numerical methods such as the Newton-Raphson method to solve it.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why does my mutual fund app show XIRR instead of CAGR?',
        answer: 'Because monthly SIP installments mean each installment has been invested for a different duration. XIRR is the industry standard for measuring multi-cashflow performance.',
      },
    ],
    relatedCalculators: ['xirr', 'cagr', 'sip'],
    relatedArticles: ['what-is-cagr', 'what-is-sip'],
  },
  {
    slug: 'what-is-compound-interest',
    title: 'What is Compound Interest? The Engine of Exponential Wealth',
    metaDescription: 'Master compound interest: discover how interest earned on interest accelerates long-term savings, and how compounding frequencies impact your final returns.',
    readingTime: '5 min read',
    category: 'Foundations of Finance',
    publishedDate: '2026-01-20',
    updatedDate: '2026-09-10',
    summary: 'Compound interest is the addition of interest to the principal sum of a loan or deposit, meaning you earn interest on both your original capital and accumulated past interest.',
    content: [
      {
        heading: 'Simple Interest vs Compound Interest',
        paragraphs: [
          'With simple interest, you only earn interest on your initial principal. If you deposit ₹1,00,000 at 10% simple interest, you receive ₹10,000 every single year.',
          'With compound interest, the ₹10,000 earned in year one becomes part of your earning asset base in year two. You earn 10% on ₹1,10,000 (₹11,000), then on ₹1,21,000, and so on.',
        ],
      },
      {
        heading: 'The Critical Factor: Time Horizon',
        paragraphs: [
          'The compounding curve is exponential, not linear. In the early years, the growth appears modest. But as the decades progress, the curve steepens dramatically.',
          'Starting to save at age 25 rather than 35 can literally result in double or triple the net worth at retirement, even if you invest less total principal.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the Rule of 72?',
        answer: 'Divide 72 by your annual interest rate to approximate how many years it will take to double your money. At 12% return, your money doubles in ~6 years (72 / 12).',
      },
    ],
    relatedCalculators: ['compound-interest', 'fd', 'sip', 'ppf'],
    relatedArticles: ['fd-vs-rd', 'what-is-sip', 'principal-vs-interest'],
  },
  {
    slug: 'what-is-inflation',
    title: 'What is Inflation? Protecting Your Purchasing Power Over Time',
    metaDescription: 'Understand how inflation quietly erodes your purchasing power, why keeping idle cash in bank accounts destroys real wealth, and how to beat inflation.',
    readingTime: '6 min read',
    category: 'Economics & Wealth',
    publishedDate: '2026-02-05',
    updatedDate: '2026-09-12',
    summary: 'Inflation is the rate at which the general level of prices for goods and services is rising, eroding the purchasing power of your money year after year.',
    content: [
      {
        heading: 'The Silent Tax on Cash',
        paragraphs: [
          'If an annual inflation rate is 6%, an item that costs ₹100 today will cost ₹106 next year. In 12 years, the price will have doubled to ₹200.',
          'If your money sits in a standard savings account earning 3% while inflation is 6%, your real return is -3% annually. You are losing purchasing power despite seeing a higher nominal bank balance.',
        ],
      },
      {
        heading: 'Real Returns vs Nominal Returns',
        paragraphs: [
          'Nominal return is the stated percentage gain on your investment. Real return is what remains after subtracting the inflation rate: Real Return ≈ Nominal Return - Inflation.',
          'To build genuine intergenerational wealth, your capital must be deployed in assets that outpace headline consumer inflation over long periods.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What asset classes beat inflation best?',
        answer: 'Historically, productive businesses (equities), prime real estate, and inflation-indexed bonds have reliably outperformed inflation over multi-decade periods.',
      },
    ],
    relatedCalculators: ['inflation', 'sip', 'emergency-fund'],
    relatedArticles: ['what-is-emergency-fund', 'what-is-net-worth'],
  },
  {
    slug: 'what-is-emergency-fund',
    title: 'What is an Emergency Fund? Building Your Financial Fortress',
    metaDescription: 'Learn why an emergency fund is step zero of financial planning, how many months of expenses to hold, and the best places to store liquid emergency cash.',
    readingTime: '6 min read',
    category: 'Personal Finance Foundations',
    publishedDate: '2026-01-25',
    updatedDate: '2026-09-14',
    summary: 'An emergency fund is a dedicated pool of liquid cash set aside to cover unexpected life emergencies such as medical crises, sudden job loss, or critical car/home repairs.',
    content: [
      {
        heading: 'Why Every Financial Plan Begins with an Emergency Fund',
        paragraphs: [
          'Without an emergency fund, unexpected expenses force you to borrow money at punitive interest rates (credit cards, personal loans) or prematurely liquidate investments at market lows.',
          'An emergency fund gives you emotional peace of mind and prevents life’s inevitable hiccups from derailing your long-term wealth trajectory.',
        ],
      },
      {
        heading: 'How Much Should You Save?',
        paragraphs: [
          'The universal rule of thumb is 3 to 6 months of mandatory living expenses. If you work in a volatile industry, are self-employed, or are the sole earner in your family, aim for 9 to 12 months.',
          'Mandatory living expenses include rent or home loan EMI, groceries, utilities, children’s school tuition, insurance premiums, and minimum debt payments.',
        ],
      },
      {
        heading: 'Where to Park Emergency Funds',
        paragraphs: [
          'Liquidity and capital safety take priority over returns. Never put your emergency fund in volatile stocks, illiquid real estate, or high-risk crypto.',
          'Ideal vehicles include high-yield savings accounts, sweep-in fixed deposits, and ultra-short term or liquid debt mutual funds with instant redemption facilities.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should I invest my emergency fund in mutual funds?',
        answer: 'Only in low-volatility Liquid Debt Funds or Overnight Funds. Never in Equity Mutual Funds, as equity markets can drop 20-30% right when you need the money.',
      },
    ],
    relatedCalculators: ['emergency-fund', 'budget-50-30-20', 'savings'],
    relatedArticles: ['how-to-calculate-savings-rate', 'what-is-net-worth'],
  },
  {
    slug: 'what-is-net-worth',
    title: 'What is Net Worth? The Ultimate Measure of Financial Solvency',
    metaDescription: 'Understand what net worth means, the difference between assets and liabilities, and how to track your personal balance sheet over time.',
    readingTime: '5 min read',
    category: 'Financial Metrics',
    publishedDate: '2026-02-01',
    updatedDate: '2026-09-15',
    summary: 'Net worth is the total monetary value of everything you own (assets) minus everything you owe (liabilities). It is the single most accurate gauge of financial health.',
    content: [
      {
        heading: 'The Core Equation of Wealth',
        paragraphs: [
          'Net Worth = Total Assets - Total Liabilities',
          'High income does not equal high wealth. Someone earning ₹3,00,000 monthly who spends ₹2,90,000 on luxury leases and credit debt has a precarious net worth, while someone earning ₹80,000 who consistently invests can build substantial net worth.',
        ],
      },
      {
        heading: 'Categorizing Assets and Liabilities',
        paragraphs: [
          'Financial assets include bank balances, fixed deposits, mutual funds, EPF, PPF, NPS, stocks, and sovereign gold bonds. Physical assets include real estate and vehicles.',
          'Liabilities encompass home loans, vehicle loans, education loans, personal loans, and credit card balances.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can someone have a negative net worth?',
        answer: 'Yes, if you owe more in student or personal debt than the combined value of everything you own, your net worth is temporarily negative.',
      },
    ],
    relatedCalculators: ['net-worth', 'emergency-fund', 'budget-50-30-20'],
    relatedArticles: ['how-to-calculate-net-worth', 'principal-vs-interest'],
  },
  {
    slug: 'what-is-emi',
    title: 'What is EMI? How Equated Monthly Installments are Structured',
    metaDescription: 'Demystifying EMIs: discover how monthly installments work, how lenders calculate amortizations, and why early EMIs go almost entirely toward interest.',
    readingTime: '6 min read',
    category: 'Debt & Loans',
    publishedDate: '2026-02-14',
    updatedDate: '2026-09-16',
    summary: 'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender each month to repay a loan over a designated tenure.',
    content: [
      {
        heading: 'The Anatomy of an EMI',
        paragraphs: [
          'Every EMI payment consists of two distinct components: the principal repayment and the interest payment.',
          'In the initial years of a long-term loan (like a 20-year home loan), up to 70-80% of each EMI payment goes purely toward servicing interest. As the principal diminishes, the proportion shifts until the final payments consist almost entirely of principal.',
        ],
      },
      {
        heading: 'Fixed vs Floating Interest Rates',
        paragraphs: [
          'A fixed-rate loan maintains the exact same interest rate throughout the loan term, providing predictability. A floating-rate loan adjusts periodically according to the benchmark repo rate set by the Reserve Bank of India.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What happens if I miss an EMI?',
        answer: 'Missing an EMI incurs late payment fees, penalty interest, and significantly impairs your credit score (CIBIL/Experian), making future borrowing more expensive.',
      },
    ],
    relatedCalculators: ['emi', 'loan-prepayment', 'simple-interest'],
    relatedArticles: ['principal-vs-interest', 'how-to-calculate-emi'],
  },
  {
    slug: 'principal-vs-interest',
    title: 'Principal vs Interest: Understanding the Cost of Borrowing',
    metaDescription: 'Understand the difference between principal and interest in mortgages, car loans, and credit cards, and how to reduce total borrowing costs.',
    readingTime: '5 min read',
    category: 'Debt & Loans',
    publishedDate: '2026-02-22',
    updatedDate: '2026-09-17',
    summary: 'Principal is the exact sum of money borrowed from a lender, while interest is the monetary fee paid to the lender for the privilege of using their capital.',
    content: [
      {
        heading: 'Why Understanding the Difference Saves You Lakhs',
        paragraphs: [
          'When you borrow ₹50,00,000 for a home at 8.5% over 20 years, your total repayment is approximately ₹95,80,000. That means you pay nearly ₹45,80,000 in interest alone—almost equal to the original loan!',
          'Any extra payment you make toward principal reduces the outstanding balance immediately, eliminating the multi-year compound interest that would have otherwise accrued.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I ensure my prepayment goes to principal?',
        answer: 'Always instruct your lending institution in writing that additional payments must be credited directly against the principal balance rather than advancing future EMI dates.',
      },
    ],
    relatedCalculators: ['loan-prepayment', 'emi'],
    relatedArticles: ['what-is-emi', 'how-to-calculate-emi'],
  },
  {
    slug: 'fd-vs-rd',
    title: 'Fixed Deposit (FD) vs Recurring Deposit (RD): Which is Better for You?',
    metaDescription: 'A side-by-side comparison of Fixed Deposits and Recurring Deposits: interest rates, tax implications, liquidity, and which suits your cash flow.',
    readingTime: '6 min read',
    category: 'Savings & Banking',
    publishedDate: '2026-02-28',
    updatedDate: '2026-09-18',
    summary: 'Fixed Deposits require a lump-sum deposit for a fixed tenure, whereas Recurring Deposits allow you to deposit a fixed installment every month.',
    content: [
      {
        heading: 'Comparison at a Glance',
        paragraphs: [
          'If you have accumulated a one-time cash reserve (such as a yearly bonus or property sale proceeds), an FD locks in the prevailing interest rate immediately on the entire corpus.',
          'If you earn a regular salary and want to systematically allocate ₹5,000 or ₹10,000 every month with zero market risk, an RD automates your savings discipline.',
        ],
      },
      {
        heading: 'Taxation Rules',
        paragraphs: [
          'Interest earned on both FDs and RDs is fully taxable according to your applicable income tax slab rate. Banks will deduct TDS (Tax Deducted at Source) if interest earned exceeds statutory limits in a financial year.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I break an FD or RD before maturity?',
        answer: 'Yes, most banks permit premature withdrawal, usually charging a nominal penalty of 0.5% to 1% on the applicable interest rate.',
      },
    ],
    relatedCalculators: ['fd', 'rd', 'ppf'],
    relatedArticles: ['what-is-compound-interest', 'sip-vs-lumpsum'],
  },
  {
    slug: 'sip-vs-lumpsum',
    title: 'SIP vs Lumpsum Investment: When to Choose Which Strategy',
    metaDescription: 'Analyze whether Systematic Investment Plan (SIP) or Lumpsum investing delivers higher returns, and how to deploy large capital windfalls effectively.',
    readingTime: '6 min read',
    category: 'Mutual Funds & Investing',
    publishedDate: '2026-03-05',
    updatedDate: '2026-09-18',
    summary: 'While lumpsum investing historically captures higher gains during sustained bull markets, SIP protects investors from poor market timing and volatility.',
    content: [
      {
        heading: 'The Psychological Factor',
        paragraphs: [
          'Investing a large lump sum right before a market correction can cause severe emotional stress, leading investors to panic and sell at bottoms.',
          'SIP enforces peace of mind because falling markets allow you to accumulate more fund units at discounted valuations.',
        ],
      },
      {
        heading: 'The Systematic Transfer Plan (STP) Alternative',
        paragraphs: [
          'If you receive a large lump sum today, you do not have to choose between binary all-in or sitting in cash. You can park the funds in a safe Liquid Debt fund and set up a Systematic Transfer Plan (STP) into equity funds over 6 to 12 months.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does lumpsum always beat SIP in the long run?',
        answer: 'In a continually rising market, lumpsum wins because capital is deployed earlier. However, over real-world fluctuating cycles, SIP minimizes timing risk.',
      },
    ],
    relatedCalculators: ['sip', 'lumpsum', 'cagr'],
    relatedArticles: ['what-is-sip', 'what-is-cagr'],
  },
  {
    slug: 'how-to-calculate-savings-rate',
    title: 'How to Calculate Your Savings Rate: The Most Important Wealth KPI',
    metaDescription: 'Learn how to calculate your true personal savings rate, why it matters more than your gross income, and how to increase it systematically.',
    readingTime: '5 min read',
    category: 'Personal Finance Foundations',
    publishedDate: '2026-03-10',
    updatedDate: '2026-09-19',
    summary: 'Your savings rate is the percentage of your net take-home income that you preserve and invest for future wealth rather than consuming today.',
    content: [
      {
        heading: 'The Formula for Savings Rate',
        paragraphs: [
          'Savings Rate (%) = [(Net Income - Living Expenses - Discretionary Spending) / Net Income] × 100',
          'For example, if your net take-home income is ₹1,00,000 and your total monthly expenses equal ₹65,000, you save ₹35,000. Your savings rate is 35%.',
        ],
      },
      {
        heading: 'Why Savings Rate Determines Financial Freedom',
        paragraphs: [
          'The higher your savings rate, the fewer years of work you need to achieve financial independence. If you save 50% of your income, you save one year of living expenses for every single year you work.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is a healthy savings rate in India?',
        answer: 'A healthy savings rate is generally considered 20% to 30%. High-income earners or those pursuing early financial freedom aim for 40% to 60%.',
      },
    ],
    relatedCalculators: ['budget-50-30-20', 'savings', 'emergency-fund'],
    relatedArticles: ['what-is-emergency-fund', 'what-is-net-worth'],
  },
  {
    slug: 'how-to-calculate-net-worth',
    title: 'How to Calculate Your Personal Net Worth: Step-by-Step Balance Sheet',
    metaDescription: 'Step-by-step instructions on tallying your financial and physical assets, accounting for all liabilities, and monitoring your personal net worth trend.',
    readingTime: '6 min read',
    category: 'Financial Metrics',
    publishedDate: '2026-03-12',
    updatedDate: '2026-09-19',
    summary: 'A step-by-step practical guide to constructing your personal balance sheet, aggregating real assets, deducting liabilities, and tracking net worth.',
    content: [
      {
        heading: 'Step 1: Inventory All Your Assets',
        paragraphs: [
          'Divide your assets into liquid and illiquid. Liquid assets include cash, bank deposits, mutual funds, and gold. Illiquid assets include real estate and vehicles.',
          'Always use conservative current market estimates rather than emotional or inflated purchase costs.',
        ],
      },
      {
        heading: 'Step 2: Aggregate All Your Debts',
        paragraphs: [
          'List every liability: home loans, student loans, auto loans, personal loans, and all credit card balances.',
        ],
      },
      {
        heading: 'Step 3: Subtract Liabilities from Assets',
        paragraphs: [
          'Subtract your total liabilities from your total assets. WealthTrack automatically computes this for you on your dashboard and tracks its evolution month-over-month.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How often should I update my net worth?',
        answer: 'Updating your balance sheet once a month or once a quarter is ideal. Updating daily is counter-productive as short-term fluctuations create unnecessary noise.',
      },
    ],
    relatedCalculators: ['net-worth', 'emergency-fund'],
    relatedArticles: ['what-is-net-worth', 'how-to-calculate-savings-rate'],
  },
  {
    slug: 'how-to-calculate-emi',
    title: 'How to Calculate EMI: The Mathematical Formula Explained',
    metaDescription: 'Break down the exact mathematical formula used by commercial banks to calculate Equated Monthly Installments for loans.',
    readingTime: '5 min read',
    category: 'Debt & Loans',
    publishedDate: '2026-03-15',
    updatedDate: '2026-09-20',
    summary: 'Learn the exact amortization formula banks use to determine your monthly EMI payments, with manual step-by-step calculations.',
    content: [
      {
        heading: 'The Exact Banking Formula',
        paragraphs: [
          'EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]',
          'P = Principal loan amount',
          'r = Monthly interest rate (Annual rate / 12 / 100)',
          'n = Loan tenure in number of months',
        ],
      },
      {
        heading: 'Worked Manual Example',
        paragraphs: [
          'For a loan of ₹1,00,000 at 12% per annum for 1 year (12 months):',
          'r = 12 / 12 / 100 = 0.01 per month.',
          '(1 + 0.01)^12 = 1.126825.',
          'EMI = [100000 × 0.01 × 1.126825] / [1.126825 - 1] = 1126.825 / 0.126825 ≈ ₹8,885 per month.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can my EMI change during a floating rate loan?',
        answer: 'Yes. When the central bank hikes or cuts the benchmark repo rate, lenders typically adjust the remaining loan tenure, or occasionally adjust the monthly EMI amount.',
      },
    ],
    relatedCalculators: ['emi', 'loan-prepayment'],
    relatedArticles: ['what-is-emi', 'principal-vs-interest'],
  },
];
