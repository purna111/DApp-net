using System;

namespace API.Dtos;

public class RegisterDto
{

    public required string Username { get; set; }

    public required string Password { get; set; }

}
