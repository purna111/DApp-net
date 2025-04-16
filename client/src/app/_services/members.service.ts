import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  private http = inject(HttpClient);

  private accountService = inject(AccountService)

  baseUrl = environment.apiUrl;

  members = signal<Member[]>([]);

  // constructor() { }

  getMembers(){
    return this.http.get<Member[]>(this.baseUrl+'users').subscribe({
      next: members => this.members.set(members)
    })
  }

  getMember(username :string){
    // return this.http.get<Member>(this.baseUrl+'users/'+ username, this.getHttpOptions());
    const member = this.members().find(x => x.userName ===username);

    // of - returns as observable
    if(member !== undefined) return of(member);

    return this.http.get<Member>(this.baseUrl+'users/'+ username);
  }

  // getHttpOptions(){
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization : `Bearer ${this.accountService.currentUser()?.token}`
  //     })
  //   }
  // }  this is presented in jwt.interceptor   

  updateMember(member: Member){

    return this.http.put(this.baseUrl+ 'users',member).pipe(
      // tap - is doing something along with observable with out changing the observable
      tap(() =>{
        this.members.update(members=> members.map( m => m.userName === member.userName  ? member : m) )

      })
    )

  }

  setMainPhoto(photo: Photo){
    return this.http.put(this.baseUrl+'users/set-main-photo/'+photo.id,{}).pipe(
      tap(() => {
        this.members.update(members => members.map(m => {
          if(m.photos.includes(photo))
          {
            m.phtotoUrl = photo.url;
          }
          return m;
        }));
      })
    )
  }

  deletePhoto(photo : Photo){
    return this.http.delete(this.baseUrl+'users/delete-photo/'+photo.id).pipe(
      tap(() =>{
          this.members.update(members => members.map(m => {
            if(m.photos.includes(photo))
            {
              m.photos = m.photos.filter(x => x.id !== photo.id);
            }
            return m;
          }));
      })
    )
  }
}
