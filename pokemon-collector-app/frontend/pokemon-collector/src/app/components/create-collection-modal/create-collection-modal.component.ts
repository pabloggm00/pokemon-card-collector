import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SetService } from '../../services/set.service';
import { CollectionService } from '../../services/collection.service';
import { Set } from '../../models';

@Component({
  selector: 'app-create-collection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-collection-modal.component.html',
  styleUrls: ['./create-collection-modal.component.css']
})
export class CreateCollectionModalComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  // Form data
  collectionType: 'SET' | 'CUSTOM' = 'SET';
  selectedSetId: string = '';
  collectionName: string = '';
  collectionDescription: string = '';

  // UI state
  loading = false;
  error: string | null = null;
  availableSets: Set[] = [];

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
      },
      error: (_: unknown) => {
        this.error = 'Error al cargar los sets disponibles';
      }
    });
  }

  getSelectedSet(): Set | undefined {
    return this.availableSets.find(set => set.id === parseInt(this.selectedSetId));
  }

  isValid(): boolean {
    if (this.loading) return false;

    if (this.collectionType === 'SET') {
      return !!this.selectedSetId;
    } else {
      return !!this.collectionName.trim();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.isValid()) return;

    this.loading = true;
    this.error = null;

    // Por ahora solo soportamos creación desde SET
    if (this.collectionType === 'SET') {
      this.collectionService.create({
        setId: parseInt(this.selectedSetId)
      }).subscribe({
        next: () => {
          this.success.emit();
        },
        error: (_: unknown) => {
          this.error = 'Error al crear la colección';
          this.loading = false;
        }
      });
    } else {
      // Colecciones personalizadas: funcionalidad futura
      this.error = 'Las colecciones personalizadas estarán disponibles próximamente';
      this.loading = false;
    }
  }
}
