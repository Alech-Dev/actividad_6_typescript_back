import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { environment } from './environments/environment';

// Routes
import videosRoutes from './routes/videos.routes';

export class Server {
  private app: express.Application;
  private port: number;
  
  constructor() {
    this.app = express();
    this.port = parseInt(environment.port, 10)

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }))
  }

  routes() {
    this.app.use(videosRoutes);
  }

  async listen() {
   await this.app.listen(this.port);
   console.log(`Server on port ${this.port}`);
  }
};