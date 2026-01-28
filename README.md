# Poker Range Analyzer

[![CI](https://github.com/Tyloo/poker-range-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/Tyloo/poker-range-analyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

A modern, interactive poker range analyzer for 6-max No-Limit Hold'em. Visualize GTO preflop ranges, calculate equity, and get action recommendations.

## Features

- **Interactive Card Picker** - Select your hole cards and board cards with an intuitive interface
- **GTO Preflop Ranges** - Position-based opening ranges for UTG, MP, CO, BTN, SB, and BB
- **Range Matrix Visualization** - Color-coded 13x13 matrix showing raise, call, and fold frequencies
- **Equity Calculator** - Monte Carlo simulation for equity vs villain's range
- **Action Recommendations** - Context-aware suggestions with sizing recommendations
- **Board Texture Analysis** - Identifies paired, monotone, two-tone, rainbow boards and connectivity
- **Hand Strength Evaluation** - Real-time made hand detection from high card to royal flush
- **Mobile Responsive** - Optimized layouts for both desktop and mobile devices

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library (Base UI primitives)
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/poker-range-analyzer.git
cd poker-range-analyzer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage

1. **Select Position** - Choose your table position (UTG, MP, CO, BTN, SB, BB)
2. **Pick Your Hand** - Click on two cards to select your hole cards
3. **Add Board Cards** - Switch to "Board" tab and select up to 5 community cards
4. **Analyze** - View your hand classification, equity, and recommended action

The range matrix on the right shows the complete opening range for your selected position with color coding:
- Green: Raise
- Blue: Call
- Yellow/Orange: Mixed strategy
- Gray: Fold

## Project Structure

```
range/
├── app/                  # Next.js app directory
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── CardPicker.tsx    # Card selection grid
│   ├── RangeMatrix.tsx   # 13x13 range visualization
│   ├── HandDisplay.tsx   # Selected hand display
│   ├── BoardDisplay.tsx  # Community cards display
│   └── AnalysisSummary.tsx # Equity and recommendations
└── lib/                  # Core logic
    ├── cards.ts          # Card utilities
    ├── equity.ts         # Monte Carlo equity calculator
    ├── handStrength.ts   # Hand evaluation
    ├── ranges/           # GTO range data by position
    └── types.ts          # TypeScript types
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
