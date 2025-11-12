import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetService } from '../../services/set.service';
import { CollectionService } from '../../services/collection.service';
import type { Set } from '../../models';

@Component({
  selector: 'app-create-set-collection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-set-collection-modal.component.html',
  styleUrls: ['./create-set-collection-modal.component.css']
})
export class CreateSetCollectionModalComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  selectedSetIds = new Set<number>();
  searchTerm: string = '';
  loading = false;
  error: string | null = null;
  availableSets: Set[] = [];
  filteredSets: Set[] = [];

  constructor(
    private setService: SetService,
    private collectionService: CollectionService
  ) {}

  ngOnInit() {
    this.loadSets();
  }

  loadSets() {
    this.setService.getAll().subscribe({
      next: (sets) => {
        this.availableSets = sets;
        this.filteredSets = sets;
      },
      error: (_: unknown) => {
        this.error = 'Error al cargar los sets disponibles';
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

  getSelectedSet(): Set | undefined {
    return this.availableSets.find(set => this.selectedSetIds.has(set.id));
  }

  isValid(): boolean {
    return !this.loading && this.selectedSetIds.size > 0;
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.isValid()) return;

    this.loading = true;
    this.error = null;

    const createPromises = Array.from(this.selectedSetIds).map(setId =>
      this.collectionService.create({ setId }).toPromise()
    );

    Promise.all(createPromises).then(() => {
      this.success.emit();
    }).catch(() => {
      this.error = 'Error al crear algunas colecciones';
      this.loading = false;
    });
  }
}
