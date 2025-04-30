import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { setPaginatedResponse, setPaginationHeaders } from './paginatedHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  private http = inject(HttpClient);

  private accountService = inject(AccountService)

  baseUrl = environment.apiUrl;
  
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  memberCache = new Map();
  user = this.accountService.currentUser();
  userParams = signal<UserParams>(new UserParams(this.user));
  // userParams = signal<UserParams>(new UserParams(this.accountService.currentUserReadOnly()));

  // members = signal<Member[]>([]);

  // constructor() { }

  resetUserParams() {
    this.userParams.set(new UserParams(this.user));
  }

  
  getMembers(){
    // const  userParams = this.userParams();
    console.log( this.userParams(), " userparams" );
    // map key be like male-18-99-1-5-lastActive
    const response = this.memberCache.get(Object.values(this.userParams()).join('-')); 

    // if (response) return this.setPaginatedResponse(response);
    if (response) return setPaginatedResponse(response,this.paginatedResult);

    // let params = this.setPaginationHeaders(this.userParams().pageNumber,this.userParams().pageSize);
    let params = setPaginationHeaders(this.userParams().pageNumber,this.userParams().pageSize);

    params = params.append('minAge',this.userParams().minAge);
    params = params.append('maxAge',this.userParams().maxAge);
    params = params.append('gender',this.userParams().gender);
    params = params.append('orderBy',this.userParams().orderBy);
    
    
    return this.http.get<Member[]>(this.baseUrl+'users',{ observe: 'response', params}).subscribe({
      next: response => {
        // this.setPaginatedResponse(response);
        setPaginatedResponse(response,this.paginatedResult);
        this.memberCache.set(Object.values(UserParams).join('-'),response);
      }
    })
  }

  // private setPaginatedResponse(response : HttpResponse<Member []>){
  //   this.paginatedResult.set({
  //     items: response.body as Member[],
  //     pagination: JSON.parse(response.headers.get('Pagination')!)
  //   })
  //   console.log( this.paginatedResult()?.items ,"setting paginated response");
  // }

  // private setPaginationHeaders(pageNumber: number, pageSize: number){

  //   let params = new HttpParams();

  //   if(pageNumber && pageSize){
  //     params = params.append('pageNumber',pageNumber);
  //     params = params.append('pageSize',pageSize);
  //   }
  //   return params;
  // }

  getMember(username :string){
    // return this.http.get<Member>(this.baseUrl+'users/'+ username, this.getHttpOptions()); 1st

    // const member = this.members().find(x => x.userName ===username); 2nd
    // // of - returns as observable
    // if(member !== undefined) return of(member);

    const member: Member = [...this.memberCache.values()].reduce( (array, element) =>
                                        array.concat(element.body),[])
                                        .find((m: Member) => m.userName === username);
                          
    if(member) return of(member);
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
      // tap(() =>{
      //   this.members.update(members=> members.map( m => m.userName === member.userName  ? member : m) )

      // })
    )

  }

  setMainPhoto(photo: Photo){
    return this.http.put(this.baseUrl+'users/set-main-photo/'+photo.id,{}).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if(m.photos.includes(photo))
      //     {
      //       m.phtotoUrl = photo.url;
      //     }
      //     return m;
      //   }));
      // })
    )
  }

  deletePhoto(photo : Photo){
    return this.http.delete(this.baseUrl+'users/delete-photo/'+photo.id).pipe(
      // tap(() =>{
      //     this.members.update(members => members.map(m => {
      //       if(m.photos.includes(photo))
      //       {
      //         m.photos = m.photos.filter(x => x.id !== photo.id);
      //       }
      //       return m;
      //     }));
      // })
    )
  }
}
