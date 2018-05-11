import { Component, OnInit } from '@angular/core';
import {match} from "./models/match.interface";
import {game} from "./models/game.interface";
import {players} from "./models/players.inteface";
import {FormBuilder, FormGroup, Validators, FormControl, FormArray} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  teamForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      people: this.fb.array([])
    });
  }
  onAddNames(newName : String = ''){
    const control = new FormGroup({'person': new FormControl(newName)});
    (<FormArray>this.teamForm.get('people')).push(control);
  }

  testPeople: string [] = [
    "Matt",
    "Don",
    "Keith",
    "Marah",
    ""
  ];
  people: string [] = this.testPeople;
  matchUp: match;

  ngOnInit() {
    this.matchUp = {games : []};
    for (let i = 0; i < 5; i++ ) {
      let players : players = {
        player1 : "", player2 : ""
      };
      let game : game = { players };
      this.matchUp.games.push(game);
    }
    this.testPeople.forEach(person => {
      this.onAddNames(person);
    });
    this.generateSchedule(this.people);
    this.teamForm.valueChanges.subscribe(value => {
      this.generateSchedule(this.people);
    });
  }

  updatePerson($event, i) {
    console.log($event.target.value);
    if( $event.target.value.length !== 0) {
      this.people[i] = $event.target.value;
    }
    this.generateSchedule(this.people);
  }

  generateSchedule(people) {
    console.log("attempt to schedule");
    people = this.people.filter(person => person.length > 0 );
    if( this.people.length < 2) {
      return;
    }

    let usages = {};
    people.forEach( (person) =>  {
      usages[person] = {timesUsed : 0, pairedWith : []};
    });
    this.matchUp.games.forEach( (game) => {
      let nextSpouse = this.findNextLeastUsed( usages );
      game.players.player1 = nextSpouse;
      usages[nextSpouse].timesUsed++;
      nextSpouse = this.findNextLeastUsed( usages, nextSpouse );
      game.players.player2 = nextSpouse;
      usages[nextSpouse].timesUsed++;
      usages[game.players.player1].pairedWith.push(game.players.player2);
      usages[game.players.player2].pairedWith.push(game.players.player1);
      console.dir(usages);
    });
    console.dir(usages);
  }

  findNextLeastUsed( usages, firstSpouse = "" ) {
    let curLeastUsed : number = -1;
    let curLeastPerson : string;

    for( let person in usages ) {
      // Only search first party attributes and non-paired persons
      if ( usages.hasOwnProperty(person)
        && usages[person].pairedWith.includes(firstSpouse) === false
        && person !== firstSpouse) {
        // Found a person that hasn't been used?  Leave.  Now.
        if ( usages[person].timesUsed === 0 ) {
          return person;
        }
        // Save the least used person ... so far
        if (curLeastUsed === -1 || usages[person].timesUsed < curLeastUsed) {
          curLeastUsed = usages[person].timesUsed;
          curLeastPerson = person;
        }
      }
    }
    return curLeastPerson;
  }
}
