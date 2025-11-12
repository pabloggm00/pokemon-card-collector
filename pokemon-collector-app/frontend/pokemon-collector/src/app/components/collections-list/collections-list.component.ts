import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CollectionService, CollectionWithStats } from '../../services/collection.service';
import { CreateSetCollectionModalComponent } from '../create-set-collection-modal';
import { CreateCustomCollectionModalComponent } from '../create-custom-collection-modal';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-collections-list',
  standalone: true,
  imports: [CommonModule, CreateSetCollectionModalComponent, CreateCustomCollectionModalComponent, ConfirmationModalComponent],
  templateUrl: './collections-list.component.html',
  styleUrls: ['./collections-list.component.css']
})
export class CollectionsListComponent implements OnInit, OnDestroy {
  collections: CollectionWithStats[] = [];
  filteredCollections: CollectionWithStats[] = [];
  loading = false;
  showSetModal = false;
  showCustomModal = false;
  selectionMode = false;
  selectedCollectionIds = new Set<number>();
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  
  // Confirmation modal
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'danger' | 'warning' | 'info' = 'warning';
  pendingAction: (() => void) | null = null;

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCollections();
    
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterCollections();
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  filterCollections(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCollections = [...this.collections];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCollections = this.collections.filter(collection => {
        const name = collection.set ? collection.set.name : collection.name;
        return name.toLowerCase().includes(term);
      });
    }
  }

  loadCollections() {
    this.loading = true;
    this.collectionService.getAll().subscribe({
      next: (data) => {
        this.collections = data;
        this.filterCollections();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  openCollection(id: number) {
    if (this.selectionMode) {
      this.toggleSelection(id);
    } else {
      this.router.navigate(['/collections', id]);
    }
  }

  toggleSelectionMode() {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedCollectionIds.clear();
    }
  }

  toggleSelection(id: number) {
    if (this.selectedCollectionIds.has(id)) {
      this.selectedCollectionIds.delete(id);
    } else {
      this.selectedCollectionIds.add(id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedCollectionIds.has(id);
  }

  toggleSelectAll(): void {
    if (this.selectedCollectionIds.size === this.filteredCollections.length) {
      // Si todas están seleccionadas, deseleccionar todas
      this.selectedCollectionIds.clear();
    } else {
      // Seleccionar todas
      this.filteredCollections.forEach(collection => this.selectedCollectionIds.add(collection.id));
    }
  }

  deleteSelected() {
    if (this.selectedCollectionIds.size === 0) return;

    this.confirmModalTitle = 'Eliminar colecciones';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar ${this.selectedCollectionIds.size} colección(es)?\n\nSe perderá todo el progreso de estas colecciones.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;
    
    this.pendingAction = () => {
      const deletePromises = Array.from(this.selectedCollectionIds).map(id =>
        this.collectionService.delete(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.selectedCollectionIds.clear();
        this.selectionMode = false;
        this.loadCollections();
      }).catch(() => {
        alert('Error al eliminar algunas colecciones');
      });
    };
  }

  openSetModal() {
    this.showSetModal = true;
  }

  openCustomModal() {
    this.showCustomModal = true;
  }

  closeSetModal() {
    this.showSetModal = false;
  }

  closeCustomModal() {
    this.showCustomModal = false;
  }

  onCollectionCreated() {
    this.showSetModal = false;
    this.showCustomModal = false;
    this.loadCollections();
  }

  deleteCollection(collection: CollectionWithStats, event: Event) {
    event.stopPropagation();
    
    const collectionName = collection.set ? collection.set.name : collection.name;
    this.confirmModalTitle = 'Eliminar colección';
    this.confirmModalMessage = `¿Estás seguro de que quieres eliminar "${collectionName}"?\n\nSe perderá el progreso de ${collection.ownedCards}/${collection.totalCards} cartas.`;
    this.confirmModalType = 'danger';
    this.showConfirmModal = true;
    
    this.pendingAction = () => {
      this.collectionService.delete(collection.id).subscribe({
        next: () => {
          this.loadCollections();
        },
        error: (error) => {
          alert('Error al eliminar la colección');
        }
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

  getCompletionPercentage(collection: CollectionWithStats): number {
    if (collection.totalCards === 0) return 0;
    return Math.round((collection.ownedCards / collection.totalCards) * 100);
  }

  getCollectionInitials(name: string): string {
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  getLogoText(name: string): string {
    // Si el nombre tiene más de 20 caracteres, usar iniciales
    if (name.length > 20) {
      return this.getCollectionInitials(name);
    }
    return name;
  }

  getCollectionColor(name: string): string {
    // Genera un gradiente basado en el hash del nombre
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const gradients = [
      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // rojo
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // naranja
      'linear-gradient(135deg, #10b981 0%, #059669 100%)', // verde
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // azul
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // morado
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // rosa
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // cyan
    ];
    
    return gradients[Math.abs(hash) % gradients.length];
  }
}
