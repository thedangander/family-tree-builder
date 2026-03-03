using FluentAssertions;
using FamilyTree.Domain.Entities;
using FamilyTree.Infrastructure.Repositories;
using FamilyTree.Infrastructure.Tests.Fixtures;

namespace FamilyTree.Infrastructure.Tests.Repositories;

[Collection("MongoDB")]
public class TreeRepositoryTests
{
    private readonly MongoDbFixture _fixture;

    public TreeRepositoryTests(MongoDbFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"TreeTest_{Guid.NewGuid():N}");
        var repository = new TreeRepository(context);

        var tree = new Tree
        {
            OwnerId = "user123",
            Name = "My Family Tree",
            Description = "Test tree",
            IsPublic = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await repository.CreateAsync(tree);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeNullOrEmpty();
        result.Name.Should().Be("My Family Tree");
        result.OwnerId.Should().Be("user123");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingTree_ShouldReturnTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"TreeTest_{Guid.NewGuid():N}");
        var repository = new TreeRepository(context);

        var tree = new Tree
        {
            OwnerId = "user123",
            Name = "Test Tree",
            CreatedAt = DateTime.UtcNow
        };

        var created = await repository.CreateAsync(tree);

        // Act
        var result = await repository.GetByIdAsync(created.Id!);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
        result.Name.Should().Be("Test Tree");
    }

    [Fact]
    public async Task GetByOwnerIdAsync_ShouldReturnOwnersTrees()
    {
        // Arrange
        var context = _fixture.CreateContext($"TreeTest_{Guid.NewGuid():N}");
        var repository = new TreeRepository(context);
        var ownerId = "user789";

        var tree1 = new Tree { OwnerId = ownerId, Name = "Tree 1", CreatedAt = DateTime.UtcNow };
        var tree2 = new Tree { OwnerId = ownerId, Name = "Tree 2", CreatedAt = DateTime.UtcNow };
        var tree3 = new Tree { OwnerId = "other-user", Name = "Tree 3", CreatedAt = DateTime.UtcNow };

        await repository.CreateAsync(tree1);
        await repository.CreateAsync(tree2);
        await repository.CreateAsync(tree3);

        // Act
        var result = await repository.GetByOwnerIdAsync(ownerId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(t => t.Name == "Tree 1");
        result.Should().Contain(t => t.Name == "Tree 2");
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"TreeTest_{Guid.NewGuid():N}");
        var repository = new TreeRepository(context);

        var tree = new Tree
        {
            OwnerId = "user123",
            Name = "Original Name",
            CreatedAt = DateTime.UtcNow
        };

        var created = await repository.CreateAsync(tree);

        // Act
        created.Name = "Updated Name";
        created.IsPublic = true;
        created.UpdatedAt = DateTime.UtcNow;
        var updated = await repository.UpdateAsync(created);

        // Assert
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Updated Name");
        updated.IsPublic.Should().BeTrue();
        updated.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"TreeTest_{Guid.NewGuid():N}");
        var repository = new TreeRepository(context);

        var tree = new Tree
        {
            OwnerId = "user123",
            Name = "Tree to Delete",
            CreatedAt = DateTime.UtcNow
        };

        var created = await repository.CreateAsync(tree);

        // Act
        var deleted = await repository.DeleteAsync(created.Id!);
        var afterDelete = await repository.GetByIdAsync(created.Id!);

        // Assert
        deleted.Should().BeTrue();
        afterDelete.Should().BeNull();
    }
}
