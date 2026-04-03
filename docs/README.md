# ODDSMERA - Web Interface

> AI makes the probability math visible so you can decide better

A beautiful, dark-themed web interface for AI-powered decision analysis with Anthropic Claude.

## Features

### 🎨 Beautiful Interface
- Dark theme with refined aesthetic
- Orange/amber accents (#f59e0b)
- Serif typography (Spectral) for headlines
- Sans-serif (Inter) for body text
- Smooth animations and transitions

### 🤖 AI-Powered Analysis
- Claude generates probability scenarios from natural language descriptions
- Transparent expected value calculations
- Evidence-based probability estimates with base rates and research
- Non-prescriptive insights that respect your judgment

### 🎛️ Interactive Exploration
- Adjustable probability sliders for each scenario
- Real-time visualization updates
- Generate deeper insights after adjusting probabilities
- Example decisions to explore

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Get an Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key (starts with `sk-ant-...`)
5. Copy your API key

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Step 1: Describe Your Decision

On the landing page, describe any life decision you're facing in natural language:

```
I have a job offer at a Series A startup — $20k pay cut but 0.5% equity.
My current FAANG salary is $190k. I'm 31, two kids, moderate savings.
Should I take it?
```

The more context you provide, the better Claude can analyze the probabilities.

### Step 2: Enter Your API Key

Paste your Anthropic API key. It's:
- Never stored on our servers
- Only sent directly to Anthropic's API
- Kept in your browser's session storage

You can test the connection before analyzing.

### Step 3: Get AI-Generated Scenarios

Click "Analyze →" and Claude will:
1. **Reframe** your decision as a probability question
2. **Generate 3-4 scenarios** with realistic probabilities
3. **Provide context** with base rates and research
4. **Calculate expected values** for each scenario
5. **Identify key factors** affecting the probabilities

### Step 4: Adjust Probabilities

On the analysis page, you'll see scenario cards with:
- Large probability percentages
- Detailed descriptions
- Interactive sliders to adjust probabilities
- Color-coded left borders (orange, green, red, yellow)

**Adjust the sliders** to match your intuition. The visualizations update in real-time.

### Step 5: Generate Insight

Once you've adjusted probabilities, click **"Generate insight →"** to get:
- Analysis of what the math reveals
- Sensitivity notes about key uncertainties
- Non-quantifiable factors to consider
- Balanced, non-prescriptive guidance

## Example Workflow

```
User: "Should I go to business school or stay in tech?"

Claude generates scenarios:
1. MBA → consulting (25%)
2. MBA → startup founder (15%)
3. Stay in tech → senior role (40%)
4. Stay in tech → stagnate (20%)

User adjusts probabilities based on their situation

Claude generates insight:
"The math shows staying in tech has higher expected value,
but that's driven heavily by your 40% estimate for promotion.
If you're burnt out or seeking career change, the MBA scenarios
offer optionality that's hard to quantify..."
```

## Philosophy

### What ODDSMERA Does
✅ Makes probability math visible and understandable
✅ Uses AI to estimate realistic probabilities with evidence
✅ Flags key uncertainties and sensitivities
✅ Provides structure for thinking under uncertainty
✅ Respects your judgment and autonomy

### What ODDSMERA Doesn't Do
❌ Tell you what to decide
❌ Pretend to be more precise than it is
❌ Reduce human decisions to pure numbers
❌ Ignore non-quantifiable factors
❌ Replace your judgment with AI

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (custom design system)
- **Anthropic Claude API** (Sonnet 4.5)
- **Framer Motion** (animations)

## API Routes

### POST /api/analyze
Generates probability scenarios from decision description.

**Request:**
```json
{
  "decision": "Should I join the startup?",
  "apiKey": "sk-ant-..."
}
```

**Response:**
```json
{
  "analysis": {
    "question": "Short version",
    "reframe": "Probability statement",
    "context": "Base rates and research",
    "scenarios": [...],
    "keyFactors": [...],
    "expectedValueScore": 5.4,
    "sensitivityNote": "Confidence assessment"
  }
}
```

### POST /api/generate-insight
Generates deeper analysis after probability adjustment.

**Request:**
```json
{
  "question": "The reframed question",
  "scenarios": [adjusted scenarios],
  "apiKey": "sk-ant-..."
}
```

**Response:**
```json
{
  "insight": "2-3 paragraph analysis..."
}
```

### POST /api/test-connection
Tests API key validity.

## Design System

### Colors
```
Background:      #0a0a0a (near-black)
Surface:         #1a1a1a (dark gray)
Border:          #3a3a3a (medium gray)
Primary/Orange:  #f59e0b (amber)
Success/Green:   #10b981 (emerald)
Error/Red:       #ef4444 (red)
Warning/Yellow:  #f59e0b (amber)
```

### Typography
- **Headlines**: Spectral (serif, elegant)
- **Body**: Inter (sans-serif, clean)
- **Labels**: Uppercase with letter-spacing

## Privacy & Security

- **API keys**: Never stored, only used client-side
- **Decisions**: Not logged or stored on servers
- **Data**: Sent only to Anthropic's API
- **Session**: Cleared when you close the browser

## Troubleshooting

### "Invalid API key" error
- Check that your key starts with `sk-ant-`
- Verify it's active at console.anthropic.com
- Try the "Test API connection" button

### Scenarios don't make sense
- Provide more context in your decision description
- Include specific numbers (salary, equity, timeframes)
- Mention relevant personal factors (family, savings, risk tolerance)

### Probabilities don't sum to 100%
- Adjust the sliders manually
- AI-generated probabilities are starting points
- Your intuition matters more than perfect math

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

This is a prototype. Contributions, feedback, and ideas are welcome!

## License

MIT License

---

**Remember**: Expected value is a tool for thinking, not a directive. The goal is clarity about tradeoffs, not certainty about outcomes.
