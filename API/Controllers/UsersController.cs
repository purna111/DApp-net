using System;
using System.Security.Claims;
using API.Data;
using API.Dtos;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


// [ApiController]
// [Route("api/[Controller]")]
[Authorize]
public class UsersController(IUserRepository userRepository,IMapper mapper) : BaseApiController
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUser()
    {

        var users = await userRepository.GetMembersAsync();


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

        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(username == null) return BadRequest("no username found in token");

        var user = await userRepository.GetUserByusernameAsync(username);

        if(user == null) return BadRequest(" could not find user");

        mapper.Map(memberUpdateDto,user);

        if(await userRepository.SaveAllAsync()) return NoContent(); 

        return BadRequest("Failed to update the user");
    }


}
