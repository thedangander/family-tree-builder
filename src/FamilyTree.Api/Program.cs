using FamilyTree.Api.GraphQL;
using FamilyTree.Domain.Interfaces;
using FamilyTree.Infrastructure.Configuration;
using FamilyTree.Infrastructure.Persistence;
using FamilyTree.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Wolverine;

var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults (OpenTelemetry, health checks, service discovery)
builder.AddServiceDefaults();

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Configure MongoDB - supports both Aspire connection string and manual configuration
var connectionString = builder.Configuration.GetConnectionString("familytree");
if (!string.IsNullOrEmpty(connectionString))
{
    // Aspire provides connection string
    builder.Services.Configure<MongoDbSettings>(options =>
    {
        options.ConnectionString = connectionString;
        options.DatabaseName = "familytree";
    });
}
else
{
    // Fallback to manual configuration
    builder.Services.Configure<MongoDbSettings>(
        builder.Configuration.GetSection(MongoDbSettings.SectionName));
}

builder.Services.AddSingleton<MongoDbContext>();

// Register repositories
builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<IRelationshipRepository, RelationshipRepository>();
builder.Services.AddScoped<ITreeRepository, TreeRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Configure Wolverine for CQRS
builder.Host.UseWolverine(opts =>
{
    opts.Discovery.IncludeAssembly(typeof(FamilyTree.Application.Common.Result).Assembly);
});

// Configure GraphQL with HotChocolate
builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<PersonType>()
    .AddType<RelationshipType>()
    .AddType<TreeType>()
    .AddType<GenderType>()
    .AddType<RelationshipTypeEnum>()
    .AddFiltering()
    .AddSorting()
    .AddProjections()
    .AddHttpRequestInterceptor<AuthenticationInterceptor>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetValue<string>("Cors:AllowedOrigins") ?? "http://localhost:3000";
        policy.WithOrigins(origins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Family Tree API", Version = "v1" });
});

// Configure Authentication with Keycloak
var authority = builder.Configuration["Authentication:Authority"] ?? "http://localhost:8080/realms/familytree";
var audience = builder.Configuration["Authentication:Audience"] ?? "familytree-api";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.Authority = authority;
    options.Audience = audience;
    options.RequireHttpsMetadata = false; // For development - set to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidAudiences = [audience, "account"],
        NameClaimType = "preferred_username",
        RoleClaimType = "realm_access"
    };
    
    // For development: handle token validation errors more gracefully
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Log.Warning("Authentication failed: {Error}", context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var username = context.Principal?.Identity?.Name;
            Log.Information("Token validated for user: {Username}", username);
            return Task.CompletedTask;
        }
    };
});

// Configure Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAuthenticatedUser", policy =>
        policy.RequireAuthenticatedUser());
    
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("admin"));
    
    options.AddPolicy("RequireTreeOwnerRole", policy =>
        policy.RequireRole("tree-owner", "admin"));
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseCors("AllowFrontend");

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map Aspire default health check endpoints
app.MapDefaultEndpoints();

// GraphQL endpoint
app.MapGraphQL();

// Simple REST health endpoint
app.MapGet("/", () => Results.Ok(new { 
    Service = "Family Tree API", 
    Version = "1.0.0",
    GraphQL = "/graphql",
    Health = "/health"
}));

app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
