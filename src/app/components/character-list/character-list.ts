import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../models/character.model';
import { CharacterCardComponent } from '../character-card/character-card';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-list.html',
  styleUrls: ['./character-list.scss']
})
export class CharacterListComponent {
  characters = input<Character[]>([]);
  title = input<string>();
  emptyMessage = input<string>();
  emptySubMessage = input<string>();
  
  toggleFavorite = output<number>();
  editCharacter = output<Character>();
  deleteCharacter = output<number>();

  trackByCharacterId(index: number, character: Character): number {
    return character.id;
  }

  onToggleFavorite(characterId: number): void {
    this.toggleFavorite.emit(characterId);
  }

  onEditCharacter(character: Character): void {
    this.editCharacter.emit(character);
  }

  onDeleteCharacter(characterId: number): void {
    this.deleteCharacter.emit(characterId);
  }
}