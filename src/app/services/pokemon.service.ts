import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private appUrl = `https://pokeapi.co/api/v2/pokemon?limit=2500`;

  constructor(private http: HttpClient) { }

  bringPokemons(): Observable<any> {
    return this.http.get(this.appUrl);
  };

  bringPokemonInfo(url: string): Observable<any> {
    return this.http.get(url);
  }
}


