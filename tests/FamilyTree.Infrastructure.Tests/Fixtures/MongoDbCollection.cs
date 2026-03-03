using Xunit;

namespace FamilyTree.Infrastructure.Tests.Fixtures;

[CollectionDefinition("MongoDB")]
public class MongoDbCollection : ICollectionFixture<MongoDbFixture>
{
}
