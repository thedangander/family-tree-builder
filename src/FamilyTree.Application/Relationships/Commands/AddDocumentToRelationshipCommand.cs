using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Relationships.Commands;

/// <summary>
/// Command to add a document to a relationship.
/// </summary>
public record AddDocumentToRelationshipCommand(
    string RelationshipId,
    string Name,
    string? Description,
    DocumentType DocumentType,
    string FileUrl,
    string? MimeType,
    long? FileSize
);
