using System;
using System.Security.Claims;
using API.Data;
using API.Dtos;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


// [ApiController]
// [Route("api/[Controller]")]
[Authorize]
public class UsersController(IUserRepository userRepository,IMapper mapper,
                                IPhotoService photoService) : BaseApiController
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUser([FromQuery] UserParams userParams)
    {
        userParams.CurrentUserName = User.GetUsername();
        var users = await userRepository.GetMembersAsync(userParams);
        Response.AddPaginationHeader(users);
        return Ok( users );
    }


    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {

        var user = await userRepository.GetMemberByusernameAsync(username);
        if (user == null) return NotFound();
        return user;
    }


    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto){

        // var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // if(username == null) return BadRequest("no username found in token");

        var user = await userRepository.GetUserByusernameAsync(User.GetUsername());

        if(user == null) return BadRequest(" could not find user");

        mapper.Map(memberUpdateDto,user);

        if(await userRepository.SaveAllAsync()) return NoContent(); 

        return BadRequest("Failed to update the user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto (IFormFile file){

        var user = await userRepository.GetUserByusernameAsync(User.GetUsername());
        if(user == null) return BadRequest("cannot update user");

        var result = await photoService.AddPhotoAsync(file);
        if(result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo{
            Url = result.SecureUrl.AbsoluteUri,
            PublicId= result.PublicId
        };

        if (user.Photos.Count == 0) photo.IsMain = true;

        user.Photos.Add(photo);

        if(await userRepository.SaveAllAsync()){
                return CreatedAtAction(nameof(GetUser),new{username = user.UserName},
                mapper.Map<PhotoDto>(photo));
            // return mapper.Map<PhotoDto>(photo);
        }

        return BadRequest("problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId ){

        var user = await userRepository.GetUserByusernameAsync(User.GetUsername());

        if(user == null) return BadRequest(" couldnot find user");

        var photo = user.Photos.FirstOrDefault(x=> x.Id == photoId);

        if(photo == null || photo.IsMain) return BadRequest("can not use this as main photo");

        var currentMain = user.Photos.FirstOrDefault(x =>x.IsMain);

        if(currentMain != null) currentMain.IsMain =false;
        photo.IsMain =true;

        if(await userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("problem setting main phot");
    }

    [HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId ){

        var user = await userRepository.GetUserByusernameAsync(User.GetUsername());

        if(user == null) return BadRequest(" user not found");

        var photo = user.Photos.FirstOrDefault(x=> x.Id == photoId);

        if(photo == null || photo.IsMain) return BadRequest("This photo can not be deleted");
            //  deleting in cloudinary if it's present there
        if(photo.PublicId != null){
            var result = await photoService.DeletePhotoAsync(photo.PublicId);
            if(result.Error != null) return BadRequest(result.Error.Message);
        }
        user.Photos.Remove(photo);
        if(await userRepository.SaveAllAsync()) return Ok();

        return BadRequest(" problem deleting photo");
    }


}
