import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardNumber',
  standalone: true
})
export class CardNumberPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '000';
    
    // Extraer solo los dígitos del número
    const numStr = value.toString();
    const match = numStr.match(/\d+/);
    
    if (!match) return numStr;
    
    const num = parseInt(match[0]);
    const formatted = num.toString().padStart(3, '0');
    
    // Si había texto después del número (ej: "123a"), mantenerlo
    const suffix = numStr.replace(/^\d+/, '');
    
    return formatted + suffix;
  }
}
