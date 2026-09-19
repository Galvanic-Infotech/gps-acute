import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { environment } from 'src/environments/environment.prod';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ngOnInit() {
    const hash = window.location.hash;
    if (hash.startsWith('#/')) {
      this.router.navigateByUrl(hash.slice(1));
    }
  }
  constructor(
    private swUpdate: SwUpdate,
    private router: Router
  ) {
    if (environment.production && this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.promptUser();
      });
    }
  }

  promptUser() {
    if (confirm('A new version of the app is available. Would you like to update?')) {
      this.swUpdate.activateUpdate().then(() => {
        // Trigger a soft refresh or simply inform the user to refresh the page.
        alert('The app will update when you Refersh the application.');
      });
    }
  }
}
