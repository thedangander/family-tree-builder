using FluentAssertions;
using NSubstitute;
using FamilyTree.Application.Relationships.Commands;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Repositories;

namespace FamilyTree.Application.Tests.Relationships.Commands;

public class CreateRelationshipCommandHandlerTests
{
    private readonly IRelationshipRepository _relationshipRepository;

    public CreateRelationshipCommandHandlerTests()
    {
        _relationshipRepository = Substitute.For<IRelationshipRepository>();
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateRelationship()
    {
        // Arrange
        var command = new CreateRelationshipCommand(
            TreeId: "tree123",
            FromPersonId: "person1",
            ToPersonId: "person2",
            Type: RelationshipType.Parent
        );

        _relationshipRepository.CreateAsync(Arg.Any<Relationship>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var rel = callInfo.Arg<Relationship>();
                rel.Id = "generated-rel-id";
                return rel;
            });

        // Act
        var result = await CreateRelationshipCommandHandler.Handle(command, _relationshipRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.FromPersonId.Should().Be("person1");
        result.Value.ToPersonId.Should().Be("person2");
        result.Value.Type.Should().Be(RelationshipType.Parent);

        await _relationshipRepository.Received(1).CreateAsync(Arg.Any<Relationship>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData(RelationshipType.Parent)]
    [InlineData(RelationshipType.Spouse)]
    public async Task Handle_WithDifferentRelationshipTypes_ShouldCreateSuccessfully(RelationshipType type)
    {
        // Arrange
        var command = new CreateRelationshipCommand(
            TreeId: "tree123",
            FromPersonId: "person1",
            ToPersonId: "person2",
            Type: type
        );

        _relationshipRepository.CreateAsync(Arg.Any<Relationship>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<Relationship>());

        // Act
        var result = await CreateRelationshipCommandHandler.Handle(command, _relationshipRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.Type.Should().Be(type);
    }
}
