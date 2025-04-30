using System;
using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{

    public static IServiceCollection AddApplicationServices(this IServiceCollection services,
        IConfiguration config)
    {


        services.AddControllers();

        services.AddDbContext<DataContext>(opt =>
        {
            opt.UseSqlServer(config.GetConnectionString("DefaultConnection"),
             sqlOptions => sqlOptions.EnableRetryOnFailure());
        });
        services.AddCors();

        services.AddScoped<ITokenService, TokenService>();

        services.AddScoped<IUserRepository,UserRepository>();

        services.AddScoped<IPhotoService,PhotoService>();

        services.AddScoped<ILikesRepository,LikesRepository>();

        services.AddScoped<IMessageRepository,MessageRepository>();

         services.AddScoped<IPhotoRepository, PhotoRepository>();

        services.AddScoped<IUnitOfWork,UnitOfWork>();

        services.AddScoped<LogUserActivity>();

            // check our api assembly and regisster all of the profiles
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

        services.AddSignalR();

        services.AddSingleton<PresenceTracker>();

        return services;
    }

}
