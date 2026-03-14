
import { Component } from '@angular/core';
import { SeoService } from 'src/app/Services/Seo.service';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './PageNotFound.view.html',
    standalone: false
})
export class PageNotFoundView {

  #env = environment;
  protected s3BasePath = this.#env.settings.s3_bucket;

  constructor(private seoService: SeoService) { 
    this.seoService.generateTags("Oups, page non trouvée !","La page que vous cherchez n'est plus sur Disastream","/assets/background/404.jpg");
  }

}
