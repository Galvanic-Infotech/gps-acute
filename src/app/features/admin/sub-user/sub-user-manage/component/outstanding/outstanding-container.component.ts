import { Component } from '@angular/core';

@Component({
  selector: 'outstanding-container',
  template: `
    <section class="admin-content">
      <outstanding-list></outstanding-list>
    </section>
  `,
})
export class OutstandingContainerComponent {}
