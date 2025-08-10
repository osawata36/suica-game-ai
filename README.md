# Suica Game AI

A web-based physics game inspired by the popular Suica (watermelon) game. Drop fruits to merge them and create bigger fruits while avoiding the danger line.

## Features

- Physics-based gameplay with realistic fruit merging
- Touch and mouse controls
- Responsive design for mobile and desktop
- Detailed fruit illustrations with unique visual effects
- Progressive difficulty with 11 different fruit types

## Game Controls

- **Desktop**: Move mouse to position, click to drop fruit
- **Mobile**: Touch to position and drop fruit
- **Keyboard**: Arrow keys to move, Space or Down arrow to drop

## Deployment

This app is automatically deployed to Netlify when changes are pushed to the main branch.

### Setup Instructions

1. Fork this repository
2. Create a Netlify account and link your GitHub repository
3. Add the following secrets to your GitHub repository:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

### Local Development

Simply open `index.html` in your browser or use a local web server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`

## Technology Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS for responsive styling
- No external dependencies

## License

MIT License
