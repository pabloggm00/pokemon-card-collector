import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportService, AvailableSet } from '../../services/import.service';

@Component({
  selector: 'app-import-set-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './import-set-modal.html',
  styleUrl: './import-set-modal.css',
})
export class ImportSetModal implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  availableSets: AvailableSet[] = [];
  filteredSets: AvailableSet[] = [];
  selectedSetIds: Set<string> = new Set();
  searchTerm: string = '';
  loading: boolean = false;
  loadingSets: boolean = false;
  error: string = '';
  successMessage: string = '';
  completedImports: number = 0;

  constructor(private importService: ImportService) {}

  ngOnInit() {
    this.loadAvailableSets();
  }

  loadAvailableSets() {
    this.loadingSets = true;
    this.importService.getAvailableSets().subscribe({
      next: (sets) => {
        this.availableSets = sets;
        this.filteredSets = sets;
        this.loadingSets = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la lista de sets disponibles';
        this.loadingSets = false;
      }
    });
  }

  filterSets() {
    if (!this.searchTerm.trim()) {
      this.filteredSets = this.availableSets;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSets = this.availableSets.filter(set =>
      set.name.toLowerCase().includes(term) ||
      set.id.toLowerCase().includes(term)
    );
  }

  selectSet(setId: string) {
    if (this.selectedSetIds.has(setId)) {
      this.selectedSetIds.delete(setId);
    } else {
      this.selectedSetIds.add(setId);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.selectedSetIds.size === 0) {
      this.error = 'Por favor selecciona al menos un set';
      return;
    }

    this.loading = true;
    this.error = '';
    this.completedImports = 0;

    // Importar todos los sets seleccionados
    const selectedSets = Array.from(this.selectedSetIds);

    // Iniciar importaciones en secuencia
    selectedSets.reduce((promise, setId) => {
      return promise.then(() => {
        return this.importService.importSet(setId).toPromise()
          .then(response => {
            this.completedImports++;
            if (response?.set?.name) {
              console.log(`✅ ${response.set.name} importado exitosamente (${this.completedImports}/${selectedSets.length})`);
            }
            // Emitir éxito solo cuando se completen todos los sets
            if (this.completedImports === selectedSets.length) {
              this.success.emit();
              this.loading = false;
            }
          })
          .catch(error => {
            console.error(`❌ Error al importar set ${setId}:`, error);
            this.error = 'Error al importar algunos sets';
            this.completedImports++;
            // Continuar con el siguiente set incluso si hay error
            if (this.completedImports === selectedSets.length) {
              this.success.emit();
              this.loading = false;
            }
          });
      });
    }, Promise.resolve());
  }
}
