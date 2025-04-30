using API.Data;
using API.Entities;
using API.Extensions;
using API.Middleware;
using API.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


// Force Kestrel to listen on both HTTP and HTTPS
// builder.WebHost.ConfigureKestrel(options =>
// {
//     options.ListenAnyIP(5213); // HTTP   binds both ipv4 and ipv6[::] 

//     // or options.Listen(IPAddress.Parse("0.0.0.0"), 5213); // IPv4 only
//     // options.ListenAnyIP(7160, listenOptions => listenOptions.UseHttps()); // HTTPS
// });



builder.Services.AddApplicationServices(builder.Configuration);

builder.Services.AddIdentityServices(builder.Configuration);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseMiddleware<ExceptionMiddleware>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// app.UseAuthorization();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
            .WithOrigins("http://localhost:4200", "https://localhost:4200"));

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<PresenceHub>("hubs/presence");
app.MapHub<MessageHub>("hubs/message");

app.MapFallbackToController("Index", "Fallback");

//  writing code to populate the database if it does not have any when starting of our application
// it will dispose off once its done, to access a service outside of DI
using var scope = app.Services.CreateScope();  

var services = scope.ServiceProvider;
//  to create and apply migrations
try
{
    var context = services.GetRequiredService<DataContext>();
     var userManager = services.GetRequiredService<UserManager<AppUser>>();
     var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    // if you need to apply migrations 
    await context.Database.MigrateAsync();

    await context.Database.ExecuteSqlRawAsync("DELETE FROM [Connections]");
    await Seed.SeedUsers(userManager, roleManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex,"an error occured during migration");
}

app.Run();
