import { Component, inject } from '@angular/core';
import { FormsModule} from '@angular/forms'
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { HasRoleDirective } from '../_directives/has-role.directive';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, BsDropdownModule, RouterLink, RouterLinkActive, HasRoleDirective],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  router = inject(Router);

  model:any ={};

  login(){
    this.accountService.login(this.model).subscribe({
      // next: respone =>{
      //   console.log( `respone is ${JSON.stringify(respone)}` );
      //   console.log( respone );
      // },
      next: _ =>{
        this.router.navigateByUrl("/members");
      },
      // error: error =>{
      //   console.log( ` error occured is ${JSON.stringify(error)} ` );
      //   this.toastr.error(error.error)
      // }

      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.toastr.error('Unable to connect to the server. Please try again later.', 'Network Error');
        } else {
          this.toastr.error(error.error?.message || 'An error occurred.', `Error ${error.status}`);
        }
      }

    });
    console.log(`${JSON.stringify(this.model)}  from the login method`  );
  }


  logout() {
    // throw new Error('Method not implemented.');
    this.accountService.logout();
    this.router.navigateByUrl("/");

    }
    


}
