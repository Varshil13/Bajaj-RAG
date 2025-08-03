# RAG Frontend

A modern, professional React TypeScript frontend for Retrieval-Augmented Generation (RAG) applications.

## Features

- 🤖 **Intelligent Chat Interface** - Clean, modern UI for interacting with your RAG backend
- 🎨 **Professional Design** - Built with Tailwind CSS for a polished, responsive experience
- ⚡ **Fast & Modern** - Powered by Vite for lightning-fast development and builds
- 🔒 **Type Safe** - Full TypeScript support for better development experience
- 🌐 **API Integration** - Seamless connection to your RAG backend on localhost:3000
- 📱 **Responsive** - Works beautifully on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 18+ 
- Your RAG backend running on `localhost:3000` with an `/ask` endpoint

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to see your RAG frontend in action!

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx    # Main chat component
│   └── Header.tsx          # Application header
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles with Tailwind
```

## Backend API Integration

The frontend expects your backend to have a `/ask` endpoint that:
- Accepts POST requests
- Receives JSON with a `question` field
- Returns JSON with a `response`, `answer`, `result`, or `message` field

Example backend endpoint:
```javascript
app.post('/ask', (req, res) => {
  const { question } = req.body;
  // Your RAG logic here
  res.json({ response: "Your AI-generated answer" });
});
```

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience  
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icons

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Styling
The app uses Tailwind CSS with a custom color scheme. You can modify the theme in `tailwind.config.js`.

### API Configuration
Update the API endpoint in `src/components/ChatInterface.tsx` if your backend runs on a different port or path.

### Features to Add
- User authentication
- Chat history persistence
- File upload for document ingestion
- Multiple conversation threads
- Export chat functionality

## Troubleshooting

**Can't connect to backend?**
- Ensure your backend is running on `localhost:3000`
- Check that the `/ask` endpoint exists
- Verify CORS is properly configured on your backend

**Styling issues?**
- Make sure Tailwind CSS is properly configured
- Check that PostCSS is processing the styles correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own RAG applications!
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
