import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardName',
  standalone: true
})
export class CardNamePipe implements PipeTransform {
  transform(name: string): string {
    // Los nombres ya vienen correctamente formateados desde la BD
    return name || '';
  }
}
