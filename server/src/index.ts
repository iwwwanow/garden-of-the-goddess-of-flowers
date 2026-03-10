import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import meRouter from './routes/me';
import flowersRouter from './routes/flowers';
import leaderboardRouter from './routes/leaderboard';
import seedsRouter from './routes/seeds';
import { runDailyTick } from './cron/dailyTick';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.CLIENT_URL ?? '*' }));
app.use(express.json());
app.use('/api/assets', express.static(path.join(__dirname, '../assets')));

app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/flowers', flowersRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/seeds', seedsRouter);

// Serve client static (populated in Docker via multi-stage build)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Daily cron: run at midnight
function scheduleMidnight() {
  const now = new Date();
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  const ms = next.getTime() - now.getTime();
  setTimeout(async () => {
    await runDailyTick();
    scheduleMidnight();
  }, ms);
}
scheduleMidnight();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
