import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Character } from '../../models/character.model';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-card.html',
  styleUrls: ['./character-card.scss']
})
export class CharacterCardComponent {
  character = input.required<Character>();
  toggleFavorite = output<number>();
  editCharacter = output<Character>();
  deleteCharacter = output<number>();

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.character().id);
  }

  onEdit(): void {
    this.editCharacter.emit(this.character());
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.character().name}?`)) {
      this.deleteCharacter.emit(this.character().id);
    }
  }
}