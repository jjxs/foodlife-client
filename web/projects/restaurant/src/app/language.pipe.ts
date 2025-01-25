import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from './app.service';

@Pipe({name: 'language'})
export class LanguagePipe implements PipeTransform {

  constructor(
    private appService: AppService
  ) {
  }
  transform(value: string, lang: string): string {
    return this.appService.language( value, lang );
  }

}