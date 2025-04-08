using System;
using System.Net;
using System.Text.Json;
using API.Errors;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace API.Middleware;

public class ExceptionMiddleware(RequestDelegate next,ILogger<ExceptionMiddleware> logger,
              IHostEnvironment env  )
{

    public async Task InvokeAsync(HttpContext httpContext){

        try
        {
            await next(httpContext);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, ex.Message);
            
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response =env.IsDevelopment() 
                ? new ApiException(httpContext.Response.StatusCode,ex.Message,ex.StackTrace)
                : new ApiException(httpContext.Response.StatusCode,ex.Message,"Internal server error");

                // since the response in json we want this to be camelcase
                // so we are ganna pass options for json serializer
            var options= new JsonSerializerOptions{
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var json = JsonSerializer.Serialize(response,options);

            await httpContext.Response.WriteAsync(json);
            
            
        }

    }
}
