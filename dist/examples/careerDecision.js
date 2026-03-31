"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.careerDecision = void 0;
const Decision_1 = require("../models/Decision");
/**
 * Example: Should I take the startup job or stay at BigCo?
 * A classic career decision with uncertainty
 */
exports.careerDecision = new Decision_1.Decision('Should I join the startup or stay at BigCo?', [
    {
        name: 'Join Startup',
        description: 'Take a 20% pay cut for equity upside',
        context: 'Series A startup, strong team, competitive market',
        outcomes: [
            {
                name: 'Startup succeeds (exit in 5 years)',
                probability: 0.15,
                value: 800000,
                description: 'IPO or acquisition, equity vests and is worth $800k'
            },
            {
                name: 'Startup does okay (acquihire in 3 years)',
                probability: 0.25,
                value: 150000,
                description: 'Modest exit, some equity value + experience gained'
            },
            {
                name: 'Startup fails (shuts down in 2 years)',
                probability: 0.45,
                value: -100000,
                description: 'Lost opportunity cost + pay cut, but learned a lot'
            },
            {
                name: 'Startup plateaus (still there in 5 years)',
                probability: 0.15,
                value: -50000,
                description: 'Company survives but equity never materializes'
            }
        ],
        assumptions: [
            'Startup equity converts at current valuation',
            'Market conditions remain favorable',
            'I can find another job if startup fails',
            'Valuing learning/autonomy purely financially (might undervalue)'
        ]
    },
    {
        name: 'Stay at BigCo',
        description: 'Reliable salary, slower growth, known entity',
        context: 'Established tech company, clear promotion path',
        outcomes: [
            {
                name: 'Get promoted in 2 years',
                probability: 0.40,
                value: 200000,
                description: 'Senior role, $40k raise + RSUs'
            },
            {
                name: 'Stay at current level',
                probability: 0.50,
                value: 100000,
                description: 'Annual raises, steady income, no surprises'
            },
            {
                name: 'Layoffs / stagnation',
                probability: 0.10,
                value: 0,
                description: 'Get laid off or feel stuck, need to job search'
            }
        ],
        assumptions: [
            'Company remains stable',
            'Current market comp holds steady',
            'Promotion timeline is realistic based on peer data',
            'Not accounting for boredom/fulfillment (harder to quantify)'
        ]
    }
], [
    'Financial EV is only one dimension - what about learning, autonomy, and mission?',
    'How risk-averse are you? Startup has higher variance.',
    'What\'s your financial runway if things go wrong?',
    'Can you afford to take the pay cut in the short term?',
    'How much do you value the optionality of startup experience?'
]);
