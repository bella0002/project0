//@ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(public fb: FirebaseService, public router: Router) {}
  ngOnInit() {
    this.fb.user$.subscribe((user) => {
      if (user)
          this.router.navigateByUrl('/home');
      else
        this.router.navigateByUrl('/login');
    });
    
  }
}
