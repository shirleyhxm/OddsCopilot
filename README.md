# ODDSMERA - Probability Copilot

> AI makes the probability math visible so you can decide better

<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" /> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />

## Philosophy

**Not "AI tells you what to decide," but "AI makes the probability math visible so you can decide better."**

Expected value is a theoretical tool that helps us think more clearly about the consequences of our actions. ODDSMERA sits at the line between rigorous probability math and human-friendly decision making — credible enough to trust, intuitive enough to actually use.

This product treats you like an adult. It doesn't tell you what to decide, doesn't pretend precision where there's uncertainty, and doesn't reduce complex human decisions to pure numbers. Instead, it makes the math transparent so you understand the tradeoffs, flags questionable assumptions so you think critically, and provides structure for decisions under uncertainty.

**Expected value is a flashlight, not a map.**

## Features

### 🎯 Transparent Expected Value Calculations
- Full probability breakdowns showing how probabilities and values combine
- Visual representations of outcome contributions
- Clear identification of what's driving the numbers

### ⚠️ Smart Warnings & Confidence Indicators
Automatically flags:
- Probabilities that don't sum to 100%
- Outcomes that dominate the expected value
- Tail risks (low probability, high impact events)
- High variance scenarios with low confidence

### 📊 Multi-Scenario Comparison
- Compare multiple options side-by-side
- Automated insights about what drives differences
- Sensitivity notes showing which assumptions matter most
- Adjustable probability sliders for intuitive exploration

### 🧠 Non-Prescriptive Approach
Explicitly reminds users that:
- EV is one dimension among many
- Non-quantifiable factors matter (fulfillment, learning, optionality)
- Risk tolerance matters
- Small changes in assumptions can flip rankings

## Project Structure

```
OddsCopilot/
├── src/                    # CLI version (Node.js)
│   ├── types.ts           # Core type definitions
│   ├── models/            # Outcome, Scenario, Decision classes
│   ├── engine/            # EV calculator, comparison engine
│   ├── examples/          # Pre-built decision examples
│   ├── cli.ts             # Interactive CLI interface
│   └── index.ts           # CLI entry point
│
└── web/                    # Web version (Next.js)
    ├── app/               # Next.js app directory
    │   ├── page.tsx       # Landing page (input interface)
    │   ├── analyze/       # Results page (scenario comparison)
    │   └── layout.tsx     # Root layout with fonts
    ├── lib/               # Shared probability engine
    │   ├── models/        # Core models (copied from CLI)
    │   ├── engine/        # Calculation engine
    │   └── examples/      # Example decisions
    └── tailwind.config.ts # Custom design system
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### CLI Version

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Run interactive demo
npm run dev

# Or run non-interactive demo
npm run demo
```

**CLI Commands:**
- `npm run dev` - Interactive mode with examples
- `npm run demo` - Non-interactive walkthrough
- `node dist/index.js compare` - Compare scenarios
- `node dist/index.js analyze` - Analyze single scenario

### Web Version

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Web Features:**
- 🎨 Beautiful dark theme with orange/amber accents
- 🎛️ Interactive probability sliders
- 📈 Real-time expected value updates
- 📱 Responsive design
- ✨ Smooth animations and transitions

## Design System

### Color Palette
```
Background:      #0a0a0a (near-black)
Surface:         #1a1a1a (dark gray)
Border:          #3a3a3a (medium gray)
Primary/Orange:  #f59e0b (amber)
Success/Green:   #10b981 (emerald)
Error/Red:       #ef4444 (red)
Text Primary:    #ffffff (white)
Text Secondary:  #a3a3a3 (light gray)
Text Muted:      #737373 (gray)
```

### Typography
- **Headlines**: Spectral (serif, elegant, italic for emphasis)
- **Body**: Inter (sans-serif, clean, highly readable)
- **Labels**: Uppercase with letter-spacing for hierarchy

## Example Decisions Included

### 1. Career: Startup vs BigCo
Models the uncertainty of startup equity and career growth:
- Multiple outcome scenarios (success, failure, acquihire, plateau)
- Transparent assumptions about probabilities
- Considerations beyond pure EV (learning, autonomy, risk tolerance)

### 2. Finance: $50k Bonus Investment
Compares four investment options:
- Index funds (diversified, medium risk)
- Pay down student loans (guaranteed return)
- Start side business (high risk/reward)
- Emergency fund (liquidity, peace of mind)

Each option shows both the math AND non-quantifiable considerations.

## How It Works

### Core Models

**Outcome**: A single possible result with a probability and value
```typescript
{
  name: "Startup succeeds",
  probability: 0.15,  // 15% chance
  value: 800000,      // $800k outcome
  description: "IPO or acquisition, equity vests"
}
```

**Scenario**: A decision option with multiple outcomes
```typescript
{
  name: "Join Startup",
  description: "Take 20% pay cut for equity upside",
  outcomes: [/* array of outcomes */],
  assumptions: [/* key assumptions */]
}
```

**Decision**: Collection of scenarios to compare
```typescript
{
  question: "Should I join the startup?",
  scenarios: [/* array of scenarios */],
  considerations: [/* non-financial factors */]
}
```

### Expected Value Calculation

```
EV = Σ (probability × value) for all outcomes

Example:
15% × $800k = $120k
25% × $150k = $37.5k
45% × -$100k = -$45k
15% × -$50k = -$7.5k
─────────────────────
EV = $105k
```

The system automatically:
- Calculates contribution of each outcome
- Identifies dominant outcomes (>50% of EV)
- Assesses confidence based on variance
- Warns about tail risks and questionable assumptions

## Development

### Tech Stack
- **CLI**: TypeScript, Commander.js, Inquirer, Chalk
- **Web**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Shared**: Core probability models and calculation engine

### Key Files
- `src/engine/ExpectedValueCalculator.ts` - Core EV calculation with warnings
- `src/engine/ComparisonEngine.ts` - Multi-scenario comparison logic
- `web/app/page.tsx` - Landing page with input interface
- `web/app/analyze/page.tsx` - Results page with visualizations

### Future Enhancements

- [ ] Custom decision builder (user-input scenarios)
- [ ] Uncertainty ranges (optimistic/pessimistic/baseline)
- [ ] Time-value of money calculations
- [ ] Monte Carlo simulation for complex decisions
- [ ] Export decisions to JSON
- [ ] Anthropic Claude API integration for AI-assisted scenario generation
- [ ] Collaboration features (share decisions)
- [ ] Mobile app

## Philosophy in Practice

### What ODDSMERA Does:
✅ Makes probability math visible and understandable
✅ Flags questionable assumptions
✅ Shows sensitivity to different estimates
✅ Provides structure for thinking about uncertainty
✅ Reminds you what it can't capture

### What ODDSMERA Doesn't Do:
❌ Tell you what to decide
❌ Pretend to be more precise than it is
❌ Reduce human decisions to pure numbers
❌ Ignore non-quantifiable factors
❌ Replace your judgment

### When to Use ODDSMERA:
- Career decisions with uncertain outcomes
- Investment choices with different risk profiles
- Major life changes with multiple scenarios
- Any decision where you're trading off probability × magnitude

### When NOT to Use ODDSMERA:
- Decisions driven primarily by values/ethics
- Situations where you're emotionally certain
- Choices with near-certain outcomes
- Decisions you've already made (confirmation bias risk)

## Contributing

This is a prototype. Contributions, feedback, and ideas are welcome!

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with the philosophy that good decision tools should:
1. Show their work
2. Be honest about uncertainty
3. Respect human judgment
4. Make thinking visible, not prescriptive

---

**Remember**: Expected value is a tool for thinking, not a directive. The goal is clarity about tradeoffs, not certainty about outcomes.
