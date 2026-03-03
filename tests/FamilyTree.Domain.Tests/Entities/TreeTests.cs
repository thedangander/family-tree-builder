using FluentAssertions;
using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Tests.Entities;

public class TreeTests
{
    [Fact]
    public void Tree_ShouldBeCreatedWithDefaultValues()
    {
        // Arrange & Act
        var tree = new Tree();

        // Assert
        tree.Id.Should().BeNull();
        tree.OwnerId.Should().BeNull();
        tree.Name.Should().BeNull();
        tree.Description.Should().BeNull();
        tree.IsPublic.Should().BeFalse();
        tree.CreatedAt.Should().Be(default);
        tree.UpdatedAt.Should().BeNull();
        tree.Settings.Should().BeNull();
    }

    [Fact]
    public void Tree_ShouldAcceptValidValues()
    {
        // Arrange
        var id = "tree123";
        var ownerId = "user456";
        var name = "Family Tree";
        var description = "My family history";
        var isPublic = true;
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddDays(1);
        var settings = new TreeSettings
        {
            DefaultNodeColor = "#3498db",
            DefaultEdgeColor = "#2c3e50",
            LayoutDirection = "TB"
        };

        // Act
        var tree = new Tree
        {
            Id = id,
            OwnerId = ownerId,
            Name = name,
            Description = description,
            IsPublic = isPublic,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            Settings = settings
        };

        // Assert
        tree.Id.Should().Be(id);
        tree.OwnerId.Should().Be(ownerId);
        tree.Name.Should().Be(name);
        tree.Description.Should().Be(description);
        tree.IsPublic.Should().BeTrue();
        tree.CreatedAt.Should().Be(createdAt);
        tree.UpdatedAt.Should().Be(updatedAt);
        tree.Settings.Should().NotBeNull();
        tree.Settings!.DefaultNodeColor.Should().Be("#3498db");
        tree.Settings.DefaultEdgeColor.Should().Be("#2c3e50");
        tree.Settings.LayoutDirection.Should().Be("TB");
    }

    [Fact]
    public void Tree_PrivateByDefault()
    {
        // Arrange & Act
        var tree = new Tree
        {
            Name = "Private Tree",
            OwnerId = "user123"
        };

        // Assert
        tree.IsPublic.Should().BeFalse();
    }
}
