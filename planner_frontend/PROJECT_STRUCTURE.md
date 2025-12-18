# Planner Frontend - Project Structure

## 📁 Folder Organization

```
planner_frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Header.js      # Navigation header
│   ├── pages/             # Page components (routes)
│   ├── layouts/           # Layout wrappers
│   ├── assets/            # Images, fonts, static files
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles + Tailwind
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── package.json
```

## 🎨 Theme Colors

All colors are defined in `tailwind.config.js`:

### Primary Colors
- `primary` - #2563EB (Blue-600)
- `primary-light` - #3B82F6 (Blue-500)
- `primary-dark` - #1D4ED8 (Blue-700)

### Background Colors
- `background` - #F9FAFB (Light gray)
- `background-soft` - #F3F4F6 (Gray-100)
- `background-dark` - #E5E7EB (Gray-200)

### Text Colors
- `heading` - #111827 (Almost black)
- `body` - #374151 (Gray-700)
- `muted` - #6B7280 (Gray-500)

### Status Colors
- `success` - #16A34A (Green)
- `warning` - #F59E0B (Amber)
- `danger` - #DC2626 (Red)

## 🚀 Usage Examples

### Using Theme Colors
```jsx
// Text colors
<h1 className="text-heading">Heading</h1>
<p className="text-body">Body text</p>
<span className="text-muted">Muted text</span>

// Background colors
<div className="bg-background">Light background</div>
<button className="bg-primary text-white">Primary button</button>

// Hover states
<button className="bg-primary hover:bg-primary-dark">
  Hover me
</button>
```

## 📝 Component Guidelines

1. **Keep components small and focused** - One responsibility per component
2. **Use semantic naming** - Clear, descriptive names
3. **Extract reusable logic** - Create custom hooks for shared logic
4. **Props validation** - Use PropTypes or TypeScript
5. **Consistent styling** - Use Tailwind utility classes

## 🔧 Development Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test
```

## 📦 Next Steps

- [ ] Install Tailwind CSS packages
- [ ] Add routing (react-router-dom)
- [ ] Create page components
- [ ] Add API service layer
- [ ] Implement authentication
