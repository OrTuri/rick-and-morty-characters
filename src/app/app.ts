import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from './services/character.service';
import { CharacterListComponent } from './components/character-list/character-list';
import { CharacterFormComponent } from './components/character-form/character-form';
import { Character, CreateCharacterRequest } from './models/character.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CharacterListComponent, CharacterFormComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  public characterService = inject(CharacterService);

  searchTerm = signal('');
  private currentView = signal<'all' | 'favorites' | 'custom'>('all');
  private showForm = signal(false);
  private editingCharacter = signal<Character | null>(null);

  displayedCharacters = computed(() => {
    const view = this.currentView();
    const term = this.searchTerm().toLowerCase().trim();
    
    switch (view) {
      case 'favorites':
        return this.characterService.favoriteCharacters();
      case 'custom': {
        const chars = this.characterService.customCharacters();
        return !term ? chars : chars.filter(c => 
          c.name.toLowerCase().includes(term) ||
          c.species.toLowerCase().includes(term) ||
          c.status.toLowerCase().includes(term)
        );
      }
      default:
        return this.characterService.filteredCharacters();
    }
  });

  onSearch() { this.characterService.searchByName(this.searchTerm()); }
  
  setView(view: 'all' | 'favorites' | 'custom') {
    this.currentView.set(view);
    if (view === 'custom') {
      this.searchTerm.set('');
      this.characterService.searchByName('');
    }
  }

  openCreateForm() {
    this.editingCharacter.set(null);
    this.showForm.set(true);
  }

  onEditCharacter(character: Character) {
    this.editingCharacter.set(character);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingCharacter.set(null);
  }

  onSubmitForm(data: CreateCharacterRequest | { id: number; updates: Partial<Character> }) {
    if ('id' in data) {
      this.characterService.updateCharacter(data.id, data.updates).subscribe();
    } else {
      this.characterService.createCharacter(data).subscribe();
    }
  }

  onToggleFavorite(id: number) { this.characterService.toggleFavorite(id); }
  onDeleteCharacter(id: number) { this.characterService.deleteCharacter(id).subscribe(); }
  retry() { this.characterService.searchByName(''); }

  getViewTitle() {
    const views = { favorites: 'Favorite Characters', custom: 'My Custom Characters', all: 'All Characters' };
    return views[this.currentView()] || views.all;
  }

  getEmptyMessage() {
    const messages = { 
      favorites: 'No favorite characters yet', 
      custom: 'No custom characters created', 
      all: 'No characters found' 
    };
    return messages[this.currentView()] || messages.all;
  }

  getEmptySubMessage() {
    const messages = { 
      favorites: 'Heart some characters to see them here!', 
      custom: 'Create your first custom character to get started.', 
      all: 'Try adjusting your search terms.' 
    };
    return messages[this.currentView()] || messages.all;
  }

  get currentViewValue() { return this.currentView(); }
  get showFormValue() { return this.showForm(); }
  get editingCharacterValue() { return this.editingCharacter(); }
}