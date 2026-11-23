import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  // Contact inquiry submission
  app.post('/api/contact', (req: Request, res: Response) => {
    const body = req.body as {
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      peopleCount?: unknown;
      category?: unknown;
      referral?: unknown;
      message?: unknown;
    };

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const peopleCount = typeof body?.peopleCount === 'string' ? body.peopleCount.trim() : '';
    const category = typeof body?.category === 'string' ? body.category.trim() : '';
    const referral = typeof body?.referral === 'string' ? body.referral.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (name.length < 2 || !email.includes('@') || message.length < 10) {
      res.status(400).json({
        error: 'Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und eine kurze Projektbeschreibung ein.',
      });
      return;
    }

    res.status(201).json({
      ok: true,
      reference: `MS-${Date.now().toString().slice(-6)}`,
      receivedCategory: category || 'Allgemeine Anfrage',
      receivedDetails: {
        hasPhone: phone.length > 0,
        peopleCount: peopleCount || undefined,
        hasReferral: referral.length > 0,
      },
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
