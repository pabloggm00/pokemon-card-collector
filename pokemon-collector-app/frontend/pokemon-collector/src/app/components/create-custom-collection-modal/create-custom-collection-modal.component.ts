import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../services/collection.service';
import { SetService } from '../../services/set.service';
import { CardService } from '../../services/card.service';
import type { Set } from '../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-create-custom-collection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-custom-collection-modal.component.html',
  styleUrls: ['./create-custom-collection-modal.component.css']
})
export class CreateCustomCollectionModalComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  collectionName: string = '';
  collectionDescription: string = '';
  loading = false;
  error: string | null = null;

  // Template options
  useTemplate = false;
  availableSets: Set[] = [];
  filteredSets: Set[] = [];
  selectedSetIds = new Set<number>();
  searchTerm: string = '';
  loadingSets = false;

  constructor(
    private collectionService: CollectionService,
    private setService: SetService,
    private cardService: CardService
  ) {}

  ngOnInit() {
    this.loadSets();
  }

  loadSets() {
    this.loadingSets = true;
    this.setService.getAll().subscribe({
      next: (sets) => {
        this.availableSets = sets;
        this.filteredSets = sets;
        this.loadingSets = false;
      },
      error: () => {
        this.loadingSets = false;
      }
    });
  }

  filterSets() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredSets = this.availableSets;
      return;
    }

    this.filteredSets = this.availableSets.filter(set => 
      set.name.toLowerCase().includes(term) ||
      set.code.toLowerCase().includes(term)
    );
  }

  toggleSetSelection(setId: number) {
    if (this.selectedSetIds.has(setId)) {
      this.selectedSetIds.delete(setId);
    } else {
      this.selectedSetIds.add(setId);
    }
  }

  isSetSelected(setId: number): boolean {
    return this.selectedSetIds.has(setId);
  }

  isValid(): boolean {
    return !this.loading && !!this.collectionName.trim();
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.isValid()) return;

    this.loading = true;
    this.error = null;

    this.collectionService.createCustom({
      name: this.collectionName,
      description: this.collectionDescription || undefined
    }).subscribe({
      next: (collection) => {
        // Si se seleccionaron plantillas, añadir las cartas de esos sets
        if (this.useTemplate && this.selectedSetIds.size > 0) {
          this.addCardsFromSets(collection.id);
        } else {
          this.success.emit();
        }
      },
      error: (_: unknown) => {
        this.error = 'Error al crear la colección personalizada';
        this.loading = false;
      }
    });
  }

  addCardsFromSets(collectionId: number) {
    // Obtener todas las cartas de los sets seleccionados
    const cardRequests = Array.from(this.selectedSetIds).map(setId =>
      this.cardService.getAll({ setId, limit: 1000 })
    );

    forkJoin(cardRequests).subscribe({
      next: (responses) => {
        // Extraer todos los IDs de las cartas
        const cardIds = responses.flatMap(response => 
          response.cards.map(card => card.id)
        );

        if (cardIds.length === 0) {
          this.success.emit();
          return;
        }

        // Añadir todas las cartas a la colección
        this.collectionService.addCards(collectionId, { cardIds }).subscribe({
          next: () => {
            this.success.emit();
          },
          error: () => {
            this.error = 'Colección creada pero error al añadir las cartas de plantilla';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Colección creada pero error al obtener las cartas de plantilla';
        this.loading = false;
      }
    });
  }
}
