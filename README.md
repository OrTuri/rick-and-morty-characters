# Rick & Morty Character Collection

A modern Angular 18 app that lets you browse Rick and Morty characters from the API and create your own custom characters. Built with standalone components and Angular signals for a smooth, reactive experience.

## What it does

- **Browse characters** from the Rick and Morty API
- **Search** through characters by name, species, or status  
- **Create your own characters** with custom details and images
- **Edit and delete** your custom characters
- **Mark favorites** with a simple heart click
- **Three different views**: All characters, just your favorites, or only your custom ones

Your custom characters and favorites are saved locally, so they'll be there when you come back.

## Key Components

- **CharacterService** - Handles all the data stuff (API calls, local storage, state management)
- **CharacterCard** - The individual character cards you see in the grid
- **CharacterList** - Manages the grid layout and displays all the cards
- **CharacterForm** - The popup form for creating and editing characters
- **AppComponent** - Main container that ties everything together

## Tech Stack

- Angular 18 with standalone components
- Angular Signals for reactive state management
- RxJS for API handling and search
- Rick and Morty API for character data
- Local storage for persistence
- SCSS for styling

## Getting Started

First, clone the repository and install dependencies:

```bash
# Clone the repository
git clone <your-repo-url>
cd rick-and-morty-collection/character-collection

# Install dependencies
npm install

# Start the development server
nx serve

# Or if you prefer npm
npm start
```

The app will open at `http://localhost:4200`

## Project Structure

```
src/app/
├── components/
│   ├── character-card/     # Individual character display
│   ├── character-form/     # Create/edit character modal
│   └── character-list/     # Character grid layout
├── models/                 # TypeScript interfaces
├── services/              # Data management and API calls
└── app.component.*        # Main app shell
```

## Features Worth Noting

- **Custom characters appear first** in all views so you can easily see your creations
- **Smart search** with debouncing to avoid spamming the API
- **Responsive design** that works on mobile and desktop
- **Accessible** with proper ARIA labels and keyboard navigation
- **Error handling** for network issues and edge cases