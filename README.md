# Physics Wallah Clone

A modern online learning platform inspired by Physics Wallah, built with React frontend, Node.js backend, and MongoDB database.

## Features

- **Modern UI/UX**: Clean and responsive design matching Physics Wallah's interface
- **Course Management**: Browse and access various courses
- **Library System**: Access to short notes, mindmaps, and study materials
- **Search Functionality**: Search through courses and content
- **User Authentication**: Login system (ready for implementation)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- CSS3 with modern styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- JWT ready for authentication

## Project Structure

```
physics-wallah-clone/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Server entry point
│   ├── .env              # Environment variables
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd physics-wallah-clone
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `server/.env.example` to `server/.env`
   - Update MongoDB connection string in `server/.env`

4. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update connection string in `.env`

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Individual Commands

- **Backend only**: `npm run server`
- **Frontend only**: `npm run client`
- **Install backend deps**: `cd server && npm install`
- **Install frontend deps**: `cd client && npm install`

## API Endpoints

### Courses
- `GET /api/courses` - Get all available courses

### Library
- `GET /api/library` - Get library content (short notes, mindmaps)

## Features Implemented

### Home Page
- ✅ Company logo in top left
- ✅ Search box in center
- ✅ Login button in top right
- ✅ Left sidebar navigation
- ✅ Course grid display
- ✅ Featured content section

### Library Page
- ✅ Library navigation
- ✅ Short Notes section with carousel
- ✅ Mindmaps section
- ✅ PDF download functionality
- ✅ View Now buttons
- ✅ Responsive design

### Navigation
- ✅ Sidebar with Learn Online, Study Packs, and Offline sections
- ✅ Active state highlighting
- ✅ Responsive mobile navigation

## Customization

### Adding New Courses
Update the courses array in `server/index.js` or create a proper database model.

### Styling
- Main styles: `client/src/App.css`
- Global styles: `client/src/index.css`
- Component-specific styles are inline for better organization

### Adding New Pages
1. Create component in `client/src/components/`
2. Add route in `client/src/App.js`
3. Add navigation link in sidebar

## Future Enhancements

- [ ] User authentication and registration
- [ ] Course enrollment system
- [ ] Video player integration
- [ ] Progress tracking
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Real-time notifications
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development purposes.

## Support

For questions or support, please open an issue in the repository.
