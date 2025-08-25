import express from "express";
import { setupRoutes } from "./routes";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from 'fs'; // Import the fs module
import path from 'path'; // Import the path module

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Build frontend if dist doesn't exist
const distPath = join(__dirname, '../dist/public');
if (!fs.existsSync(distPath)) {
  console.log('Frontend build not found, building now...');
  try {
    require('child_process').execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to build frontend:', error);
  }
}

// Serve static files from the built client
app.use(express.static(distPath));

setupRoutes(app);

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run: npm run build');
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});