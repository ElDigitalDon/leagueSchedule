import { Component, OnInit } from '@angular/core';
import {match} from './models/match.interface';
import {game} from './models/game.interface';
import {players} from './models/players.inteface';
import {FormBuilder, FormGroup, FormControl, FormArray} from '@angular/forms';
import {tryCatch} from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  teamForm: FormGroup;

  testPeople: string [] = [
    'Matt',
    'Don',
    'Keith',
    'Marah',
    ''
  ];
  people: string [] = this.testPeople;
  matchUp: match;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      people: this.fb.array([])
    });
  }
  onAddNames(newName: String = '') {
    const control = new FormGroup({'person': new FormControl(newName)});
    (<FormArray>this.teamForm.get('people')).push(control);
  }

  ngOnInit() {
    this.matchUp = {games : []};
    // Pre-configure all the league entries
    for (let i = 0; i < 5; i++ ) {
      const players: players = {
        player1 : '', player2 : '', duplicate : false
      };
      const game: game = { players };
      this.matchUp.games.push(game);
    }
    // Pre-populate controls from testPeople array
    this.testPeople.forEach(person => {
      this.onAddNames(person);
    });
    // Subscribe to any changes to the group of controls
    this.generateSchedule(this.people);
    this.teamForm.valueChanges.subscribe(value => {
      const count = this.teamForm.value.people.length;
      if (this.teamForm.value.people[count - 1].person !== '') {
        this.onAddNames();
      }
      this.people = [];
      this.teamForm.value.people.forEach(person => {
        this.people.push(person.person);
      });
      this.generateSchedule(this.people);
    });
  }

  updatePerson($event, i) {
    console.log($event.target.value);
    if ( $event.target.value.length !== 0) {
      this.people[i] = $event.target.value;
    }
    this.generateSchedule(this.people);
  }

  generateSchedule(people) {
    console.log('attempt to schedule');

    // Filter out the empty entries
    people = people.filter(person => person.length > 0 );
    if ( people.length < 2) {
      return;
    }

    // Fill out the timesUsed and pairedWith attributes for each person
    const usages = {};
    people.forEach( (person) =>  {
      usages[person] = {timesUsed : 0, pairedWith : []};
    });

    // Now try to schedule
    try {
      // Let's get it done.
      this.matchUp.games.forEach( (game) => {
        // Get the left hand side of the game
        let nextSpouse = this.findNextLeastUsed( usages );
        game.players.player1 = nextSpouse;
        usages[nextSpouse].timesUsed++;

        // Get the right hand side of the game
        nextSpouse = this.findNextLeastUsed( usages, nextSpouse );
        game.players.player2 = nextSpouse;
        usages[nextSpouse].timesUsed++;

        // Update the usages matrix
        usages[game.players.player1].pairedWith.push(game.players.player2);
        usages[game.players.player2].pairedWith.push(game.players.player1);
      });
    } catch (e) {
      console.log(e);
      // Clear out the schedule before starting a new schedule
      this.matchUp.games.forEach( (game) => {
        game.players.player1 = '';
        game.players.player2 = '';
      });
    }

  }

  findNextLeastUsed( usages, firstSpouse = '' ) {
    let curLeastUsed = -1;
    let curLeastPerson: string;

    // Walk through persons looking for non-matches
    for ( const person in usages ) {
      // Skip missing first party attributes
      if ( ! usages.hasOwnProperty(person) ) { continue; }

      // non-paired persons
      if ( usages[person].pairedWith.includes(firstSpouse) === false
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
