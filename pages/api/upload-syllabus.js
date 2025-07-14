import formidable from 'formidable';
import fs from 'fs';
import pool from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing the file' });
    }
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
      // Only handle TXT for now
      if (file.mimetype === 'text/plain') {
        const content = fs.readFileSync(file.filepath, 'utf8');
        await pool.query(
          'INSERT INTO syllabi (filename, file_content) VALUES ($1, $2)',
          [file.originalFilename, content]
        );
        return res.status(200).json({ message: 'File uploaded and saved!' });
      } else {
        return res.status(400).json({ error: 'Only .txt files are supported for now.' });
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save file info.' });
    }
  });
} 