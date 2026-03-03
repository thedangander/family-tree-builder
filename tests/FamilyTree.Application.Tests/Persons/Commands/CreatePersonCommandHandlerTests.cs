using FluentAssertions;
using NSubstitute;
using FamilyTree.Application.Persons.Commands;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Repositories;

namespace FamilyTree.Application.Tests.Persons.Commands;

public class CreatePersonCommandHandlerTests
{
    private readonly IPersonRepository _personRepository;

    public CreatePersonCommandHandlerTests()
    {
        _personRepository = Substitute.For<IPersonRepository>();
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreatePerson()
    {
        // Arrange
        var command = new CreatePersonCommand(
            TreeId: "tree123",
            FirstName: "John",
            LastName: "Doe",
            Gender: Gender.Male,
            DateOfBirth: new DateTime(1980, 5, 15),
            DateOfDeath: null,
            BirthPlace: "New York",
            Notes: "Test notes",
            PhotoUrl: null,
            PositionX: 100,
            PositionY: 200
        );

        _personRepository.CreateAsync(Arg.Any<Person>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var person = callInfo.Arg<Person>();
                person.Id = "generated-id";
                return person;
            });

        // Act
        var result = await CreatePersonCommandHandler.Handle(command, _personRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.FirstName.Should().Be("John");
        result.Value.LastName.Should().Be("Doe");
        result.Value.TreeId.Should().Be("tree123");

        await _personRepository.Received(1).CreateAsync(Arg.Any<Person>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenRepositoryThrows_ShouldReturnFailure()
    {
        // Arrange
        var command = new CreatePersonCommand(
            TreeId: "tree123",
            FirstName: "John",
            LastName: "Doe",
            Gender: Gender.Male,
            DateOfBirth: null,
            DateOfDeath: null,
            BirthPlace: null,
            Notes: null,
            PhotoUrl: null,
            PositionX: 0,
            PositionY: 0
        );

        _personRepository.CreateAsync(Arg.Any<Person>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await CreatePersonCommandHandler.Handle(command, _personRepository);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Database error");
    }
}
