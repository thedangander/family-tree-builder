using FluentAssertions;
using NSubstitute;
using FamilyTree.Application.Persons.Queries;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Repositories;

namespace FamilyTree.Application.Tests.Persons.Queries;

public class GetPersonQueryHandlerTests
{
    private readonly IPersonRepository _personRepository;

    public GetPersonQueryHandlerTests()
    {
        _personRepository = Substitute.For<IPersonRepository>();
    }

    [Fact]
    public async Task Handle_WithExistingPerson_ShouldReturnPerson()
    {
        // Arrange
        var personId = "person123";
        var query = new GetPersonQuery(personId);

        var person = new Person
        {
            Id = personId,
            TreeId = "tree123",
            FirstName = "John",
            LastName = "Doe",
            Gender = Gender.Male
        };

        _personRepository.GetByIdAsync(personId, Arg.Any<CancellationToken>())
            .Returns(person);

        // Act
        var result = await GetPersonQueryHandler.Handle(query, _personRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Id.Should().Be(personId);
        result.Value.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task Handle_WithNonExistingPerson_ShouldReturnFailure()
    {
        // Arrange
        var query = new GetPersonQuery("non-existing-id");

        _personRepository.GetByIdAsync("non-existing-id", Arg.Any<CancellationToken>())
            .Returns((Person?)null);

        // Act
        var result = await GetPersonQueryHandler.Handle(query, _personRepository);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("not found");
    }
}
