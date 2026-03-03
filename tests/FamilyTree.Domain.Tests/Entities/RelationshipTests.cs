using FluentAssertions;
using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Tests.Entities;

public class RelationshipTests
{
    [Fact]
    public void Relationship_ShouldBeCreatedWithDefaultValues()
    {
        // Arrange & Act
        var relationship = new Relationship();

        // Assert
        relationship.Id.Should().BeNull();
        relationship.TreeId.Should().BeNull();
        relationship.FromPersonId.Should().BeNull();
        relationship.ToPersonId.Should().BeNull();
        relationship.Type.Should().Be(default(RelationshipType));
    }

    [Fact]
    public void Relationship_ShouldAcceptValidValues()
    {
        // Arrange
        var id = "rel123";
        var treeId = "tree456";
        var fromPersonId = "person1";
        var toPersonId = "person2";
        var type = RelationshipType.Parent;

        // Act
        var relationship = new Relationship
        {
            Id = id,
            TreeId = treeId,
            FromPersonId = fromPersonId,
            ToPersonId = toPersonId,
            Type = type
        };

        // Assert
        relationship.Id.Should().Be(id);
        relationship.TreeId.Should().Be(treeId);
        relationship.FromPersonId.Should().Be(fromPersonId);
        relationship.ToPersonId.Should().Be(toPersonId);
        relationship.Type.Should().Be(RelationshipType.Parent);
    }

    [Theory]
    [InlineData(RelationshipType.Parent)]
    [InlineData(RelationshipType.Spouse)]
    public void Relationship_ShouldSupportAllRelationshipTypes(RelationshipType type)
    {
        // Arrange & Act
        var relationship = new Relationship { Type = type };

        // Assert
        relationship.Type.Should().Be(type);
    }

    [Fact]
    public void RelationshipType_ShouldHaveExpectedValues()
    {
        // Assert
        Enum.GetValues<RelationshipType>().Should().HaveCount(2);
        Enum.IsDefined(RelationshipType.Parent).Should().BeTrue();
        Enum.IsDefined(RelationshipType.Spouse).Should().BeTrue();
    }
}
