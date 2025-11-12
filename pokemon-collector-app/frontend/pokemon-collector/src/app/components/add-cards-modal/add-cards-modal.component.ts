import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services/card.service';
import { Card } from '../../models';
import { CardNumberPipe } from '../../pipes/card-number.pipe';

@Component({
  selector: 'app-add-cards-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CardNumberPipe],
  templateUrl: './add-cards-modal.component.html',
  styleUrls: ['./add-cards-modal.component.css']
})
export class AddCardsModalComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<number[]>(); // Emite IDs de cartas seleccionadas

  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  availableCards: Card[] = [];
  filteredCards: Card[] = [];
  selectedCardIds: Set<number> = new Set();

  constructor(private cardService: CardService) {}

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.loading = true;
    this.cardService.getAll({ limit: 1000 }).subscribe({
      next: (response) => {
        this.availableCards = response.cards;
        this.filteredCards = response.cards;
        this.loading = false;
      },
      error: (_: unknown) => {
        this.error = 'Error al cargar las cartas disponibles';
        this.loading = false;
      }
    });
  }

  filterCards() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCards = this.availableCards;
      return;
    }

    this.filteredCards = this.availableCards.filter(card => 
      card.name.toLowerCase().includes(term) ||
      card.number.toLowerCase().includes(term) ||
      card.set?.name.toLowerCase().includes(term)
    );
  }

  toggleCard(cardId: number) {
    if (this.selectedCardIds.has(cardId)) {
      this.selectedCardIds.delete(cardId);
    } else {
      this.selectedCardIds.add(cardId);
    }
  }

  isValid(): boolean {
    return this.selectedCardIds.size > 0 && !this.loading;
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.isValid()) return;
    this.success.emit(Array.from(this.selectedCardIds));
  }
}
