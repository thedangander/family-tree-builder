using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FamilyTree.Domain.Entities;

/// <summary>
/// Represents a person in the family tree.
/// </summary>
public class Person
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("treeId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TreeId { get; set; } = string.Empty;

    [BsonElement("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [BsonElement("lastName")]
    public string LastName { get; set; } = string.Empty;

    [BsonElement("maidenName")]
    public string? MaidenName { get; set; }

    [BsonElement("gender")]
    public Gender Gender { get; set; }

    [BsonElement("dateOfBirth")]
    public DateTime? DateOfBirth { get; set; }

    [BsonElement("dateOfDeath")]
    public DateTime? DateOfDeath { get; set; }

    [BsonElement("placeOfBirth")]
    public string? PlaceOfBirth { get; set; }

    [BsonElement("placeOfDeath")]
    public string? PlaceOfDeath { get; set; }

    [BsonElement("biography")]
    public string? Biography { get; set; }

    [BsonElement("photoUrl")]
    public string? PhotoUrl { get; set; }

    [BsonElement("occupation")]
    public string? Occupation { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("phone")]
    public string? Phone { get; set; }

    [BsonElement("address")]
    public Address? Address { get; set; }

    [BsonElement("customFields")]
    public Dictionary<string, string> CustomFields { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Graph positioning for visualization
    [BsonElement("positionX")]
    public double PositionX { get; set; }

    [BsonElement("positionY")]
    public double PositionY { get; set; }

    public string FullName => $"{FirstName} {LastName}";

    public bool IsAlive => DateOfDeath == null;

    public int? Age
    {
        get
        {
            if (DateOfBirth == null) return null;
            var endDate = DateOfDeath ?? DateTime.UtcNow;
            var age = endDate.Year - DateOfBirth.Value.Year;
            if (endDate.DayOfYear < DateOfBirth.Value.DayOfYear) age--;
            return age;
        }
    }
}

public class Address
{
    [BsonElement("street")]
    public string? Street { get; set; }

    [BsonElement("city")]
    public string? City { get; set; }

    [BsonElement("state")]
    public string? State { get; set; }

    [BsonElement("country")]
    public string? Country { get; set; }

    [BsonElement("postalCode")]
    public string? PostalCode { get; set; }
}

public enum Gender
{
    Unknown = 0,
    Male = 1,
    Female = 2,
    Other = 3
}
