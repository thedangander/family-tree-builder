using FluentAssertions;
using NSubstitute;
using FamilyTree.Application.Trees.Commands;
using FamilyTree.Domain.Entities;
using FamilyTree.Domain.Repositories;

namespace FamilyTree.Application.Tests.Trees.Commands;

public class CreateTreeCommandHandlerTests
{
    private readonly ITreeRepository _treeRepository;

    public CreateTreeCommandHandlerTests()
    {
        _treeRepository = Substitute.For<ITreeRepository>();
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateTree()
    {
        // Arrange
        var command = new CreateTreeCommand(
            OwnerId: "user123",
            Name: "My Family Tree",
            Description: "A test family tree",
            IsPublic: false
        );

        _treeRepository.CreateAsync(Arg.Any<Tree>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var tree = callInfo.Arg<Tree>();
                tree.Id = "generated-tree-id";
                return tree;
            });

        // Act
        var result = await CreateTreeCommandHandler.Handle(command, _treeRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.Name.Should().Be("My Family Tree");
        result.Value.OwnerId.Should().Be("user123");
        result.Value.IsPublic.Should().BeFalse();

        await _treeRepository.Received(1).CreateAsync(Arg.Any<Tree>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithPublicTree_ShouldSetIsPublicTrue()
    {
        // Arrange
        var command = new CreateTreeCommand(
            OwnerId: "user123",
            Name: "Public Tree",
            Description: null,
            IsPublic: true
        );

        _treeRepository.CreateAsync(Arg.Any<Tree>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<Tree>());

        // Act
        var result = await CreateTreeCommandHandler.Handle(command, _treeRepository);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.IsPublic.Should().BeTrue();
    }
}
