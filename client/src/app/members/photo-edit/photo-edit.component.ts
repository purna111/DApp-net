import { Component, inject, input, OnInit, output } from '@angular/core';
import { Member } from '../../_models/member';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment';
import { Photo } from '../../_models/photo';
import { MembersService } from '../../_services/members.service';

@Component({
  selector: 'app-photo-edit',
  standalone: true,
  imports: [NgFor,NgIf,NgClass,NgStyle,FileUploadModule, DecimalPipe],
  templateUrl: './photo-edit.component.html',
  styleUrl: './photo-edit.component.css'
})
export class PhotoEditComponent implements OnInit{

  private accountservice = inject(AccountService);
  private memberService = inject(MembersService);
  member = input.required<Member>();
  uploader?: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  memberChange = output<Member>();

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(event :any){
      this.hasBaseDropZoneOver= event;
  }

  // setting main photo and update the components in the client with out backend logic
  setMainPhoto(photo: Photo){
    this.memberService.setMainPhoto(photo).subscribe({
      next: _ =>{
        const user = this.accountservice.currentUser();
        if(user){
          user.photoUrl = photo.url; // main photo in user.photourl local storage
          this.accountservice.setCurrentUser(user);
        }
        // logic in frontend to update the dependent components
        const updateMember = {...this.member()};
        updateMember.phtotoUrl = photo.url;  //updateMember.phtotoUrl this is main img url that is stored
        updateMember.photos.forEach(p =>{
          if(p.isMain) p.isMain = false;
          if(p.id == photo.id) p.isMain =true;
        });
        this.memberChange.emit(updateMember);
      }
    })

  }

  deletePhoto(photo: Photo){
    this.memberService.deletePhoto(photo).subscribe({
      next: _ =>{
        const updatedMember = {...this.member()};
        updatedMember.photos = updatedMember.photos.filter( x=> x.id !== photo.id);
        this.memberChange.emit(updatedMember);
      }
    })
  }

  initializeUploader(){

    this.uploader = new FileUploader({
      url: this.baseUrl+'users/add-photo',
      authToken: 'Bearer '+this.accountservice.currentUser()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10*1024*1024
    });

    this.uploader.onAfterAddingFile= (file) =>{
      file.withCredentials = false
    }

    this.uploader.onSuccessItem= (item, response, status,headers) =>{
      const photo = JSON.parse(response);
      const updatedMember = {...this.member()};
      updatedMember.photos.push(photo);
      this.memberChange.emit(updatedMember);

      if (photo.isMain) {
        const user = this.accountservice.currentUser();
        if (user) {
          user.photoUrl = photo.url;
          this.accountservice.setCurrentUser(user)
        }
        updatedMember.phtotoUrl = photo.url;
        updatedMember.photos.forEach(p => {
          if (p.isMain) p.isMain = false;
          if (p.id === photo.id) p.isMain = true;
        });
        this.memberChange.emit(updatedMember)
      }
    }
  }



}
