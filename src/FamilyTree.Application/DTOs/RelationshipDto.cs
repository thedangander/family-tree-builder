using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.DTOs;

public record DocumentDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DocumentType DocumentType { get; init; }
    public string FileUrl { get; init; } = string.Empty;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
    public DateTime UploadedAt { get; init; }
}

public record RelationshipDto
{
    public string Id { get; init; } = string.Empty;
    public string TreeId { get; init; } = string.Empty;
    public string FromPersonId { get; init; } = string.Empty;
    public string ToPersonId { get; init; } = string.Empty;
    public RelationshipType RelationshipType { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Notes { get; init; }
    public List<DocumentDto> Documents { get; init; } = new();
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public static class RelationshipMappingExtensions
{
    public static DocumentDto ToDto(this Document document) => new()
    {
        Id = document.Id,
        Name = document.Name,
        Description = document.Description,
        DocumentType = document.DocumentType,
        FileUrl = document.FileUrl,
        MimeType = document.MimeType,
        FileSize = document.FileSize,
        UploadedAt = document.UploadedAt
    };

    public static RelationshipDto ToDto(this Relationship relationship) => new()
    {
        Id = relationship.Id,
        TreeId = relationship.TreeId,
        FromPersonId = relationship.FromPersonId,
        ToPersonId = relationship.ToPersonId,
        RelationshipType = relationship.RelationshipType,
        StartDate = relationship.StartDate,
        EndDate = relationship.EndDate,
        Notes = relationship.Notes,
        Documents = relationship.Documents.Select(d => d.ToDto()).ToList(),
        CreatedAt = relationship.CreatedAt,
        UpdatedAt = relationship.UpdatedAt
    };
}
