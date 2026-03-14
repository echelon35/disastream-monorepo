import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logFilePath = process.env.LOG_FILE_PATH || './disastream.log';

    // Crée le dossier parent si nécessaire
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // Format JSON pour Loki
      ),
      transports: [
        new winston.transports.Console(), // Affiche les logs dans la console
        new winston.transports.File({ filename: logFilePath }), // Écrit dans un fichier
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
