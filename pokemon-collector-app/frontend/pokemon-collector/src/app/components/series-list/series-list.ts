import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeriesService } from '../../services/series.service';
import { Series } from '../../models';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-series-list',
  imports: [CommonModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './series-list.html',
  styleUrl: './series-list.css',
})
export class SeriesList implements OnInit, OnDestroy {
  series: Series[] = [];
  sortedSeries: Series[] = [];
  filteredSeries: Series[] = [];
  loading: boolean = false;
  error: string | null = null;
  sortOrder: 'asc' | 'desc' = 'desc'; // Por defecto, más reciente primero
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  
  // Selection mode
  selectionMode = false;
  selectedSeriesIds = new Set<number>();

  // Confirmation modal
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'danger' | 'warning' | 'info' = 'warning';
  pendingAction: (() => void) | null = null;

  constructor(private seriesService: SeriesService) {}

  ngOnInit(): void {
    this.loadSeries();
    
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterSeries();
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  filterSeries(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSeries = [...this.sortedSeries];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSeries = this.sortedSeries.filter(series =>
        series.name.toLowerCase().includes(term)
      );
    }
  }

  sortSeries(): void {
    this.sortedSeries = [...this.series].sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    this.filterSeries();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.sortSeries();
  }

  loadSeries(): void {
    this.loading = true;
    this.error = null;
    
    this.seriesService.getAll().subscribe({
      next: (data) => {
        this.series = data;
        this.sortSeries();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las series';
        this.loading = false;
      }
    });
  }

  deleteSeries(serie: Series, event: Event): void {
    event.stopPropagation();
    
    const setsCount = serie.sets?.length || 0;
    this.confirmModalTitle = 'Eliminar serie';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar "${serie.name}"?\n\nSe eliminarán:\n- ${setsCount} set(s)\n- Todas las cartas de estos sets\n- Todas las colecciones asociadas\n\nEsta acción no se puede deshacer.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;
    
    this.pendingAction = () => {
      this.seriesService.delete(serie.id).subscribe({
        next: () => {
          this.loadSeries();
        },
        error: (error) => {
          alert('Error al eliminar la serie');
        }
      });
    };
  }

  // Selection mode methods
  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedSeriesIds.clear();
    }
  }

  toggleSeriesSelection(seriesId: number): void {
    if (this.selectedSeriesIds.has(seriesId)) {
      this.selectedSeriesIds.delete(seriesId);
    } else {
      this.selectedSeriesIds.add(seriesId);
    }
  }

  isSeriesSelected(seriesId: number): boolean {
    return this.selectedSeriesIds.has(seriesId);
  }

  toggleSelectAll(): void {
    if (this.selectedSeriesIds.size === this.filteredSeries.length) {
      // Si todas están seleccionadas, deseleccionar todas
      this.selectedSeriesIds.clear();
    } else {
      // Seleccionar todas
      this.filteredSeries.forEach(series => this.selectedSeriesIds.add(series.id));
    }
  }

  deleteSelected(): void {
    if (this.selectedSeriesIds.size === 0) return;

    this.confirmModalTitle = 'Eliminar series';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar ${this.selectedSeriesIds.size} serie(s)?\n\nSe eliminarán todos los sets, cartas y colecciones asociadas.\n\nEsta acción no se puede deshacer.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;
    
    this.pendingAction = () => {
      const deletePromises = Array.from(this.selectedSeriesIds).map(id =>
        this.seriesService.delete(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.selectedSeriesIds.clear();
        this.selectionMode = false;
        this.loadSeries();
      }).catch(() => {
        alert('Error al eliminar algunas series');
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
