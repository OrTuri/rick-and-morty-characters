import { Component, input, output, OnInit, ChangeDetectionStrategy, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Character, CreateCharacterRequest } from '../../models/character.model';

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-form.html',
  styleUrls: ['./character-form.scss']
})
export class CharacterFormComponent implements OnInit {
  editingCharacter = input<Character | null>(null);
  submitForm = output<CreateCharacterRequest | { id: number; updates: Partial<Character> }>();
  closeForm = output<void>();

  private fb = inject(FormBuilder);
  characterForm!: FormGroup;
  isSubmitting = signal(false);

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
    }
  }

  ngOnInit(): void {
    this.characterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      status: ['Alive', Validators.required],
      species: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['Male', Validators.required],
      type: [''],
      image: ['', [Validators.required, this.urlValidator]]
    });
    
    const character = this.editingCharacter();
    if (character) {
      this.characterForm.patchValue({
        name: character.name,
        status: character.status,
        species: character.species,
        gender: character.gender,
        type: character.type,
        image: character.image
      });
    }
  }

  private urlValidator(control: FormControl) {
    if (!control.value) return null;
    return /^https?:\/\/.+/i.test(control.value) ? null : { invalidUrl: true };
  }

  onSubmit(): void {
    if (this.characterForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.characterForm.value;
      const character = this.editingCharacter();
      
      if (character) {
        this.submitForm.emit({ id: character.id, updates: formValue });
      } else {
        this.submitForm.emit(formValue as CreateCharacterRequest);
      }
      
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.onClose();
      }, 500);
    }
  }

  onClose(): void {
    this.closeForm.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onClose();
  }
}