import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DownloadService {
  async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }
}
