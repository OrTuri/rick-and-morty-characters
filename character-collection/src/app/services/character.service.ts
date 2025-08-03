import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Character, ApiResponse, CreateCharacterRequest } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private http = inject(HttpClient);
  private searchSubject = new BehaviorSubject<string>('');
  
  private charactersSignal = signal<Character[]>([]);
  private customCharactersSignal = signal<Character[]>([]);
  private favoritesSignal = signal<number[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private searchTermSignal = signal('');
  private nextIdSignal = signal(1000);

  public characters = computed(() => this.charactersSignal());
  public customCharacters = computed(() => this.customCharactersSignal());
  public favorites = computed(() => this.favoritesSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());
  public searchTerm = computed(() => this.searchTermSignal());

  public allCharacters = computed(() => [...this.customCharactersSignal(), ...this.charactersSignal()]);

  public filteredCharacters = computed(() => {
    const term = this.searchTermSignal().toLowerCase().trim();
    const custom = this.customCharactersSignal();
    const api = this.charactersSignal();
    
    if (!term) return [...custom, ...api];
    
    const filter = (chars: Character[]) => chars.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.species.toLowerCase().includes(term) ||
      c.status.toLowerCase().includes(term)
    );
    
    return [...filter(custom), ...filter(api)];
  });

  public favoriteCharacters = computed(() => {
    const ids = this.favoritesSignal();
    const term = this.searchTermSignal().toLowerCase().trim();
    
    let favs = this.allCharacters().filter(c => ids.includes(c.id));
    
    if (term) {
      favs = favs.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.species.toLowerCase().includes(term) ||
        c.status.toLowerCase().includes(term)
      );
    }
    
    const custom = favs.filter(c => c.isCustom);
    const api = favs.filter(c => !c.isCustom);
    return [...custom, ...api];
  });

  constructor() {
    this.loadData();
    this.initSearch();
  }

  private loadData() {
    const savedFavs = localStorage.getItem('rick-morty-favorites');
    if (savedFavs) this.favoritesSignal.set(JSON.parse(savedFavs));
    
    const savedCustom = localStorage.getItem('rick-morty-custom');
    if (savedCustom) {
      const data = JSON.parse(savedCustom);
      this.customCharactersSignal.set(data.characters || []);
      this.nextIdSignal.set(data.nextId || 1000);
    }
  }

  private initSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);
        
        if (!term.trim() || term.length < 2) {
          return this.http.get<ApiResponse>('https://rickandmortyapi.com/api/character?page=1');
        }
        
        return this.http.get<ApiResponse>(`https://rickandmortyapi.com/api/character?name=${term}`).pipe(
          catchError(() => of({ results: [], info: { count: 0, pages: 0, next: null, prev: null } }))
        );
      }),
      catchError(() => {
        this.errorSignal.set('Failed to load');
        this.loadingSignal.set(false);
        return of({ results: [], info: { count: 0, pages: 0, next: null, prev: null } });
      })
    ).subscribe(response => {
      const favs = this.favoritesSignal();
      this.charactersSignal.set(response.results.map(c => ({ ...c, isFavorite: favs.includes(c.id) })));
      this.loadingSignal.set(false);
    });

    this.searchSubject.next('');
  }

  searchByName(name: string) {
    this.searchTermSignal.set(name);
    this.searchSubject.next(name);
  }

  createCharacter(data: CreateCharacterRequest): Observable<Character> {
    const char: Character = {
      id: this.nextIdSignal(),
      name: data.name,
      status: data.status,
      species: data.species,
      gender: data.gender,
      type: data.type || '',
      image: data.image,
      origin: { name: 'Custom', url: '' },
      location: { name: 'Custom', url: '' },
      episode: [],
      url: '',
      created: new Date().toISOString(),
      isCustom: true,
      isFavorite: false
    };

    this.customCharactersSignal.update(chars => [...chars, char]);
    this.nextIdSignal.update(id => id + 1);
    this.saveCustom();
    return of(char);
  }

  updateCharacter(id: number, updates: Partial<Character>): Observable<Character> {
    const chars = this.customCharactersSignal();
    const index = chars.findIndex(c => c.id === id);
    
    if (index >= 0) {
      const updated = { ...chars[index], ...updates };
      chars[index] = updated;
      this.customCharactersSignal.set([...chars]);
      this.saveCustom();
      return of(updated);
    }
    return of({} as Character);
  }

  deleteCharacter(id: number): Observable<boolean> {
    this.customCharactersSignal.update(chars => chars.filter(c => c.id !== id));
    this.saveCustom();
    this.toggleFavorite(id);
    return of(true);
  }

  toggleFavorite(id: number) {
    const favs = this.favoritesSignal();
    const isFav = favs.includes(id);
    
    if (isFav) {
      this.favoritesSignal.set(favs.filter(f => f !== id));
    } else {
      this.favoritesSignal.set([...favs, id]);
    }
    
    localStorage.setItem('rick-morty-favorites', JSON.stringify(this.favoritesSignal()));
    this.updateFavStatus(id, !isFav);
  }

  private updateFavStatus(id: number, isFav: boolean) {
    this.charactersSignal.update(chars => 
      chars.map(c => c.id === id ? { ...c, isFavorite: isFav } : c)
    );
    
    this.customCharactersSignal.update(chars => 
      chars.map(c => c.id === id ? { ...c, isFavorite: isFav } : c)
    );
    
    if (this.customCharactersSignal().some(c => c.id === id)) {
      this.saveCustom();
    }
  }

  private saveCustom() {
    localStorage.setItem('rick-morty-custom', JSON.stringify({
      characters: this.customCharactersSignal(),
      nextId: this.nextIdSignal()
    }));
  }
}