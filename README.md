# PUPPAKA - Personal Blog & Portfolio

A modern, dark-themed personal website built with Node.js, Express, and SQLite.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## ✨ Features

- 🎨 **Dark Tech Theme** - Modern, sleek dark interface with gradient accents
- 📝 **Blog System** - Create, edit, and manage blog posts with Markdown support
- 🎨 **Portfolio Gallery** - Showcase projects with image galleries
- 🔐 **Admin Dashboard** - Secure backend for content management
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Fast Performance** - Optimized for speed with compression and caching
- 🔒 **Security First** - Helmet, rate limiting, and input sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Lingjie001/puppaka.git
cd puppaka

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**⚠️ Important**: Change the default password after first login!

## 📁 Project Structure

```
puppaka/
├── server.js           # Main application entry
├── database.js         # SQLite database operations
├── package.json        # Dependencies and scripts
├── routes/
│   ├── admin.js       # Admin dashboard routes
│   └── api.js         # API endpoints
├── views/             # EJS templates
│   ├── index.ejs      # Homepage
│   ├── blog.ejs       # Blog listing
│   ├── post.ejs       # Single post
│   ├── portfolio.ejs  # Portfolio page
│   ├── project.ejs    # Single project
│   ├── about.ejs      # About page
│   ├── contact.ejs    # Contact page
│   ├── error.ejs      # Error page
│   └── admin/         # Admin templates
├── public/            # Static assets
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript files
├── uploads/          # Uploaded images
└── data/             # SQLite database
```

## 🛠️ Technologies

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Template Engine**: EJS
- **Styling**: Custom CSS with CSS Variables
- **Authentication**: bcryptjs, express-session
- **File Upload**: multer
- **Security**: helmet, express-rate-limit

## 📝 Content Management

### Creating Blog Posts
1. Login to `/admin`
2. Navigate to "Posts" → "New Post"
3. Fill in title, slug, content, and optional featured image
4. Save and publish

### Adding Projects
1. Login to `/admin`
2. Navigate to "Projects" → "New Project"
3. Add project details, images, and links
4. Save and publish

## 🎨 Customization

### Colors
Edit CSS variables in `public/css/style.css`:

```css
:root {
  --accent-primary: #6366f1;    /* Primary brand color */
  --accent-secondary: #8b5cf6;  /* Secondary color */
  --bg-primary: #0a0a0f;        /* Background */
  --text-primary: #ffffff;      /* Text color */
}
```

### Fonts
The default fonts are:
- **Inter** for body text
- **JetBrains Mono** for code

Change in `views/layout.ejs` Google Fonts link.

## 🚀 Deployment

### Hostinger Node.js Hosting

1. Push code to GitHub
2. In Hostinger, select "Node.js Web Application"
3. Choose "Deploy from GitHub"
4. Connect your GitHub account
5. Select this repository
6. Set environment variables:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secret-key-here
   ```
7. Deploy!

### Environment Variables

```bash
PORT=3000                    # Server port
NODE_ENV=production          # Environment
SESSION_SECRET=your-secret   # Session secret key
```

## 🔒 Security

- Always change default admin password
- Use strong session secret in production
- Keep dependencies updated
- Regular backups of `data/puppaka.db`

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Credits

Built with ❤️ by [Lingjie001](https://github.com/Lingjie001)

Domain: [puppaka.com](https://puppaka.com)

---

## 🔄 Auto Deploy Test

**Last Deploy Test**: 2026-02-08 03:30 UTC
**Status**: ✅ Auto-deploy is working!
**Next Check**: Every 3 minutes via cron