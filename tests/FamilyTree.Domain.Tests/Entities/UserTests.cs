using FluentAssertions;
using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Tests.Entities;

public class UserTests
{
    [Fact]
    public void User_ShouldBeCreatedWithDefaultValues()
    {
        // Arrange & Act
        var user = new User();

        // Assert
        user.Id.Should().BeNull();
        user.Email.Should().BeNull();
        user.DisplayName.Should().BeNull();
        user.CreatedAt.Should().Be(default);
        user.LastLoginAt.Should().BeNull();
    }

    [Fact]
    public void User_ShouldAcceptValidValues()
    {
        // Arrange
        var id = "user123";
        var email = "test@example.com";
        var displayName = "Test User";
        var createdAt = DateTime.UtcNow;
        var lastLoginAt = DateTime.UtcNow.AddHours(1);

        // Act
        var user = new User
        {
            Id = id,
            Email = email,
            DisplayName = displayName,
            CreatedAt = createdAt,
            LastLoginAt = lastLoginAt
        };

        // Assert
        user.Id.Should().Be(id);
        user.Email.Should().Be(email);
        user.DisplayName.Should().Be(displayName);
        user.CreatedAt.Should().Be(createdAt);
        user.LastLoginAt.Should().Be(lastLoginAt);
    }

    [Fact]
    public void User_LastLoginAt_CanBeNull()
    {
        // Arrange & Act
        var user = new User
        {
            Id = "user123",
            Email = "test@example.com",
            DisplayName = "New User",
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        user.LastLoginAt.Should().BeNull();
    }
}
