# LEADERS Summit 2025 - Alumni Networking Platform

## 🎓 Project Overview

An interactive alumni networking web application designed for the 2025 LEADERS Annual Summit with 155 attendees. Features dynamic "flying" cards that reposition based on filters, AI-powered natural language search, and comprehensive networking tools to facilitate meaningful connections.

## 🚀 Quick Start

### Local Development Server
Choose one of these methods to serve the files:

#### Option A: Python (Recommended)
```bash
cd alumni-networking-2025

# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option B: Node.js
```bash
# Install globally
npm install -g http-server

# Run server
cd alumni-networking-2025
http-server -p 3000
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 🔧 Troubleshooting

If the app is stuck on the loading screen:

1. **Check the debug page**: Visit `http://localhost:3000/test.html`
2. **Open browser console**: Press F12 and check for JavaScript errors
3. **Verify files are loading**: Check Network tab in browser dev tools

## ✨ Key Features

- **Flying Card System**: Alumni cards float and reposition dynamically
- **AI-Powered Search**: Natural language queries with voice search
- **Dynamic Filtering**: Industry, location, experience level filters
- **Mobile Responsive**: Optimized for tablets and phones
- **Accessibility**: Screen reader support and keyboard navigation

## 🎯 Sample Data

The application includes 5 sample alumni profiles for demonstration:
- Sarah Chen (Technology, San Francisco)
- Marcus Rodriguez (Finance, New York)
- Dr. Aisha Patel (Healthcare, Toronto)
- James Wilson (Education, London)
- Emily Zhang (Marketing, Singapore)

## 🔧 Configuration

### Adding Alumni Data
Edit `data/alumni.json` to add your own alumni profiles.

### OpenAI Integration (Optional)
To enable AI-powered search:
1. Get an OpenAI API key
2. Edit `js/search.js` line ~27:
```javascript
this.openAIApiKey = 'your-api-key-here';
this.useAI = true;
```

## 📊 Managing Alumni Data (New!)

### Easy CSV Updates! 🎉
**Your app now supports CSV files** - much easier than JSON!

1. **Edit** `data/alumni.csv` with Excel, Google Sheets, or any spreadsheet software
2. **Export/Save** as CSV 
3. **Refresh** browser - changes load automatically!

**CSV Format Example:**
```csv
id,name,photo,graduation_year,city,country,current_role,company,industry,expertise_tags,networking_goals,availability,attending_summit
alumni_001,Sarah Chen,👩‍💼,2022,San Francisco,USA,Senior Product Manager,TechCorp Inc,technology,"AI/ML,Product Strategy","mentorship,partnerships",available,true
```

📋 **See `CSV_FORMAT.md` for complete column documentation and examples**

### Data Loading Priority:
1. **CSV file** (`data/alumni.csv`) - **Recommended** ⭐
2. **JSON file** (`data/alumni.json`) - Fallback  
3. **Built-in sample data** - Emergency fallback

---

**Built for the LEADERS Summit 2025 Community**