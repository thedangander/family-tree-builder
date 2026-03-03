using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FamilyTree.Domain.Entities;

/// <summary>
/// Represents a family tree containing people and relationships.
/// </summary>
public class Tree
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("ownerId")]
    public string OwnerId { get; set; } = string.Empty;

    [BsonElement("isPublic")]
    public bool IsPublic { get; set; } = false;

    [BsonElement("sharedWith")]
    public List<TreeShare> SharedWith { get; set; } = new();

    [BsonElement("settings")]
    public TreeSettings Settings { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("rootPersonId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? RootPersonId { get; set; }
}

public class TreeShare
{
    [BsonElement("userId")]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("permission")]
    public TreePermission Permission { get; set; }

    [BsonElement("sharedAt")]
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}

public class TreeSettings
{
    [BsonElement("defaultLayout")]
    public TreeLayout DefaultLayout { get; set; } = TreeLayout.Hierarchical;

    [BsonElement("showPhotos")]
    public bool ShowPhotos { get; set; } = true;

    [BsonElement("showDates")]
    public bool ShowDates { get; set; } = true;

    [BsonElement("colorScheme")]
    public string ColorScheme { get; set; } = "default";

    [BsonElement("zoomLevel")]
    public double ZoomLevel { get; set; } = 1.0;

    [BsonElement("centerX")]
    public double CenterX { get; set; } = 0;

    [BsonElement("centerY")]
    public double CenterY { get; set; } = 0;
}

public enum TreePermission
{
    View = 1,
    Edit = 2,
    Admin = 3
}

public enum TreeLayout
{
    Hierarchical = 1,
    Radial = 2,
    ForceDirected = 3
}
