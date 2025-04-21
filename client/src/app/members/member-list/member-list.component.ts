import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../_models/member';
import { MemberCardComponent } from "../member-card/member-card.component";
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { UserParams } from '../../_models/userParams';
import { AccountService } from '../../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent,PaginationModule,FormsModule,ButtonsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit{

  private accountService = inject(AccountService);
  memberService = inject(MembersService);
  members: Member[] =[];
  // pageNumber = 1;
  // pageSize = 5;
  // userParams = new UserParams(this.accountService.currentUser());
  genderList = [{value:'male',display: 'Males'},{value:'female',display: 'Females'}]

  ngOnInit(): void {

    if(!this.memberService.paginatedResult()){
      this.loadMembers();

    }

  }

  resetFilters(){
    // this.userParams = new UserParams(this.accountService.currentUser());
    this.memberService.resetUserParams();
    this.loadMembers();
  }

  loadMembers(){
    this.memberService.getMembers()
    console.log( this.memberService.paginatedResult() , "this is what we are getting in this.memberService.paginatedResult() lastActive " );

  }

  pageChanged(event:any){

    if(this.memberService.userParams().pageNumber !== event.page){
      this.memberService.userParams().pageNumber = event.page;
      this.loadMembers();
    }
  }

}
