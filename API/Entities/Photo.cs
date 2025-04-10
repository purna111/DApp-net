using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities;

[Table("Photos")]
public class Photo
{
    public int Id { get; set; }

    public required string Url { get; set; }

    public bool IsMain { get; set; }

    public string? PublicId { get; set; }


//  both these are required one-to-many relationship
// navigation properties
    public int AppUserId { get; set; }

//  ! - null forgiving operator
    public AppUser AppUser { get; set; } = null ! ;

}
