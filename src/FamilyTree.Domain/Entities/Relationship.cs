using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FamilyTree.Domain.Entities;

/// <summary>
/// Represents a relationship between two people in the family tree.
/// </summary>
public class Relationship
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("treeId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TreeId { get; set; } = string.Empty;

    [BsonElement("fromPersonId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string FromPersonId { get; set; } = string.Empty;

    [BsonElement("toPersonId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ToPersonId { get; set; } = string.Empty;

    [BsonElement("relationshipType")]
    public RelationshipType RelationshipType { get; set; }

    [BsonElement("startDate")]
    public DateTime? StartDate { get; set; }

    [BsonElement("endDate")]
    public DateTime? EndDate { get; set; }

    [BsonElement("notes")]
    public string? Notes { get; set; }

    [BsonElement("documents")]
    public List<Document> Documents { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum RelationshipType
{
    Parent = 1,
    Spouse = 10,
}
