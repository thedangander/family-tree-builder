using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FamilyTree.Domain.Entities;

/// <summary>
/// Represents a user of the family tree application.
/// </summary>
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [BsonElement("avatarUrl")]
    public string? AvatarUrl { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("isEmailVerified")]
    public bool IsEmailVerified { get; set; } = false;

    [BsonElement("roles")]
    public List<string> Roles { get; set; } = new() { "User" };

    [BsonElement("preferences")]
    public UserPreferences Preferences { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("lastLoginAt")]
    public DateTime? LastLoginAt { get; set; }
}

public class UserPreferences
{
    [BsonElement("theme")]
    public string Theme { get; set; } = "system";

    [BsonElement("language")]
    public string Language { get; set; } = "en";

    [BsonElement("dateFormat")]
    public string DateFormat { get; set; } = "yyyy-MM-dd";

    [BsonElement("emailNotifications")]
    public bool EmailNotifications { get; set; } = true;
}
