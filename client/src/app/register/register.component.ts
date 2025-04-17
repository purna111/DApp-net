import { Component,  inject,  input,  OnInit,  output,   } from '@angular/core';
import { AbstractControl, FormBuilder,  FormGroup,  ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,TextInputComponent,DatePickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

  private accountService = inject(AccountService);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    registerForm : FormGroup = new FormGroup({});  

  // @Input() usersFromHomeComponent:any;    old way <17.3 
  // using signal gives compiler intellisense if not provided
  // usersFromHomeComponent = input.required<any>();

  // old way child to parent communication
  // @Output() cancelRegister = new EventEmitter();
  cancelRegister = output<boolean>();
  maxDate = new Date();
  validationErrors: string[] | undefined

  ngOnInit(): void {
      this.initializeForm();
      this.maxDate.setFullYear(this.maxDate.getFullYear() - 18)
  }

  initializeForm(){
    this.registerForm = this.fb.group({
      gender: ['male'],
      username : ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['',[Validators.required,Validators.minLength(4),
        Validators.maxLength(8)
      ]],
      confirmPassword : ['',[Validators.required,this.matchValues('password')]]
    });
    // validators
      this.registerForm.controls['password'].valueChanges.subscribe({
        next: ()=> this.registerForm.controls['confirmPassword'].updateValueAndValidity()
      })
  }

  matchValues(matchTo : string){
    return (control: AbstractControl) =>{
                      //  null is when the value is matched, isMatching is when not matched
      return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching : true};
    }
  }

  register(){
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    this.registerForm.patchValue({dateOfBirth: dob});
    this.accountService.register(this.registerForm.value).subscribe({
      next: response =>{
            this.router.navigateByUrl('/members');
      },
      // error: (error: HttpErrorResponse) => {
      //         if (error.status === 0) {
      //           this.toastr.error('Unable to connect to the server. Please try again later.', 'Network Error');
      //         } else {
      //           this.toastr.error(error.error?.message || 'An error occurred.', `Error ${error.status}`);
      //         }
      //       } 
      error: error => this.validationErrors= error
    })
  }


  cancel(){
    console.log( "register cancelled" );
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob : string|undefined){
    if(!dob) return;
    return new Date(dob).toISOString().slice(0,10);
  }
}
