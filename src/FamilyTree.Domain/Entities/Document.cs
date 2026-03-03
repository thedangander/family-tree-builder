using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FamilyTree.Domain.Entities;

/// <summary>
/// Represents an attached document (birth cert, marriage cert, etc.)
/// </summary>
public class Document
{
    [BsonElement("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("documentType")]
    public DocumentType DocumentType { get; set; }

    [BsonElement("fileUrl")]
    public string FileUrl { get; set; } = string.Empty;

    [BsonElement("mimeType")]
    public string? MimeType { get; set; }

    [BsonElement("fileSize")]
    public long? FileSize { get; set; }

    [BsonElement("uploadedAt")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public enum DocumentType
{
    Other = 0,
    BirthCertificate = 1,
    DeathCertificate = 2,
    MarriageCertificate = 3,
    DivorceCertificate = 4,
    Photo = 5,
    Letter = 6,
    WillTestament = 7,
    MilitaryRecord = 8,
    ImmigrationRecord = 9,
    Census = 10,
}
