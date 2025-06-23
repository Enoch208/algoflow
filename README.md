# AlgoFlow 🚀

A sleek, modern chat application that converts algorithm descriptions into beautiful Mermaid flowchart diagrams using Google's Gemini AI. Built with Next.js and styled with the MIMOS color scheme.

## Features ✨

- **Smart Algorithm Detection**: Automatically detects when users describe algorithms or processes
- **AI-Powered Conversion**: Uses Google Gemini to convert natural language algorithms into Mermaid flowcharts
- **Beautiful Visualizations**: Clean, professional flowcharts with custom MIMOS styling
- **PNG Export**: Download generated diagrams as high-quality PNG images
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Chat Interface**: Smooth, modern chat experience

## MIMOS Color Scheme 🎨

- **Maroon**: `#b51a8a` (PANTONE 2415 C)
- **Grey**: `#616265` (PANTONE COOL GRAY 10 C)
- **White**: `#ffffff`
- **Black**: `#000000` (PANTONE BLACK C)
- **Silver**: `#c4c4c4` (PANTONE 877 C)

## Quick Start 🚀

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd algoflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage 💡

1. **Start a conversation**: Type any algorithm description in the chat
2. **Algorithm detection**: The app automatically detects algorithm-related content
3. **View flowchart**: Generated Mermaid diagrams appear instantly
4. **Download**: Click the download button to save diagrams as PNG files

### Example Prompts

Try these example algorithm descriptions:

```
"Create a bubble sort algorithm that sorts an array of numbers in ascending order"

"Binary search algorithm to find a target value in a sorted array"

"Breadth-first search to traverse a graph and find the shortest path"

"Quick sort algorithm with divide and conquer approach"
```

## Tech Stack 🛠️

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **AI**: Google Gemini Pro
- **Visualization**: Mermaid.js
- **Export**: html2canvas
- **Deployment**: Vercel (recommended)

## Project Structure 📁

```
algoflow/
├── app/
│   ├── api/
│   │   └── convert-algorithm/
│   │       └── route.ts          # Gemini API integration
│   ├── globals.css               # Custom MIMOS styling
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat interface
├── public/                       # Static assets
├── .env.local.example           # Environment template
└── README.md                    # This file
```

## Features in Detail 🔍

### Algorithm Detection
The app uses keyword matching and text analysis to identify:
- Algorithm descriptions
- Process explanations
- Step-by-step procedures
- Pseudocode
- Technical workflows

### Mermaid Integration
- Custom MIMOS theme colors
- Flowchart TD (top-down) format
- Proper node shapes and connections
- Clean, readable labels

### Export Functionality
- High-quality PNG export (2x scale)
- Transparent backgrounds
- Optimized for printing and sharing

## Deployment 🚀

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy** automatically on git push

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI
