import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private meta: Meta, private title: Title) { }

  generateTags(title = "", description = "", picturePath = "") {

    //Default values
    const config = {
      title: (title != "") ? title : "Disastream - De la nature à l'écran",
      description: (description != "") ? description : "Restez connectés à la nature. Partout. Tout le temps.",
      image: (picturePath != "") ? picturePath : '/assets/background/world_Moment.jpg'
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:site', content: '@twitter' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image });

    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:site_name', content: 'disastream' });
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image });
    this.meta.updateTag({ property: 'og:url', content: `https://disastream.com` });

    this.title.setTitle(config.title);
    this.meta.addTags([
      { name: 'description', content: config.description },
      { name: 'keywords', content: config.description },
    ]);

  }

}
