using System;
using API.Dtos;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers;

public class AutoMapperProfiles :Profile
{
    public AutoMapperProfiles()
    {
        CreateMap<AppUser,MemberDto>()
        .ForMember(destinationMember => destinationMember.Age, options => options.MapFrom(
            source => source.DateOfBirth.CalculateAge()))
        .ForMember(destinationMember => destinationMember.PhtotoUrl, options => options.MapFrom(
            source => source.Photos.FirstOrDefault(x => x.IsMain)!.Url
        ));

        // CreateMap<AppUser, MemberDto>()
        // .ForMember(dest => dest.PhtotoUrl, opt => opt.MapFrom(
        //     src => src.Photos
        //         .Where(p => p.IsMain)
        //         .Select(p => p.Url)
        //         .FirstOrDefault() // returns null if nothing found safer version
        // ));

        CreateMap<Photo,PhotoDto>();
        CreateMap<MemberUpdateDto,AppUser>();
        CreateMap<RegisterDto, AppUser>();
        CreateMap<string,DateOnly>().ConvertUsing(source => DateOnly.Parse(source));
        CreateMap<Message, MessageDto>()
            .ForMember(d => d.SenderPhotoUrl, 
                o => o.MapFrom(s => s.Sender.Photos.FirstOrDefault(x => x.IsMain)!.Url))
            .ForMember(d => d.RecipientPhotoUrl, 
                o => o.MapFrom(s => s.Recipient.Photos.FirstOrDefault(x => x.IsMain)!.Url));      
        CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
        CreateMap<DateTime?, DateTime?>().ConvertUsing(d => d.HasValue 
            ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null);
    }


}
