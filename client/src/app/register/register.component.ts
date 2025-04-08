import { Component,  inject,  input,  output,   } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private accountService = inject(AccountService);
    private toastr = inject(ToastrService);
  

  // @Input() usersFromHomeComponent:any;    old way <17.3 

  // using signal gives compiler intellisense if not provided
  // usersFromHomeComponent = input.required<any>();

  // old way child to parent communication

  // @Output() cancelRegister = new EventEmitter();
  cancelRegister = output<boolean>();


  model: any= {}; 

  register(){
    console.log( this.model );
    this.accountService.register(this.model).subscribe({
      next: response =>{
        console.log( response ); 
        this.cancel();
      },
      error: (error: HttpErrorResponse) => {
              if (error.status === 0) {
                this.toastr.error('Unable to connect to the server. Please try again later.', 'Network Error');
              } else {
                this.toastr.error(error.error?.message || 'An error occurred.', `Error ${error.status}`);
              }
            }
    })
  }


  cancel(){
    console.log( "register cancelled" );
    this.cancelRegister.emit(false);
  }
}
