import { Component,  inject,  input,  output,   } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private accountService = inject(AccountService);

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
      error: error =>{
        console.log( error );
      }
    })
  }


  cancel(){
    console.log( "register cancelled" );
    this.cancelRegister.emit(false);
  }
}
