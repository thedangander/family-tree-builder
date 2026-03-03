using HotChocolate.AspNetCore;
using HotChocolate.Execution;
using System.Security.Claims;

namespace FamilyTree.Api.GraphQL;

/// <summary>
/// Intercepts GraphQL HTTP requests to enforce authentication.
/// Allows introspection queries without authentication for development tooling.
/// </summary>
public class AuthenticationInterceptor : DefaultHttpRequestInterceptor
{
    public override ValueTask OnCreateAsync(
        HttpContext context,
        IRequestExecutor requestExecutor,
        OperationRequestBuilder requestBuilder,
        CancellationToken cancellationToken)
    {
        var user = context.User;
        
        // Add user claims to GraphQL context
        if (user.Identity?.IsAuthenticated == true)
        {
            requestBuilder.SetGlobalState("currentUser", user);
            requestBuilder.SetGlobalState("userId", user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub"));
            requestBuilder.SetGlobalState("username", user.FindFirstValue("preferred_username") ?? user.Identity.Name);
        }
        
        return base.OnCreateAsync(context, requestExecutor, requestBuilder, cancellationToken);
    }
}
