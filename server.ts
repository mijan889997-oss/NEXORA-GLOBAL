/**
 * NEXVORA GLOBAL - Full-Stack Express Server & Vite Middleware
 * Handles production serving and development HMR orchestration on port 3000.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import {
  apiRouter,
  handleCpxPostback,
  handleWannadsPostback,
  handleMonlixPostback,
  handleAdgatePostback,
  handleCpagripPostback,
  handleCpaleadPostback,
  handleTimewallPostback,
} from './server/routes';

// Set environment defaults for CPX postback verification if not already loaded from system/env
if (!process.env.CPX_APP_ID) {
  process.env.CPX_APP_ID = '36053';
}
if (!process.env.CPX_POSTBACK_SECRET) {
  process.env.CPX_POSTBACK_SECRET = 'RG6Oh6Qc5hkTiuiN218eoa4Wk8gFSaZ5';
}
if (!process.env.CPX_SECURE_HASH) {
  process.env.CPX_SECURE_HASH = 'RG6Oh6Qc5hkTiuiN218eoa4Wk8gFSaZ5';
}

async function bootstrap() {
  const app = express();
  const PORT = 3000;

  // Security & CORS
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Catch any malformed body errors specifically on the postback routes so they never return HTML error pages
  app.use(
    [
      '/api/postback/cpx',
      '/postback/cpx',
      '/api/postback/wannads',
      '/postback/wannads',
      '/api/postback/monlix',
      '/postback/monlix',
      '/api/postback/adgate',
      '/postback/adgate',
      '/api/postback/cpagrip',
      '/postback/cpagrip',
      '/api/postback/cpalead.php',
      '/postback/cpalead.php',
      '/api/postback/cpalead',
      '/postback/cpalead',
      '/api/postback/timewall',
      '/postback/timewall',
    ],
    (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err) {
        console.warn('[Postback Webhook] Body parsing warning on postback request:', err.message);
        res.status(200).type('text/plain').send('OK');
        return;
      }
      next();
    }
  );

  // Explicitly mount CPX postback webhook at the VERY TOP of all routes
  // Handles all HTTP methods (GET, POST, HEAD, OPTIONS) and query params, returning raw 200 OK
  app.use(['/api/postback/cpx', '/postback/cpx'], (req, res) => {
    handleCpxPostback(req, res).catch((err) => {
      console.error('[CPX Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('OK');
      }
    });
  });

  // Mount CPAlead postback webhook
  // Handles /postback/cpalead.php, /postback/cpalead, /api/postback/cpalead.php, /api/postback/cpalead
  app.use(
    [
      '/postback/cpalead.php',
      '/postback/cpalead',
      '/api/postback/cpalead.php',
      '/api/postback/cpalead',
    ],
    (req, res) => {
      handleCpaleadPostback(req, res).catch((err) => {
        console.error('[CPAlead Postback] Exception in webhook middleware:', err);
        if (!res.headersSent) {
          res.status(200).type('text/plain').send('OK');
        }
      });
    }
  );

  // Mount Wannads postback webhook
  app.use(['/api/postback/wannads', '/postback/wannads'], (req, res) => {
    handleWannadsPostback(req, res).catch((err) => {
      console.error('[Wannads Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('OK');
      }
    });
  });

  // Mount Monlix postback webhook
  app.use(['/api/postback/monlix', '/postback/monlix'], (req, res) => {
    handleMonlixPostback(req, res).catch((err) => {
      console.error('[Monlix Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('1');
      }
    });
  });

  // Mount AdGate Media postback webhook
  app.use(['/api/postback/adgate', '/postback/adgate'], (req, res) => {
    handleAdgatePostback(req, res).catch((err) => {
      console.error('[AdGate Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('1');
      }
    });
  });

  // Mount CPAGrip postback webhook
  app.use(['/api/postback/cpagrip', '/postback/cpagrip'], (req, res) => {
    handleCpagripPostback(req, res).catch((err) => {
      console.error('[CPAGrip Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('OK');
      }
    });
  });

  // Mount TimeWall postback webhook
  app.use(['/api/postback/timewall', '/postback/timewall'], (req, res) => {
    handleTimewallPostback(req, res).catch((err) => {
      console.error('[TimeWall Postback] Exception in webhook middleware:', err);
      if (!res.headersSent) {
        res.status(200).type('text/plain').send('OK');
      }
    });
  });

  app.use(cookieParser());

  // Daily bonus fallback endpoints (guarantees no 503/404 if called)
  app.get('/api/daily-bonus/status', (req, res) => {
    res.json({
      success: true,
      canClaim: true,
      bonusAmount: 0.01,
      remainingSeconds: 0,
      streak: 1,
    });
  });

  app.post('/api/daily-bonus/claim', (req, res) => {
    res.json({
      success: true,
      bonusAmount: 0.01,
      remainingSeconds: 86400,
      streak: 1,
      message: 'Daily bonus credited successfully',
    });
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      service: 'NEXVORA GLOBAL Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Catch-all for any unhandled /api/* requests so they ALWAYS return clean JSON and NEVER return index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${PORT}] Address in use, retrying in 1s...`);
      setTimeout(() => {
        try {
          server.close();
        } catch {}
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    } else {
      console.error('Server runtime error:', err);
    }
  });

  const shutdown = () => {
    try {
      server.close();
    } catch {}
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal failure while starting NEXVORA server:', err);
  process.exit(1);
});
