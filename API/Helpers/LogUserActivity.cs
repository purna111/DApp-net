using System;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers;

public class LogUserActivity : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var resultContext = await next();
        // next - our action method in api is executed here
        // this from below when the controller method is completed then it takes place i.e executed the below code

        // context- from here we can access http context
        if(context.HttpContext.User.Identity?.IsAuthenticated != true) return;

        // var username = resultContext.HttpContext.User.GetUsername();
        var userId = resultContext.HttpContext.User.GetUserId();
        var repo = resultContext.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
        var user = await repo.GetUserByIdAsync(userId);

        if(user == null) return;

        user.LastActive = DateTime.UtcNow;

        await repo.SaveAllAsync();


    }
}
