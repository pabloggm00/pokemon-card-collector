import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SetService } from '../../services/set.service';
import { SeriesService } from '../../services/series.service';
import type { Set, Series } from '../../models';
import { ImportSetModal } from '../import-set-modal/import-set-modal';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-sets-list',
  imports: [CommonModule, RouterModule, FormsModule, ImportSetModal, ConfirmationModalComponent],
  templateUrl: './sets-list.html',
  styleUrl: './sets-list.css',
})
export class SetsList implements OnInit {
  sets: Set[] = [];
  allSets: Set[] = [];
  series: Series[] = [];
  loading: boolean = false;
  error: string | null = null;
  selectedSeriesId: string = '';
  showImportModal: boolean = false;
  importingMessage: string = '';
  searchQuery: string = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Selection mode
  selectionMode = false;
  selectedSetIds = new Set<number>();

  // Confirmation modal
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'danger' | 'warning' | 'info' = 'warning';
  pendingAction: (() => void) | null = null;
  
  constructor(
    private setService: SetService,
    private seriesService: SeriesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadSeries();
    this.loadAllSets();
    
    // Leer query param 'seriesId' si existe
    this.route.queryParams.subscribe(params => {
      if (params['seriesId']) {
        this.selectedSeriesId = params['seriesId'];
        // Aplicar filtro después de cargar los sets
        setTimeout(() => this.onSeriesFilter(), 100);
      }
    });
  }

  loadSeries(): void {
    this.seriesService.getAll().subscribe({
      next: (data) => {
        this.series = data;
      },
      error: (err) => {
        // Silently handle error
      }
    });
  }

  loadAllSets(): void {
    this.loading = true;
    this.error = null;
    
    this.setService.getAll().subscribe({
      next: (data) => {
        this.allSets = data;
        this.sets = [...data];
        this.applySorting();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los sets';
        this.loading = false;
      }
    });
  }

  onSeriesFilter(): void {
    if (!this.selectedSeriesId) {
      this.sets = this.allSets;
    } else {
      const seriesId = +this.selectedSeriesId;
      this.sets = this.allSets.filter(set => set.seriesId === seriesId);
    }
    this.filterBySearch(this.sets);
    this.applySorting();
  }

  onSortChange(): void {
    this.applySorting();
  }

  private applySorting(): void {
    this.sets = [...this.sets].sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  onSearch(): void {
    if (!this.searchQuery?.trim()) {
      this.onSeriesFilter(); // Reset to series filter only
      return;
    }
    
    const searchLower = this.searchQuery.toLowerCase().trim();
    this.sets = this.sets.filter(set => 
      set.name.toLowerCase().includes(searchLower) ||
      set.code.toLowerCase().includes(searchLower)
    );
    this.applySorting();
  }

  private filterBySearch(sets: Set[]): void {
    if (this.searchQuery?.trim()) {
      const searchLower = this.searchQuery.toLowerCase().trim();
      this.sets = sets.filter(set => 
        set.name.toLowerCase().includes(searchLower) ||
        set.code.toLowerCase().includes(searchLower)
      );
    }
  }

  openImportModal(): void {
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  onImportSuccess(): void {
    this.showImportModal = false;
    this.importingMessage = '⏳ Importando set... Esto puede tardar unos segundos';
    
    // Esperar un momento y luego recargar
    setTimeout(() => {
      this.loadAllSets();
      this.loadSeries();
      this.importingMessage = '✅ Set importado exitosamente';
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        this.importingMessage = '';
      }, 3000);
    }, 2000);
  }

  deleteSet(set: Set): void {
    this.confirmModalTitle = 'Eliminar set';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar "${set.name}"?\n\nSe eliminarán ${set.totalCards} cartas.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;

    this.pendingAction = () => {
      this.setService.delete(set.id).subscribe({
        next: () => {
          this.loadAllSets();
        },
        error: (err) => {
          if (err.status === 400) {
            alert('No se puede eliminar el set porque tiene colecciones asociadas');
          } else {
            alert('Error al eliminar el set');
          }
        }
      });
    };
  }

  // Selection mode methods
  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedSetIds.clear();
    }
  }

  toggleSetSelection(setId: number): void {
    if (this.selectedSetIds.has(setId)) {
      this.selectedSetIds.delete(setId);
    } else {
      this.selectedSetIds.add(setId);
    }
  }

  isSetSelected(setId: number): boolean {
    return this.selectedSetIds.has(setId);
  }

  toggleSelectAll(): void {
    if (this.selectedSetIds.size === this.sets.length) {
      // Si todas están seleccionadas, deseleccionar todas
      this.selectedSetIds.clear();
    } else {
      // Seleccionar todas
      this.sets.forEach(set => this.selectedSetIds.add(set.id));
    }
  }

  deleteSelected(): void {
    if (this.selectedSetIds.size === 0) return;

    this.confirmModalTitle = 'Eliminar sets';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar ${this.selectedSetIds.size} set(s)?\n\nSe eliminarán todas las cartas de estos sets.\n\nEsta acción no se puede deshacer.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;

    this.pendingAction = () => {
      const deletePromises = Array.from(this.selectedSetIds).map(id =>
        this.setService.delete(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.selectedSetIds.clear();
        this.selectionMode = false;
        this.loadAllSets();
      }).catch(() => {
        alert('Error al eliminar algunos sets. Algunos sets pueden tener colecciones asociadas.');
      });
    };
  }

  onConfirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  onCancelAction() {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }
}
