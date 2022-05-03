import { Component, OnInit } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';
import { IPokemon } from "src/app/interfaces/pokemon";
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, delay } from "rxjs/operators";

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css']
})
export class PokemonComponent implements OnInit {

  seleccionado: boolean = false;
  seleccName: string = "";
  seleccId: string = "";
  seleccUrl: String = "";
  seleccHeight: string = "";
  seleccUrlImg: string = "";
  seleccWeight: string = "";
  seleccType: string[] = [];
  seleccAbility: string[] = [];
  seleccNumBef: string = "";
  seleccNumAft: string = "";
  pokeRes: IPokemon[] = [];
  pokeResFilt: IPokemon[] = [];
  cantMostrar: number = 20;
  okBut: boolean = true;
  okButAft: boolean = true;
  searchTerm$ = new Subject<string>();
  maxOk: boolean = true;
  loading: boolean = true;
  appUrl: string = `https://pokeapi.co/api/v2/pokemon?limit=2500`;
  response: any;


  constructor(private _pokemonService: PokemonService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getPokemons();
    this.filterList();
  }

  mostrarSelecc(data: any) {
    let basicUrl = "https://pokeapi.co/api/v2/pokemon/";
    let idSel: number = 0;
    let fullUrl: string = "";
    switch (data) {
      case -1:
        idSel = parseInt(this.seleccNumBef)
        fullUrl = basicUrl + idSel + "/"
        break;
      case 1:
        idSel = parseInt(this.seleccNumAft)
        fullUrl = basicUrl + idSel + "/"
        break;
      default:
        fullUrl = data;
        break;
    }
    let sel = this.pokeRes.find(element => element.url == fullUrl);
    if (sel) {
      this.seleccionado = true;
      this.seleccUrl = data;
      this.seleccName = sel.name;
      this.seleccUrlImg = sel.imageUrl;
      this.seleccId = sel.id;
      this.seleccHeight = sel.height;
      this.seleccWeight = sel.weight;
      this.seleccType = sel.type;
      this.seleccAbility = sel.abilities;
      this.seleccNumBef = ("00" + Math.max(0, parseInt(sel.id) - 1)).slice(-3);
      Math.max(0, parseInt(sel.id) - 1) == 0 ? this.okBut = false : this.okBut = true;
      this.seleccNumAft = ("00" + Math.min(this.pokeRes.length, parseInt(sel.id) + 1)).slice(-3);
      Math.max(0, parseInt(sel.id) - 1) == 0 ? this.okButAft = false : this.okButAft = true;

    }
  }

  //ONE WAY 
  getPokemons() {
    this._pokemonService.bringPokemons().subscribe(data => {
      this.pokeRes = data.results;
      for (let i = 0; i < this.pokeRes.length; i++) {
        this._pokemonService.bringPokemonInfo(this.pokeRes[i].url).subscribe(data => {
          this.pokeRes[i].id = ("00" + this.pokeRes[i].url.split("/")[6]).slice(-3);
          this.pokeRes[i].imageUrl = data.sprites.front_shiny;
          let altM = parseFloat(data.height) / 10;
          let pesK = parseFloat(data.weight) / 10;
          let altInEnt = Math.trunc(altM * 3.28084);
          let altInDec = Math.round((altM * 3.28084 - altInEnt) * 12);
          let pesL = pesK * 2.20462;
          this.pokeRes[i].height = altInEnt + "' " + altInDec + "'' (" + altM.toString() + " m)";
          this.pokeRes[i].weight = pesL.toFixed(2) + " lbs (" + pesK.toString() + " kg)";
          this.pokeRes[i].abilities = [];
          this.pokeRes[i].type = [];
          data.abilities.forEach((element: { ability: { name: string; }; }) => {
            this.pokeRes[i].abilities.push(element.ability.name)
          });
          data.types.forEach((element: { type: { name: string; }; }) => {
            this.pokeRes[i].type.push(element.type.name)
          });
        })
        i == (this.pokeRes.length - 1) ? this.loading = false : this.loading = true;
      }
      this.pokeResFilt = this.pokeRes;
    })
  }

  //ANOTHER WAY
  // async getPokemons() {
  //   this.response = await this.httpClient
  //     .get<any>(this.appUrl)
  //     .pipe(delay(1000))
  //     .toPromise();
  //   console.log(this.response)
  //   this.pokeRes = this.response.results;
  //   for (let i = 0; i < this.pokeRes.length; i++) {
  //     this._pokemonService.bringPokemonInfo(this.pokeRes[i].url).subscribe(data => {
  //       this.pokeRes[i].id = ("00" + this.pokeRes[i].url.split("/")[6]).slice(-3);
  //       this.pokeRes[i].imageUrl = data.sprites.front_shiny;
  //       let altM = parseFloat(data.height) / 10;
  //       let pesK = parseFloat(data.weight) / 10;
  //       let altInEnt = Math.trunc(altM * 3.28084);
  //       let altInDec = Math.round((altM * 3.28084 - altInEnt) * 12);
  //       let pesL = pesK * 2.20462;
  //       this.pokeRes[i].height = altInEnt + "' " + altInDec + "'' (" + altM.toString() + " m)";
  //       this.pokeRes[i].weight = pesL.toFixed(2) + " lbs (" + pesK.toString() + " kg)";
  //       this.pokeRes[i].abilities = [];
  //       this.pokeRes[i].type = [];
  //       data.abilities.forEach((element: { ability: { name: string; }; }) => {
  //         this.pokeRes[i].abilities.push(element.ability.name)
  //       });
  //       data.types.forEach((element: { type: { name: string; }; }) => {
  //         this.pokeRes[i].type.push(element.type.name)
  //       });
  //     })
  //   }
  //   this.pokeResFilt = this.pokeRes;
  //   this.loading = false;
  // }




  filterList(): void {
    this.searchTerm$.subscribe(term => {
      this.pokeResFilt = this.pokeRes
        .filter(item => item.name.toLowerCase().indexOf(term.toLowerCase()) >= 0);
    });
  }

  cargarMas() {
    this.cantMostrar = this.cantMostrar + 20;
    this.cantMostrar >= this.pokeResFilt.length ? this.maxOk = false : this.maxOk = true;

  }
}
