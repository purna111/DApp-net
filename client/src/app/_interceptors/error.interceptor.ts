import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const toaster = inject(ToastrService);

  return next(req).pipe(
    // rxjs
    catchError(error =>{
      if(error){
        switch (error.status) {
          case 400:
            if( error.error.errors){
              const modelStateErrors = [];
              for(const key in error.error.errors){
                if(error.error.errors[key]){
                  modelStateErrors.push(error.error.errors[key])
                }
              }
              throw modelStateErrors.flat();
            }
            else{
              toaster.error(error.error, error.status)
            }
            break;

          case 401:
            toaster.error("unauthorized", error.status)  
            break;

          case 404:
            router.navigateByUrl('/not-found')
            break;

          case 500:
// passing state to the other component by navigation extras        -key-value pair
            const navigationExtras: NavigationExtras= { state :{ error :error.error}};
            router.navigateByUrl('/server-error', navigationExtras);
            break;

          default:
            toaster.error("something unexcepted went wrong");
            break;
        }
      }
      throw error;
    })
  )
};
