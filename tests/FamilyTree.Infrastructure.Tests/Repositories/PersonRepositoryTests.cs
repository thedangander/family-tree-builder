using FluentAssertions;
using FamilyTree.Domain.Entities;
using FamilyTree.Infrastructure.Repositories;
using FamilyTree.Infrastructure.Tests.Fixtures;

namespace FamilyTree.Infrastructure.Tests.Repositories;

[Collection("MongoDB")]
public class PersonRepositoryTests
{
    private readonly MongoDbFixture _fixture;

    public PersonRepositoryTests(MongoDbFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAsync_ShouldCreatePerson()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);

        var person = new Person
        {
            TreeId = "tree123",
            FirstName = "John",
            LastName = "Doe",
            Gender = Gender.Male,
            DateOfBirth = new DateTime(1980, 5, 15),
            PositionX = 100,
            PositionY = 200
        };

        // Act
        var result = await repository.CreateAsync(person);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().NotBeNullOrEmpty();
        result.FirstName.Should().Be("John");
        result.LastName.Should().Be("Doe");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingPerson_ShouldReturnPerson()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);

        var person = new Person
        {
            TreeId = "tree123",
            FirstName = "Jane",
            LastName = "Smith",
            Gender = Gender.Female
        };

        var created = await repository.CreateAsync(person);

        // Act
        var result = await repository.GetByIdAsync(created.Id!);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(created.Id);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingPerson_ShouldReturnNull()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);

        // Act
        var result = await repository.GetByIdAsync("non-existing-id");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTreeIdAsync_ShouldReturnAllPersonsInTree()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);
        var treeId = "tree456";

        var person1 = new Person { TreeId = treeId, FirstName = "John", LastName = "Doe" };
        var person2 = new Person { TreeId = treeId, FirstName = "Jane", LastName = "Doe" };
        var person3 = new Person { TreeId = "other-tree", FirstName = "Bob", LastName = "Smith" };

        await repository.CreateAsync(person1);
        await repository.CreateAsync(person2);
        await repository.CreateAsync(person3);

        // Act
        var result = await repository.GetByTreeIdAsync(treeId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(p => p.FirstName == "John");
        result.Should().Contain(p => p.FirstName == "Jane");
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdatePerson()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);

        var person = new Person
        {
            TreeId = "tree123",
            FirstName = "John",
            LastName = "Doe"
        };

        var created = await repository.CreateAsync(person);

        // Act
        created.FirstName = "Johnny";
        created.Notes = "Updated notes";
        var updated = await repository.UpdateAsync(created);

        // Assert
        updated.Should().NotBeNull();
        updated!.FirstName.Should().Be("Johnny");
        updated.Notes.Should().Be("Updated notes");
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemovePerson()
    {
        // Arrange
        var context = _fixture.CreateContext($"PersonTest_{Guid.NewGuid():N}");
        var repository = new PersonRepository(context);

        var person = new Person
        {
            TreeId = "tree123",
            FirstName = "John",
            LastName = "Doe"
        };

        var created = await repository.CreateAsync(person);

        // Act
        var deleted = await repository.DeleteAsync(created.Id!);
        var afterDelete = await repository.GetByIdAsync(created.Id!);

        // Assert
        deleted.Should().BeTrue();
        afterDelete.Should().BeNull();
    }
}
