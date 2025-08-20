import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import OpenAI from 'openai';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

try {
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Use JSON file for database
  const file = './db.json';
  const defaultData = { mangaLibrary: [] };
  const adapter = new JSONFile(file);
  const db = new Low(adapter, defaultData);

  // Read data from JSON file, this will be 'null' if file is empty
  await db.read();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.get('/api/status', (req, res) => {
    res.json({ message: 'Backend server is running!', timestamp: new Date() });
  });

  // AI Chatbot endpoint
  app.post('/api/ai-chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(400).json({ error: 'OpenAI API key not found. Please set it in the .env file.' });
    }

    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant for manga and anime. Provide concise and relevant information." },
          { role: "user", content: message }
        ],
      });
      res.json({ response: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.status(500).json({ error: 'Failed to get response from AI service.' });
    }
  });

  

const mangaSchema = z.object({
  id: z.string().optional(), // ID is optional for new manga
  malId: z.number().optional(),
  title: z.string(),
  coverImage: z.string().optional(),
  rating: z.number(),
  genres: z.array(z.string()),
  status: z.enum(['ongoing', 'completed', 'hold', 'hiatus']),
  type: z.enum(['manga', 'manhwa', 'manhua']),
  currentChapter: z.number(),
  totalChapters: z.number().optional(),
  currentVolume: z.number().optional(),
  totalVolumes: z.number().optional(),
  url: z.string().optional(),
  dateAdded: z.string().datetime().optional(), // Optional for new manga
  lastUpdated: z.string().datetime().optional(), // Optional for new manga
  notes: z.string().optional(),
  favorite: z.boolean(),
});

const partialMangaSchema = mangaSchema.partial();

  // Bulk Import endpoint
  app.post('/api/bulk-import', async (req, res) => {
    const mangaArray = req.body;

    const validationResult = z.array(mangaSchema).safeParse(mangaArray);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid manga data.', details: validationResult.error });
    }

    try {
      const currentLibrary = db.data.mangaLibrary || [];
      const newMangaEntries = validationResult.data.map(manga => ({
        ...manga,
        id: crypto.randomUUID(), // Generate new UUID for each imported manga
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }));

      db.data.mangaLibrary = [...currentLibrary, ...newMangaEntries];
      await db.write();
      res.json({ message: `Successfully imported ${newMangaEntries.length} manga entries.` });
    } catch (error) {
      console.error('Error during bulk import:', error);
      res.status(500).json({ error: 'Failed to perform bulk import.' });
    }
  });

  // GET all manga
  app.get('/api/manga', async (req, res) => {
    await db.read();
    res.json(db.data.mangaLibrary || []);
  });

  // GET manga by ID
  app.get('/api/manga/:id', async (req, res) => {
    await db.read();
    const manga = db.data.mangaLibrary.find(m => m.id === req.params.id);
    if (manga) {
      res.json(manga);
    } else {
      res.status(404).json({ message: 'Manga not found' });
    }
  });

  // POST add new manga
  app.post('/api/manga/add', async (req, res) => {
    const newMangaData = req.body;
    const validationResult = mangaSchema.safeParse(newMangaData);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid manga data.', details: validationResult.error });
    }

    const newManga = {
      ...validationResult.data,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await db.read();
    db.data.mangaLibrary.push(newManga);
    await db.write();
    res.status(201).json(newManga);
  });

  // PUT update manga
  app.put('/api/manga/update/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const validationResult = partialMangaSchema.safeParse(updates);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid manga data for update.', details: validationResult.error });
    }

    await db.read();
    const index = db.data.mangaLibrary.findIndex(m => m.id === id);

    if (index !== -1) {
      const updatedManga = {
        ...db.data.mangaLibrary[index],
        ...validationResult.data,
        lastUpdated: new Date().toISOString(),
      };

      db.data.mangaLibrary[index] = updatedManga;
      await db.write();
      res.json(updatedManga);
    } else {
      res.status(404).json({ message: 'Manga not found' });
    }
  });

  // DELETE manga
  app.delete('/api/manga/delete/:id', async (req, res) => {
    const { id } = req.params;

    await db.read();
    const initialLength = db.data.mangaLibrary.length;
    db.data.mangaLibrary = db.data.mangaLibrary.filter(m => m.id !== id);

    if (db.data.mangaLibrary.length < initialLength) {
      await db.write();
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ message: 'Manga not found' });
    }
  });

  console.log('Starting server...');
  // Start the server
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
} catch (error) {
  console.error('An unexpected error occurred:', error);
}