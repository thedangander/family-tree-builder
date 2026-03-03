using FluentAssertions;
using FamilyTree.Domain.Entities;
using FamilyTree.Infrastructure.Repositories;
using FamilyTree.Infrastructure.Tests.Fixtures;

namespace FamilyTree.Infrastructure.Tests.Repositories;

[Collection("MongoDB")]
public class RelationshipRepositoryTests
{
    private readonly MongoDbFixture _fixture;

    public RelationshipRepositoryTests(MongoDbFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateRelationship()
    {
        // Arrange
        var context = _fixture.CreateContext($"RelTest_{Guid.NewGuid():N}");
        var repository = new RelationshipRepository(context);

        var relationship = new Relationship
        {
            TreeId = "tree123",
            FromPersonId = "person1",
            ToPersonId = "person2",
            Type = RelationshipType.Parent
        };

        // Act
        var result = await repository.CreateAsync(relationship);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeNullOrEmpty();
        result.FromPersonId.Should().Be("person1");
        result.ToPersonId.Should().Be("person2");
        result.Type.Should().Be(RelationshipType.Parent);
    }

    [Fact]
    public async Task GetByTreeIdAsync_ShouldReturnAllRelationshipsInTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"RelTest_{Guid.NewGuid():N}");
        var repository = new RelationshipRepository(context);
        var treeId = "tree456";

        var rel1 = new Relationship { TreeId = treeId, FromPersonId = "p1", ToPersonId = "p2", Type = RelationshipType.Parent };
        var rel2 = new Relationship { TreeId = treeId, FromPersonId = "p2", ToPersonId = "p3", Type = RelationshipType.Spouse };
        var rel3 = new Relationship { TreeId = "other-tree", FromPersonId = "p4", ToPersonId = "p5", Type = RelationshipType.Spouse };

        await repository.CreateAsync(rel1);
        await repository.CreateAsync(rel2);
        await repository.CreateAsync(rel3);

        // Act
        var result = await repository.GetByTreeIdAsync(treeId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByPersonIdAsync_ShouldReturnRelationshipsInvolvingPerson()
    {
        // Arrange
        var context = _fixture.CreateContext($"RelTest_{Guid.NewGuid():N}");
        var repository = new RelationshipRepository(context);
        var personId = "person1";

        var rel1 = new Relationship { TreeId = "tree1", FromPersonId = personId, ToPersonId = "person2", Type = RelationshipType.Parent };
        var rel2 = new Relationship { TreeId = "tree1", FromPersonId = "person3", ToPersonId = personId, Type = RelationshipType.Parent };
        var rel3 = new Relationship { TreeId = "tree1", FromPersonId = "person4", ToPersonId = "person5", Type = RelationshipType.Spouse };

        await repository.CreateAsync(rel1);
        await repository.CreateAsync(rel2);
        await repository.CreateAsync(rel3);

        // Act
        var result = await repository.GetByPersonIdAsync(personId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(r => r.FromPersonId == personId || r.ToPersonId == personId);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveRelationship()
    {
        // Arrange
        var context = _fixture.CreateContext($"RelTest_{Guid.NewGuid():N}");
        var repository = new RelationshipRepository(context);

        var relationship = new Relationship
        {
            TreeId = "tree123",
            FromPersonId = "person1",
            ToPersonId = "person2",
            Type = RelationshipType.Spouse
        };

        var created = await repository.CreateAsync(relationship);

        // Act
        var deleted = await repository.DeleteAsync(created.Id!);
        var result = await repository.GetByTreeIdAsync("tree123");

        // Assert
        deleted.Should().BeTrue();
        result.Should().BeEmpty();
    }

    [Theory]
    [InlineData(RelationshipType.Parent)]
    [InlineData(RelationshipType.Spouse)]
    public async Task CreateAsync_ShouldSupportAllRelationshipTypes(RelationshipType type)
    {
        // Arrange
        var context = _fixture.CreateContext($"RelTest_{Guid.NewGuid():N}");
        var repository = new RelationshipRepository(context);

        var relationship = new Relationship
        {
            TreeId = "tree123",
            FromPersonId = "person1",
            ToPersonId = "person2",
            Type = type
        };

        // Act
        var result = await repository.CreateAsync(relationship);

        // Assert
        result.Should().NotBeNull();
        result.Type.Should().Be(type);
    }
}
