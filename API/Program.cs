using API.Data;
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



builder.Services.AddControllers();

builder.Services.AddDbContext<DataContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddCors();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// app.UseAuthorization();
app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
            .WithOrigins("http://localhost:4200", "https://localhost:4200"));

app.MapControllers();

app.Run();
