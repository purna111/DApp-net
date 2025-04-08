using System;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class BuggyController(DataContext context): BaseApiController
{

    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetAuth(){
        return "secret - text";
    }


    [HttpGet("not-found")]
    public ActionResult<AppUser> GetNotFound(){

        var thing = context.Users.Find(-1);

        if (thing == null)
        {
            return NotFound();
        }
        return thing;
    }

    [HttpGet("server-error")]
    public ActionResult<AppUser> GetServerError(){

        var thing = context.Users.Find(-1) ?? throw new Exception(" a bad thing had happened");

        return thing;
    } 

    [HttpGet("badrequest")]
    public ActionResult<AppUser> GetbadReqyest(){

        return BadRequest(" this was not a good request");
    }
}
