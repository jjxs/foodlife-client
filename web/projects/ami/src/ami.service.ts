import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AmiService {

  constructor() { }

  print() {
    console.log("AmiService print!!!")
  }
}
