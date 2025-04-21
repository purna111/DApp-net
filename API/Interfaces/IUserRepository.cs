using System;
using API.Dtos;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUserRepository
{
    void Update(AppUser user);

    Task <bool> SaveAllAsync();

    Task<IEnumerable<AppUser>> GetUsersAsync();

    Task<AppUser?> GetUserByIdAsync(int id);
    Task<AppUser?> GetUserByusernameAsync(string username);

    // Task<IEnumerable<MemberDto>> GetMembersAsync();
    Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams);

    Task<MemberDto?> GetMemberByusernameAsync(string username);



}
