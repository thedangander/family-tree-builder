using Testcontainers.MongoDb;
using FamilyTree.Infrastructure.Data;
using Microsoft.Extensions.Options;

namespace FamilyTree.Infrastructure.Tests.Fixtures;

public class MongoDbFixture : IAsyncLifetime
{
    private readonly MongoDbContainer _mongoDbContainer;

    public MongoDbFixture()
    {
        _mongoDbContainer = new MongoDbBuilder()
            .WithImage("mongo:8.0")
            .Build();
    }

    public string ConnectionString => _mongoDbContainer.GetConnectionString();

    public MongoDbContext CreateContext(string databaseName = "FamilyTreeTestDb")
    {
        var settings = new MongoDbSettings
        {
            ConnectionString = ConnectionString,
            DatabaseName = databaseName
        };

        var options = Options.Create(settings);
        return new MongoDbContext(options);
    }

    public async Task InitializeAsync()
    {
        await _mongoDbContainer.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _mongoDbContainer.DisposeAsync();
    }
}
