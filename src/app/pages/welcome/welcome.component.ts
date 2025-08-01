import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  constructor(private router: Router) {}

  navegarALogin(): void {
    this.router.navigate(['/login']);
  }

  navegarARegister(): void {
    this.router.navigate(['/register']);
  }

}
