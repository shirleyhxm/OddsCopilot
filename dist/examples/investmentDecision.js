"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentDecision = void 0;
const Decision_1 = require("../models/Decision");
/**
 * Example: How should I invest my bonus?
 * A financial decision with different risk profiles
 */
exports.investmentDecision = new Decision_1.Decision('How should I invest my $50k bonus?', [
    {
        name: 'Index Funds (S&P 500)',
        description: 'Low-cost, diversified, passive investment',
        context: '10-year time horizon, historical returns ~10% annually',
        outcomes: [
            {
                name: 'Bull market (7% annualized)',
                probability: 0.40,
                value: 48500,
                description: '~$98,500 total after 10 years'
            },
            {
                name: 'Average market (5% annualized)',
                probability: 0.45,
                value: 31500,
                description: '~$81,500 total after 10 years'
            },
            {
                name: 'Bear market (0% annualized)',
                probability: 0.15,
                value: 0,
                description: 'Break even after 10 years (inflation-adjusted loss)'
            }
        ],
        assumptions: [
            'Historical returns predict future (may not hold)',
            'Will hold for full 10 years (no panic selling)',
            'Inflation-adjusted returns',
            'No transaction costs or taxes considered here'
        ]
    },
    {
        name: 'Pay Down Student Loans',
        description: 'Guaranteed 6% return by eliminating debt',
        context: '$50k student loans at 6% interest',
        outcomes: [
            {
                name: 'Eliminate debt + save interest',
                probability: 1.0,
                value: 38000,
                description: 'Save ~$38k in interest over life of loan + psychological benefit'
            }
        ],
        assumptions: [
            'Will definitely pay down loans eventually',
            'Valuing debt elimination purely financially (peace of mind worth more?)',
            '6% guaranteed return vs. uncertain market returns',
            'Ignoring liquidity constraints - money is locked up once paid'
        ]
    },
    {
        name: 'Start Side Business',
        description: 'Invest in a side project with high risk/reward',
        context: 'E-commerce or SaaS product, need capital for MVP and marketing',
        outcomes: [
            {
                name: 'Business takes off',
                probability: 0.05,
                value: 200000,
                description: 'Build to $10k MRR, sell or keep growing'
            },
            {
                name: 'Modest success',
                probability: 0.15,
                value: 50000,
                description: 'Makes $30-50k over 3 years, decent side income'
            },
            {
                name: 'Break even / small loss',
                probability: 0.30,
                value: -10000,
                description: 'Doesn\'t scale, recover most capital, learn a lot'
            },
            {
                name: 'Significant loss',
                probability: 0.50,
                value: -35000,
                description: 'Business fails, most money spent on product/marketing'
            }
        ],
        assumptions: [
            'Have time/energy to work on side business',
            'Can execute on the idea (big assumption)',
            'Market exists for the product',
            'Learning value not fully captured in financial EV'
        ]
    },
    {
        name: 'Emergency Fund + Conservative Mix',
        description: 'Keep liquid for emergencies, rest in bonds/conservative',
        context: 'Currently have no emergency fund',
        outcomes: [
            {
                name: 'Use emergency fund (avoid debt)',
                probability: 0.30,
                value: 15000,
                description: 'Avoid $5k+ in credit card debt over 5 years'
            },
            {
                name: 'Don\'t need emergency fund',
                probability: 0.70,
                value: 8000,
                description: 'Conservative investments grow at ~3% over 10 years'
            }
        ],
        assumptions: [
            '30% chance of major expense in next 5 years (medical, car, etc)',
            'Would use high-interest credit cards if no emergency fund',
            'Lower returns but higher peace of mind',
            'Liquidity has value beyond pure returns'
        ]
    }
], [
    'What\'s your risk tolerance? Time horizon?',
    'Do you have emergency savings already?',
    'How stable is your income?',
    'Would losing this money significantly impact your life?',
    'Are there non-financial benefits (learning, optionality, peace of mind)?',
    'Can you split the bonus across multiple options?'
]);
