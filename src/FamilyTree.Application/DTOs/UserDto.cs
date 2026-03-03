using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.DTOs;

public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public bool IsActive { get; init; }
    public bool IsEmailVerified { get; init; }
    public List<string> Roles { get; init; } = new();
    public UserPreferencesDto Preferences { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

public record UserPreferencesDto
{
    public string Theme { get; init; } = "system";
    public string Language { get; init; } = "en";
    public string DateFormat { get; init; } = "yyyy-MM-dd";
    public bool EmailNotifications { get; init; } = true;
}

public static class UserMappingExtensions
{
    public static UserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        DisplayName = user.DisplayName,
        AvatarUrl = user.AvatarUrl,
        IsActive = user.IsActive,
        IsEmailVerified = user.IsEmailVerified,
        Roles = user.Roles,
        Preferences = user.Preferences.ToDto(),
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };

    public static UserPreferencesDto ToDto(this UserPreferences preferences) => new()
    {
        Theme = preferences.Theme,
        Language = preferences.Language,
        DateFormat = preferences.DateFormat,
        EmailNotifications = preferences.EmailNotifications
    };
}
